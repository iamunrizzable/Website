'use client';

import './page.css';

import { useEffect, useState, useCallback } from 'react';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '2px solid rgba(168,85,247,0.25)', animation: 'borderGlow 3s ease-in-out infinite' },
  h2: { fontSize: 16, fontWeight: 600, color: '#d946ef', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
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
  const [redisConfigured, setRedisConfigured] = useState(true);
  const [visitorIds, setVisitorIds] = useState([]);
  const [newVisitorId, setNewVisitorId] = useState('');
  const [deviceMsg, setDeviceMsg] = useState('');

  const fetchVisitorIds = useCallback(async (key) => {
    try {
      const res = await fetch('/api/admin/blocked-devices', { headers: { 'x-admin-key': key } });
      if (res.status === 401) { localStorage.removeItem('admin_key'); return; }
      const data = await res.json();
      setVisitorIds(data.visitorIds ?? []);
      setRedisConfigured(!!data.redisConfigured);
      localStorage.setItem('admin_key', key);
    } catch (e) {
      setDeviceMsg('Failed to load blocked devices: ' + e.message);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('admin_key');
    if (saved) {
      setAdminKey(saved);
      fetchVisitorIds(saved);
    } else {
      fetch('/api/admin/me')
        .then(r => r.json())
        .then(({ key }) => { if (key) { setAdminKey(key); fetchVisitorIds(key); } })
        .catch(() => {});
    }
  }, [fetchVisitorIds]);

  const addVisitorId = async () => {
    setDeviceMsg('');
    const visitorId = newVisitorId.trim();
    if (!visitorId) return;
    try {
      const res = await fetch('/api/admin/blocked-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ visitorId }),
      });
      const data = await res.json();
      if (!res.ok) { setDeviceMsg(data.error ?? 'Failed to block device'); return; }
      setNewVisitorId('');
      fetchVisitorIds(adminKey);
    } catch (e) {
      setDeviceMsg('Failed to block device: ' + e.message);
    }
  };

  const removeVisitorId = async (visitorId) => {
    try {
      await fetch(`/api/admin/blocked-devices?visitorId=${encodeURIComponent(visitorId)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      fetchVisitorIds(adminKey);
    } catch (e) {
      setDeviceMsg('Failed to remove device: ' + e.message);
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 28, animation: 'glowPulse 3s ease-in-out infinite' }}>Security</h1>

          {!redisConfigured && (
            <div style={s.warnBanner}>
              <strong>Blocking is not actually active yet.</strong> This requires Redis
              (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, or the Vercel-provisioned
              KV_REST_API_* equivalents) to be configured — without it, devices will save here
              but visitors won&apos;t actually be blocked. Set that up in Vercel
              (Storage → add a Redis database) and redeploy.
            </div>
          )}

          <div style={s.card}>
            <div style={s.h2}>Block a Device</div>
            {deviceMsg && <div style={s.msg}>{deviceMsg}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={s.input}
                placeholder="e.g. MiGaRxSTjSL0ADqniflW"
                value={newVisitorId}
                onChange={(e) => setNewVisitorId(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addVisitorId(); }}
              />
              <button style={s.btn} onClick={addVisitorId}>Block</button>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.h2}>Blocked Devices ({visitorIds.length})</div>
            {visitorIds.length === 0 && <div style={{ color: '#06b6d4', fontSize: 13 }}>No devices blocked.</div>}
            {visitorIds.map((visitorId) => (
              <div key={visitorId} style={s.row}>
                <span>{visitorId}</span>
                <button style={s.btnDanger} onClick={() => removeVisitorId(visitorId)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
