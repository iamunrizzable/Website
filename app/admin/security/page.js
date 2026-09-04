'use client';

import './page.css';

import { useEffect, useState, useCallback } from 'react';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #334155' },
  h2: { fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  input: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box' },
  btn: { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnDanger: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155', fontFamily: 'monospace', fontSize: 14 },
  msg: { fontSize: 12, color: '#f59e0b', marginBottom: 8, minHeight: 18 },
  warnBanner: { background: '#3f1d1d', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fca5a5', lineHeight: 1.5 },
};

export default function SecurityPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [ips, setIps] = useState([]);
  const [redisConfigured, setRedisConfigured] = useState(true);
  const [newIp, setNewIp] = useState('');
  const [msg, setMsg] = useState('');

  const fetchIps = useCallback(async (key) => {
    try {
      const res = await fetch('/api/admin/blocked-ips', { headers: { 'x-admin-key': key } });
      if (res.status === 401) { localStorage.removeItem('admin_key'); return; }
      const data = await res.json();
      setIps(data.ips ?? []);
      setRedisConfigured(!!data.redisConfigured);
      localStorage.setItem('admin_key', key);
    } catch (e) {
      setMsg('Failed to load blocked IPs: ' + e.message);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('admin_key');
    if (saved) {
      setAdminKey(saved);
      fetchIps(saved);
    } else {
      fetch('/api/admin/me')
        .then(r => r.json())
        .then(({ key }) => { if (key) { setAdminKey(key); fetchIps(key); } })
        .catch(() => {});
    }
  }, [fetchIps]);

  const addIp = async () => {
    setMsg('');
    const ip = newIp.trim();
    if (!ip) return;
    try {
      const res = await fetch('/api/admin/blocked-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ ip }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? 'Failed to block IP'); return; }
      setNewIp('');
      fetchIps(adminKey);
    } catch (e) {
      setMsg('Failed to block IP: ' + e.message);
    }
  };

  const removeIp = async (ip) => {
    try {
      await fetch(`/api/admin/blocked-ips?ip=${encodeURIComponent(ip)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      fetchIps(adminKey);
    } catch (e) {
      setMsg('Failed to remove IP: ' + e.message);
    }
  };

  return (
    <>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/tiktok/agency" onClick={() => setMenuOpen(false)}>TikTok Agency</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <div style={s.page}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 4 }}>Security</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>
            Block visitors by IP address site-wide. Enforced directly in middleware — no third-party dependency.
          </p>

          {!redisConfigured && (
            <div style={s.warnBanner}>
              <strong>Blocking is not actually active yet.</strong> This requires Redis
              (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN) to be configured — without it,
              IPs will save here but visitors won&apos;t actually be blocked. Set those up in Vercel
              (Storage → add Upstash Redis) and redeploy.
            </div>
          )}

          <div style={s.card}>
            <div style={s.h2}>Block an IP</div>
            {msg && <div style={s.msg}>{msg}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={s.input}
                placeholder="e.g. 50.146.255.42"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addIp(); }}
              />
              <button style={s.btn} onClick={addIp}>Block</button>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.h2}>Blocked IPs ({ips.length})</div>
            {ips.length === 0 && <div style={{ color: '#64748b', fontSize: 13 }}>No IPs blocked.</div>}
            {ips.map((ip) => (
              <div key={ip} style={s.row}>
                <span>{ip}</span>
                <button style={s.btnDanger} onClick={() => removeIp(ip)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
