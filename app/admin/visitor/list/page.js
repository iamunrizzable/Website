'use client';

import './page.css';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { parseUserAgent } from '@/lib/deviceSignals';
import { renderStaticMap } from '@/lib/staticMap';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '2px solid rgba(168,85,247,0.25)', animation: 'borderGlow 3s ease-in-out infinite' },
  input: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box', marginBottom: 16 },
  row: { padding: '12px 0', borderBottom: '1px solid #334155', cursor: 'pointer' },
  visitorId: { fontFamily: 'monospace', fontSize: 13, color: '#e2e8f0', wordBreak: 'break-all' },
  metaLine: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  countBadge: { display: 'inline-block', background: 'rgba(168,85,247,0.15)', color: '#d4a5ff', border: '1px solid rgba(168,85,247,0.4)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700, marginLeft: 8 },
  warnBanner: { background: '#3f1d1d', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fca5a5', lineHeight: 1.5 },
  msg: { fontSize: 12, color: '#f59e0b', marginBottom: 8, minHeight: 18 },
  btnGhost: { background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  detailPanel: { marginTop: 10, padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155', fontFamily: 'system-ui,sans-serif' },
  detailLabel: { color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 3 },
  detailValue: { color: '#e2e8f0', fontSize: 13, fontWeight: 600 },
  detailSub: { color: '#94a3b8', fontSize: 12 },
  caveat: { color: '#f59e0b', fontSize: 11, lineHeight: 1.6, marginTop: 4, fontStyle: 'italic' },
  jsonBlock: { background: '#000', color: '#0f0', fontFamily: 'monospace', fontSize: 11, padding: 10, borderRadius: 6, marginTop: 8, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 300, overflowY: 'auto' },
};

function formatWhen(iso) {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'Unknown' : d.toLocaleString();
}

function formatLocation(loc) {
  if (!loc) return null;
  const parts = [loc.city, loc.region, loc.country].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

// Just the first 8 chars — a glance-length label, not a unique key. The
// full ID (whichever one is being shown) is still copyable in the
// detail panel below.
function shortId(id) {
  return id.slice(0, 8);
}

export default function VisitorListPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [redisConfigured, setRedisConfigured] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [query, setQuery] = useState('');
  const [msg, setMsg] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showJson, setShowJson] = useState({});

  const toggleExpanded = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const toggleJson = (id) => setShowJson((prev) => ({ ...prev, [id]: !prev[id] }));

  const fetchVisitors = useCallback(async (key) => {
    try {
      const res = await fetch('/api/admin/visitors', { headers: { 'x-admin-key': key } });
      if (res.status === 401) { localStorage.removeItem('admin_key'); return; }
      const data = await res.json();
      setVisitors(data.visitors ?? []);
      setRedisConfigured(!!data.redisConfigured);
      localStorage.setItem('admin_key', key);
    } catch (e) {
      setMsg('Failed to load visitors: ' + e.message);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('admin_key');
    if (saved) {
      setAdminKey(saved);
      fetchVisitors(saved);
    } else {
      fetch('/api/admin/me')
        .then(r => r.json())
        .then(({ key }) => { if (key) { setAdminKey(key); fetchVisitors(key); } })
        .catch(() => {});
    }
  }, [fetchVisitors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visitors;
    return visitors.filter((v) => {
      const loc = formatLocation(v.lastLocation)?.toLowerCase() ?? '';
      return v.id.toLowerCase().includes(q)
        || (v.visitorId ?? '').toLowerCase().includes(q)
        || (v.lastIp ?? '').includes(q)
        || loc.includes(q);
    });
  }, [visitors, query]);

  // Only Identification/Client/Location are shown — unlike /admin/security's
  // detail view, a plain visitor-history record never gets ASN/Smart
  // Signals/Suspect Score/Velocity enrichment (lib/tokens.js only computes
  // that for near-misses and bans, never for ordinary allowed visits), so
  // there's nothing there to show, not a missing feature.
  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setMsg('Copied to clipboard.');
      setTimeout(() => setMsg(''), 2000);
    }).catch(() => {});
  };

  const renderDetail = (v) => {
    const { browser, os, device } = parseUserAgent(v.lastUserAgent);
    const loc = v.lastLocation;
    const location = formatLocation(loc);

    return (
      <div style={s.detailPanel}>
        <div style={s.detailLabel}>Identification</div>
        <div style={s.detailSub}>Fingerprint</div>
        <div style={{ ...s.detailValue, fontFamily: 'monospace', fontWeight: 400, wordBreak: 'break-all' }}>
          {v.visitorId ?? '—'}
        </div>
        {v.visitorId && (
          <button
            style={{ ...s.btnGhost, marginTop: 4 }}
            onClick={(e) => { e.stopPropagation(); copyToClipboard(v.visitorId); }}
          >
            Copy fingerprint
          </button>
        )}

        <div style={{ ...s.detailSub, marginTop: 10 }}>
          Device marker (this row&apos;s actual unique key — see below)
        </div>
        <div style={{ ...s.detailValue, fontFamily: 'monospace', fontWeight: 400, wordBreak: 'break-all' }}>
          {v.persistentMarker ?? v.id}
        </div>
        <button
          style={{ ...s.btnGhost, marginTop: 4 }}
          onClick={(e) => { e.stopPropagation(); copyToClipboard(v.persistentMarker ?? v.id); }}
        >
          Copy device marker
        </button>
        <p style={s.caveat}>
          Two different phones of the same model/OS/browser can share this fingerprint — it&apos;s
          used for ban-matching after a device clears storage, not as the unique row identity.
          The device marker above is what actually distinguishes this row from another visitor.
        </p>

        <div style={{ ...s.detailSub, marginTop: 8 }}>
          First seen {formatWhen(v.firstSeenAt)} · Last seen {formatWhen(v.lastSeenAt)} · {v.visitCount ?? 1} visit{(v.visitCount ?? 1) === 1 ? '' : 's'}
        </div>

        <div style={s.detailLabel}>Client</div>
        <div style={s.detailValue}>{browser} · {os} · {device}</div>
        {v.lastIp && (
          <div style={s.detailSub}>{v.lastIp}</div>
        )}

        <div style={s.detailLabel}>Location</div>
        {loc ? (
          <>
            <div style={s.detailValue}>{location ?? 'Unknown'}</div>
            <div style={s.detailSub}>{loc.postalCode ?? '—'} · {loc.timezone ?? '—'}</div>
            {loc.lat && loc.lon && (
              <>
                {renderStaticMap(loc.lat, loc.lon)}
                <a
                  href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lon}#map=12/${loc.lat}/${loc.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#a855f7', fontSize: 12, display: 'inline-block', marginTop: 6 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Open larger interactive map →
                </a>
              </>
            )}
          </>
        ) : <div style={s.detailSub}>Unknown</div>}

        <button
          style={{ ...s.btnGhost, marginTop: 14 }}
          onClick={(e) => { e.stopPropagation(); toggleJson(v.id); }}
        >
          {showJson[v.id] ? 'Hide JSON' : 'Show JSON'}
        </button>
        {showJson[v.id] && <pre style={s.jsonBlock}>{JSON.stringify(v, null, 2)}</pre>}
      </div>
    );
  };

  return (
    <>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <div style={s.page}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 4, animation: 'glowPulse 3s ease-in-out infinite' }}>
            Site Visitors
          </h1>
          <p style={{ color: '#06b6d4', fontSize: 13, marginBottom: 20 }}>
            Every device the site has identified, banned or not. Retained on a rolling 90-day window since last visit.
          </p>

          {!redisConfigured && (
            <div style={s.warnBanner}>
              <strong>Storage is not actually configured yet.</strong> No Redis connection is
              configured on this deployment — without one, this list resets on every cold
              start and only reflects recent traffic to whichever serverless instance handled
              it. Reconnect the Redis database to this project in Vercel (Storage → your
              Redis database → Connect to Project), then redeploy.
            </div>
          )}

          <div style={s.card}>
            <input
              style={s.input}
              placeholder="Search by visitor ID, IP, or location…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div style={s.msg}>{msg}</div>

            {filtered.length === 0 && (
              <p style={{ color: '#64748b', fontSize: 13 }}>
                {visitors.length === 0 ? 'No visitors recorded yet.' : 'No visitors match that search.'}
              </p>
            )}

            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              {filtered.map((v) => {
                const { browser, os, device } = parseUserAgent(v.lastUserAgent);
                const location = formatLocation(v.lastLocation);
                const isExpanded = expandedId === v.id;
                return (
                  <div key={v.id} style={s.row} onClick={() => toggleExpanded(v.id)}>
                    <div style={s.visitorId}>
                      {shortId(v.visitorId ?? v.id)}
                      <span style={s.countBadge}>{v.visitCount ?? 1} visit{(v.visitCount ?? 1) === 1 ? '' : 's'}</span>
                    </div>
                    <div style={s.metaLine}>First seen {formatWhen(v.firstSeenAt)} · Last seen {formatWhen(v.lastSeenAt)}</div>
                    <div style={s.metaLine}>
                      {browser} on {os} ({device}){v.lastIp ? ` · ${v.lastIp}` : ''}{location ? ` · ${location}` : ''}
                    </div>
                    {isExpanded && renderDetail(v)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
