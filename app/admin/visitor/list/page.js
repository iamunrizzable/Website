'use client';

import './page.css';

import { Fragment, useEffect, useState, useCallback, useMemo } from 'react';
import { parseUserAgent } from '@/lib/deviceSignals';
import { renderStaticMap } from '@/lib/staticMap';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '2px solid rgba(168,85,247,0.25)', animation: 'borderGlow 3s ease-in-out infinite' },
  input: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box', marginBottom: 16 },
  warnBanner: { background: '#3f1d1d', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fca5a5', lineHeight: 1.5 },
  msg: { fontSize: 12, color: '#f59e0b', marginBottom: 8, minHeight: 18 },
  btnGhost: { background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  btnDanger: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  btnDangerGhost: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  bannedBadge: { display: 'inline-block', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700, marginLeft: 8 },
  allowedBadge: { display: 'inline-block', background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 },
  detailPanel: { marginTop: 10, padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155', fontFamily: 'system-ui,sans-serif' },
  detailLabel: { color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 3 },
  detailValue: { color: '#e2e8f0', fontSize: 13, fontWeight: 600 },
  detailSub: { color: '#94a3b8', fontSize: 12 },
  caveat: { color: '#f59e0b', fontSize: 11, lineHeight: 1.6, marginTop: 4, fontStyle: 'italic' },
  jsonBlock: { background: '#000', color: '#0f0', fontFamily: 'monospace', fontSize: 11, padding: 10, borderRadius: 6, marginTop: 8, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 300, overflowY: 'auto' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 },
  badgeOn: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' },
  badgeOff: { background: 'rgba(100,116,139,0.15)', color: '#64748b', border: '1px solid rgba(100,116,139,0.3)' },
  scoreBarTrack: { width: '100%', maxWidth: 240, height: 8, background: '#1e293b', borderRadius: 999, overflow: 'hidden', marginTop: 6 },
};

const suspectColor = (label) => (label === 'High' ? '#ef4444' : label === 'Medium' ? '#f59e0b' : '#22c55e');

function formatWhen(iso) {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'Unknown' : d.toLocaleString();
}

// Short form for the dense table columns — the full timestamp is still
// available in the expanded detail panel via formatWhen above.
function formatDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
}

function formatLocation(loc) {
  if (!loc) return null;
  const parts = [loc.city, loc.region, loc.country].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
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
  const [bannedMap, setBannedMap] = useState(new Map());
  const [banning, setBanning] = useState(null);
  const [unbanning, setUnbanning] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const toggleExpanded = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const toggleJson = (id) => setShowJson((prev) => ({ ...prev, [id]: !prev[id] }));

  // Maps visitorId/persistentMarker -> banId, not just a Set, because
  // unbanning needs the actual banId (removeBlockedDevice's key) and this
  // is the only place that ID is available on this page.
  const getBanId = (v) => bannedMap.get(v.visitorId) ?? bannedMap.get(v.persistentMarker ?? v.id);
  const isBanned = (v) => getBanId(v) !== undefined;

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

  // Ban status has to be read back from the actual blocklist (the same
  // source /admin/security uses), not just remembered in local state —
  // local-only state reset to {} on every reload, which made a ban that
  // genuinely wrote to Redis look like it "didn't save" once the page
  // was refreshed.
  const fetchBannedIds = useCallback(async (key) => {
    try {
      const res = await fetch('/api/admin/blocked-devices', { headers: { 'x-admin-key': key } });
      if (!res.ok) return;
      const data = await res.json();
      const map = new Map();
      for (const d of data.devices ?? []) {
        if (d.visitorId) map.set(d.visitorId, d.id);
        if (d.persistentMarker) map.set(d.persistentMarker, d.id);
      }
      setBannedMap(map);
    } catch {
      // Non-fatal — worst case the ban badge doesn't show, banDevice's
      // 401 handling below already covers the auth-failure path.
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('admin_key');
    if (saved) {
      setAdminKey(saved);
      fetchVisitors(saved);
      fetchBannedIds(saved);
    } else {
      fetch('/api/admin/me')
        .then(r => r.json())
        .then(({ key }) => { if (key) { setAdminKey(key); fetchVisitors(key); fetchBannedIds(key); } })
        .catch(() => {});
    }
  }, [fetchVisitors, fetchBannedIds]);

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

  // Bans by BOTH the fingerprint and the device marker in one call — no
  // copying an ID into another page's manual-entry field required. The
  // marker match is the one that actually survives a browser/OS update
  // drifting the fingerprint (see the caveat text below); sending both is
  // strictly stronger than the old copy-paste-into-/admin/security flow,
  // which only ever had the fingerprint to work with.
  const banDevice = async (v) => {
    setBanning(v.id);
    setMsg('');
    try {
      const res = await fetch('/api/admin/blocked-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ visitorId: v.visitorId, persistentMarker: v.persistentMarker ?? v.id }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? 'Failed to ban device'); setBanning(null); return; }
      await fetchBannedIds(adminKey);
    } catch (e) {
      setMsg('Failed to ban device: ' + e.message);
    }
    setBanning(null);
  };

  const unbanDevice = async (v) => {
    const banId = getBanId(v);
    if (!banId) return;
    setUnbanning(v.id);
    setMsg('');
    try {
      const res = await fetch(`/api/admin/blocked-devices?banId=${encodeURIComponent(banId)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg(data.error ?? 'Failed to unban device');
        setUnbanning(null);
        return;
      }
      await fetchBannedIds(adminKey);
    } catch (e) {
      setMsg('Failed to unban device: ' + e.message);
    }
    setUnbanning(null);
  };

  // Manual per-row delete ("a manual button to delete single logs"). Auto-
  // expiry (30 days, down from 90) handles the "logs I don't need" case by
  // default; this is for deleting one immediately instead of waiting.
  const deleteLog = async (v) => {
    setDeleting(v.id);
    setMsg('');
    try {
      const res = await fetch(`/api/admin/visitors?id=${encodeURIComponent(v.id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? 'Failed to delete log'); setDeleting(null); return; }
      setVisitors((prev) => prev.filter((x) => x.id !== v.id));
      setExpandedId((prev) => (prev === v.id ? null : prev));
    } catch (e) {
      setMsg('Failed to delete log: ' + e.message);
    }
    setDeleting(null);
  };

  const renderDetail = (v) => {
    const { browser, os, device } = parseUserAgent(v.lastUserAgent);
    const loc = v.lastLocation;
    const location = formatLocation(loc);
    const { enrichment } = v;
    const asn = enrichment?.asn;
    const signals = enrichment?.smartSignals;
    const score = enrichment?.suspectScore;
    const velocity = enrichment?.velocity;

    return (
      <div style={s.detailPanel}>
        {isBanned(v) ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 14 }}>✓ Banned</div>
            <button
              style={s.btnGhost}
              disabled={unbanning === v.id}
              onClick={(e) => { e.stopPropagation(); unbanDevice(v); }}
            >
              {unbanning === v.id ? 'Unbanning…' : 'Unban this device'}
            </button>
          </div>
        ) : (
          <button
            style={s.btnDanger}
            disabled={banning === v.id}
            onClick={(e) => { e.stopPropagation(); banDevice(v); }}
          >
            {banning === v.id ? 'Banning…' : 'Ban this device'}
          </button>
        )}

        <div style={s.detailLabel}>Identification</div>
        <div style={s.detailSub}>Device marker (this row&apos;s ID column — guaranteed unique per device)</div>
        <div style={{ ...s.detailValue, fontFamily: 'monospace', fontWeight: 400, wordBreak: 'break-all' }}>
          {v.id}
        </div>
        <button
          style={{ ...s.btnGhost, marginTop: 4 }}
          onClick={(e) => { e.stopPropagation(); copyToClipboard(v.id); }}
        >
          Copy device marker
        </button>

        <div style={{ ...s.detailSub, marginTop: 10 }}>
          Fingerprint (used for ban-matching after a device clears storage — see caveat below)
        </div>
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
        <p style={s.caveat}>
          Two different phones of the same model/OS/browser can share this fingerprint — it&apos;s
          not the unique row identity. The device marker above (this row&apos;s ID column) is what
          actually distinguishes this row from another visitor, and can never collide between two
          different real devices.
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

        {!enrichment && (
          <p style={{ color: '#64748b', fontSize: 12, marginTop: 14 }}>
            No ASN/Smart Signals data was captured for this visitor — enrichment only started
            computing for records created after this feature shipped; older logs won&apos;t have it
            until they&apos;re recreated by a fresh visit.
          </p>
        )}

        {enrichment && (
          <>
            <div style={s.detailLabel}>ASN</div>
            <div style={s.detailValue}>
              {asn ? `AS${asn.asn} — ${asn.name ?? 'Unknown name'} (${asn.country ?? '—'})` : 'Unknown ISP'}
            </div>

            <div style={s.detailLabel}>Smart Signals</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              <span style={{ ...s.badge, ...(signals?.tor ? s.badgeOn : s.badgeOff) }}>Tor {signals?.tor ? '✓' : '—'}</span>
              <span style={{ ...s.badge, ...(signals?.vpnOrDatacenter ? s.badgeOn : s.badgeOff) }}>VPN/Datacenter {signals?.vpnOrDatacenter ? '✓' : '—'}</span>
              <span style={{ ...s.badge, ...(signals?.vm?.detected ? s.badgeOn : s.badgeOff) }}>VM {signals?.vm?.detected ? '✓' : '—'}</span>
              <span style={{ ...s.badge, ...(signals?.bot?.suspected ? s.badgeOn : s.badgeOff) }}>Bot {signals?.bot?.suspected ? '✓' : '—'}</span>
              <span style={{ ...s.badge, ...(signals?.incognito?.suspected ? s.badgeOn : s.badgeOff) }}>Incognito {signals?.incognito?.suspected ? '✓' : '—'}</span>
            </div>
            <p style={s.caveat}>
              Bot and Incognito are weak, easily-evaded signals — navigator.webdriver is defeated by a
              single browser flag, and the classic incognito-detection technique was broken by Chrome&apos;s
              2026 storage-quota changes. Treat both as corroborating context only, never as proof.
            </p>

            <div style={s.detailLabel}>Suspect Score</div>
            {score ? (
              <>
                <div style={s.detailValue}>
                  {score.value} — <span style={{ color: suspectColor(score.label) }}>{score.label}</span>
                </div>
                <div style={s.scoreBarTrack}>
                  <div style={{ width: `${score.value}%`, height: '100%', background: suspectColor(score.label) }} />
                </div>
              </>
            ) : <div style={s.detailSub}>—</div>}

            <div style={s.detailLabel}>Velocity (24h snapshot at first-seen)</div>
            {velocity ? (
              <div style={s.detailValue}>{velocity.eventCount24h} events · {velocity.ipCount24h} IPs · {velocity.countryCount24h} countries</div>
            ) : <div style={s.detailSub}>—</div>}
          </>
        )}

        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            style={s.btnGhost}
            onClick={(e) => { e.stopPropagation(); toggleJson(v.id); }}
          >
            {showJson[v.id] ? 'Hide JSON' : 'Show JSON'}
          </button>
          <button
            style={{ ...s.btnDangerGhost, opacity: deleting === v.id ? 0.6 : 1 }}
            disabled={deleting === v.id}
            onClick={(e) => { e.stopPropagation(); deleteLog(v); }}
          >
            {deleting === v.id ? 'Deleting…' : 'Delete this log'}
          </button>
        </div>
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
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 4, animation: 'glowPulse 3s ease-in-out infinite' }}>
            Site Visitors
          </h1>
          <p style={{ color: '#06b6d4', fontSize: 13, marginBottom: 20 }}>
            Every device the site has identified, banned or not. Retained on a rolling 30-day window since last visit — or delete a log immediately below.
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

            <div className="vt-scroll" style={{ maxHeight: 600, overflowY: 'auto' }}>
              <table className="vt-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Visits</th>
                    <th>First Seen</th>
                    <th>Last Seen</th>
                    <th>Client</th>
                    <th>Location</th>
                    <th>IP</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => {
                    const { browser, os } = parseUserAgent(v.lastUserAgent);
                    const location = formatLocation(v.lastLocation);
                    const isExpanded = expandedId === v.id;
                    return (
                      <Fragment key={v.id}>
                        <tr
                          className={`vt-row${isExpanded ? ' vt-row--expanded' : ''}`}
                          onClick={() => toggleExpanded(v.id)}
                        >
                          <td className="vt-id">{v.id}</td>
                          <td>{v.visitCount ?? 1}</td>
                          <td>{formatDateShort(v.firstSeenAt)}</td>
                          <td>{formatDateShort(v.lastSeenAt)}</td>
                          <td>{browser} · {os}</td>
                          <td>{location ?? '—'}</td>
                          <td>{v.lastIp ?? '—'}</td>
                          <td>{isBanned(v) ? <span style={s.bannedBadge}>BANNED</span> : <span style={s.allowedBadge}>ALLOWED</span>}</td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td className="vt-detail-cell" colSpan={8}>{renderDetail(v)}</td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
