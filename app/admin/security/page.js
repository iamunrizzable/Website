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
  const [devices, setDevices] = useState([]);
  const [nearMisses, setNearMisses] = useState([]);
  const [newVisitorId, setNewVisitorId] = useState('');
  const [deviceMsg, setDeviceMsg] = useState('');
  const [tiktokSuspended, setTiktokSuspended] = useState(false);
  const [tiktokMsg, setTiktokMsg] = useState('');
  const [tiktokBusy, setTiktokBusy] = useState(false);

  const fetchDevices = useCallback(async (key) => {
    try {
      const res = await fetch('/api/admin/blocked-devices', { headers: { 'x-admin-key': key } });
      if (res.status === 401) { localStorage.removeItem('admin_key'); return; }
      const data = await res.json();
      setDevices(data.devices ?? []);
      setNearMisses(data.nearMisses ?? []);
      setRedisConfigured(!!data.redisConfigured);
      localStorage.setItem('admin_key', key);
    } catch (e) {
      setDeviceMsg('Failed to load blocked devices: ' + e.message);
    }
  }, []);

  const fetchTiktokSuspension = useCallback(async (key) => {
    try {
      const res = await fetch('/api/admin/tiktok-suspension', { headers: { 'x-admin-key': key } });
      if (res.status === 401) return;
      const data = await res.json();
      setTiktokSuspended(!!data.suspended);
    } catch (e) {
      setTiktokMsg('Failed to load status: ' + e.message);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('admin_key');
    if (saved) {
      setAdminKey(saved);
      fetchDevices(saved);
      fetchTiktokSuspension(saved);
    } else {
      fetch('/api/admin/me')
        .then(r => r.json())
        .then(({ key }) => { if (key) { setAdminKey(key); fetchDevices(key); fetchTiktokSuspension(key); } })
        .catch(() => {});
    }
  }, [fetchDevices, fetchTiktokSuspension]);

  const toggleTiktokSuspension = async () => {
    setTiktokMsg('');
    setTiktokBusy(true);
    const next = !tiktokSuspended;
    try {
      const res = await fetch('/api/admin/tiktok-suspension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ suspended: next }),
      });
      const data = await res.json();
      if (!res.ok) { setTiktokMsg(data.error ?? 'Failed to update'); setTiktokBusy(false); return; }
      setTiktokSuspended(next);
    } catch (e) {
      setTiktokMsg('Failed to update: ' + e.message);
    }
    setTiktokBusy(false);
  };

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
      if (!res.ok) { setDeviceMsg(data.error ?? 'Failed to block ID'); return; }
      setNewVisitorId('');
      fetchDevices(adminKey);
    } catch (e) {
      setDeviceMsg('Failed to block ID: ' + e.message);
    }
  };

  const removeDevice = async (banId) => {
    try {
      await fetch(`/api/admin/blocked-devices?banId=${encodeURIComponent(banId)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      fetchDevices(adminKey);
    } catch (e) {
      setDeviceMsg('Failed to remove device: ' + e.message);
    }
  };

  const promoteNearMiss = async (nearMissId) => {
    try {
      const res = await fetch('/api/admin/blocked-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ promoteNearMissId: nearMissId }),
      });
      const data = await res.json();
      if (!res.ok) { setDeviceMsg(data.error ?? 'Failed to confirm ban'); return; }
      fetchDevices(adminKey);
    } catch (e) {
      setDeviceMsg('Failed to confirm ban: ' + e.message);
    }
  };

  const dismissNearMiss = async (nearMissId) => {
    try {
      await fetch(`/api/admin/blocked-devices?nearMissId=${encodeURIComponent(nearMissId)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      fetchDevices(adminKey);
    } catch (e) {
      setDeviceMsg('Failed to dismiss: ' + e.message);
    }
  };

  const summarizeDevice = (d) => {
    const ua = d.userAgent ? d.userAgent.slice(0, 60) : 'Unknown browser';
    const when = d.bannedAt ? new Date(d.bannedAt).toLocaleDateString() : '—';
    return `${ua} · ${d.country ?? '—'} · banned ${when}`;
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
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 28, animation: 'glowPulse 3s ease-in-out infinite' }}>Security</h1>

          {!redisConfigured && (
            <div style={s.warnBanner}>
              <strong>Blocking is not actually active yet.</strong> This requires Redis
              (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, or the Vercel-provisioned
              KV_REST_API_* equivalents) to be configured — without it, IDs will save here
              but visitors won&apos;t actually be blocked. Set that up in Vercel
              (Storage → add a Redis database) and redeploy.
            </div>
          )}

          <div style={{ ...s.card, border: tiktokSuspended ? '2px solid rgba(239,68,68,0.5)' : s.card.border }}>
            <div style={s.h2}>TikTok Agency Kill Switch</div>
            {tiktokMsg && <div style={s.msg}>{tiktokMsg}</div>}
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              When on, every page under /agencies/tiktok shows a suspension notice instead of the real content.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: tiktokSuspended ? '#ef4444' : '#06b6d4' }}>
                {tiktokSuspended ? 'SUSPENDED' : 'Live'}
              </span>
              <button
                style={{ ...(tiktokSuspended ? s.btnDanger : s.btn), opacity: tiktokBusy ? 0.6 : 1 }}
                onClick={toggleTiktokSuspension}
                disabled={tiktokBusy}
              >
                {tiktokSuspended ? 'Restore Access' : 'Suspend TikTok Agency'}
              </button>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.h2}>Block an ID</div>
            {deviceMsg && <div style={s.msg}>{deviceMsg}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={s.input}
                placeholder="paste a device id (e.g. from ?fpdebug=1)"
                value={newVisitorId}
                onChange={(e) => setNewVisitorId(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addVisitorId(); }}
              />
              <button style={s.btn} onClick={addVisitorId}>Block</button>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.h2}>Blocked Devices ({devices.length})</div>
            {devices.length === 0 && <div style={{ color: '#06b6d4', fontSize: 13 }}>No devices blocked.</div>}
            {devices.map((d) => (
              <div key={d.id} style={{ ...s.row, flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13 }}>{summarizeDevice(d)}</span>
                  <button style={s.btnDanger} onClick={() => removeDevice(d.id)}>Remove</button>
                </div>
                <span style={{ color: '#64748b', fontSize: 11 }}>
                  {d.visitorId ? `id: ${d.visitorId.slice(0, 16)}…` : 'no exact id captured'}
                  {d.note ? ` · ${d.note}` : ''}
                </span>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <div style={s.h2}>Near-Miss Review ({nearMisses.length})</div>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              Visits whose device fingerprint scored close to a banned profile but weren&apos;t
              automatically blocked. Confirm to add them as their own ban, or dismiss if unrelated.
            </p>
            {nearMisses.length === 0 && <div style={{ color: '#06b6d4', fontSize: 13 }}>No near-misses pending review.</div>}
            {nearMisses.map((n) => (
              <div key={n.id} style={{ ...s.row, flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13 }}>
                    {n.userAgent ? n.userAgent.slice(0, 50) : 'Unknown browser'} · {n.country ?? '—'}
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>
                    {Math.round((n.score ?? 0) * 100)}% match
                  </span>
                </div>
                <span style={{ color: '#64748b', fontSize: 11 }}>
                  seen {n.seenAt ? new Date(n.seenAt).toLocaleString() : '—'}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={s.btn} onClick={() => promoteNearMiss(n.id)}>Confirm Ban</button>
                  <button style={s.btnDanger} onClick={() => dismissNearMiss(n.id)}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
