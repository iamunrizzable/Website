'use client';

import './page.css';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { parseUserAgent } from '@/lib/deviceSignals';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '2px solid rgba(168,85,247,0.25)', animation: 'borderGlow 3s ease-in-out infinite' },
  input: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box', marginBottom: 16 },
  row: { padding: '12px 0', borderBottom: '1px solid #334155' },
  visitorId: { fontFamily: 'monospace', fontSize: 13, color: '#e2e8f0', wordBreak: 'break-all', cursor: 'pointer' },
  metaLine: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  countBadge: { display: 'inline-block', background: 'rgba(168,85,247,0.15)', color: '#d4a5ff', border: '1px solid rgba(168,85,247,0.4)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700, marginLeft: 8 },
  warnBanner: { background: '#3f1d1d', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fca5a5', lineHeight: 1.5 },
  msg: { fontSize: 12, color: '#f59e0b', marginBottom: 8, minHeight: 18 },
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

// The full 64-char SHA-256 stays the actual matching/storage key — this
// only shortens what's shown. Tap to copy the full ID since it's too long
// to select by hand on a phone.
function shortId(id) {
  return `${id.slice(0, 10)}…${id.slice(-6)}`;
}

export default function VisitorListPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [redisConfigured, setRedisConfigured] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [query, setQuery] = useState('');
  const [msg, setMsg] = useState('');

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
      return v.visitorId.toLowerCase().includes(q) || (v.lastIp ?? '').includes(q) || loc.includes(q);
    });
  }, [visitors, query]);

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
              <strong>Storage is not actually configured yet.</strong> This requires the TJB_MGMT_IP_BLACKLIST_UPSTASH
              integration&apos;s TJB_MGMT_INC_IP_BLACKLIST_KV_REST_API_URL and TJB_MGMT_INC_IP_BLACKLIST_KV_REST_API_TOKEN
              env vars to be set on this deployment — without them this list resets on every cold start and only reflects
              recent traffic to this one serverless instance. Check that integration is connected to this project in
              Vercel (Storage → TJB_MGMT_IP_BLACKLIST_UPSTASH) and redeploy.
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
                return (
                  <div key={v.visitorId} style={s.row}>
                    <div
                      style={s.visitorId}
                      title={v.visitorId}
                      onClick={() => {
                        navigator.clipboard?.writeText(v.visitorId).then(() => {
                          setMsg('Copied full ID to clipboard.');
                          setTimeout(() => setMsg(''), 2000);
                        }).catch(() => {});
                      }}
                    >
                      {shortId(v.visitorId)}
                      <span style={s.countBadge}>{v.visitCount ?? 1} visit{(v.visitCount ?? 1) === 1 ? '' : 's'}</span>
                    </div>
                    <div style={s.metaLine}>First seen {formatWhen(v.firstSeenAt)} · Last seen {formatWhen(v.lastSeenAt)}</div>
                    <div style={s.metaLine}>
                      {browser} on {os} ({device}){v.lastIp ? ` · ${v.lastIp}` : ''}{location ? ` · ${location}` : ''}
                    </div>
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
