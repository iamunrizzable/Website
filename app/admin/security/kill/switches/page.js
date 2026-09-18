'use client';

import './page.css';

import { useEffect, useState, useCallback } from 'react';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '2px solid rgba(168,85,247,0.25)', animation: 'borderGlow 3s ease-in-out infinite' },
  h2: { fontSize: 16, fontWeight: 600, color: '#d946ef', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  btn: { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnDanger: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  msg: { fontSize: 12, color: '#f59e0b', marginBottom: 8, minHeight: 18 },
};

// Every switch here has the identical shape: a GET/POST pair under
// /api/admin/<endpoint>, a boolean field name, a status fetch + toggle.
// One config-driven component instead of three near-duplicate blocks.
const SWITCHES = [
  {
    key: 'tiktok',
    endpoint: '/api/admin/tiktok-suspension',
    field: 'suspended',
    title: 'TikTok Agency Kill Switch',
    description: 'When on, every page under /agencies/tiktok shows a shut-off notice instead of the real content.',
    onLabel: 'Suspend TikTok Agency',
  },
  {
    key: 'c2',
    endpoint: '/api/admin/c2-suspension',
    field: 'suspended',
    title: 'C2 Agency Kill Switch',
    description: 'When on, every page under /agencies/c2 shows a shut-off notice instead of the real content.',
    onLabel: 'Suspend C2 Agency',
  },
  {
    key: 'maintenance',
    endpoint: '/api/admin/maintenance',
    field: 'maintenance',
    title: 'Site-Wide Maintenance Kill Switch',
    description: 'When on, the ENTIRE site shows a maintenance notice instead of the real content — every route, not one agency. /admin itself is exempt so this can always be turned back off.',
    onLabel: 'Take Site Offline',
  },
];

function KillSwitchCard({ config, adminKey }) {
  const [on, setOn] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(config.endpoint, { headers: { 'x-admin-key': adminKey } });
      if (res.status === 401) return;
      const data = await res.json();
      setOn(!!data[config.field]);
      setLoaded(true);
    } catch (e) {
      setMsg('Failed to load status: ' + e.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  useEffect(() => {
    if (adminKey) fetchStatus();
  }, [adminKey, fetchStatus]);

  const toggle = async () => {
    setMsg('');
    setBusy(true);
    const next = !on;
    try {
      const res = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ [config.field]: next }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? 'Failed to update'); setBusy(false); return; }
      setOn(next);
    } catch (e) {
      setMsg('Failed to update: ' + e.message);
    }
    setBusy(false);
  };

  return (
    <div style={{ ...s.card, border: on ? '2px solid rgba(239,68,68,0.5)' : s.card.border }}>
      <div style={s.h2}>{config.title}</div>
      {msg && <div style={s.msg}>{msg}</div>}
      <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{config.description}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: on ? '#ef4444' : '#06b6d4' }}>
          {!loaded ? 'Loading…' : on ? 'SHUT OFF' : 'Live'}
        </span>
        <button
          style={{ ...(on ? s.btnDanger : s.btn), opacity: busy || !loaded ? 0.6 : 1 }}
          onClick={toggle}
          disabled={busy || !loaded}
        >
          {on ? 'Restore Access' : config.onLabel}
        </button>
      </div>
    </div>
  );
}

export default function KillSwitchesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('admin_key');
    if (saved) {
      setAdminKey(saved);
    } else {
      fetch('/api/admin/me')
        .then(r => r.json())
        .then(({ key }) => { if (key) setAdminKey(key); })
        .catch(() => {});
    }
  }, []);

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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 4, animation: 'glowPulse 3s ease-in-out infinite' }}>
            Kill Switches
          </h1>
          <p style={{ color: '#06b6d4', fontSize: 13, marginBottom: 28 }}>
            Shut off access to an agency, or the entire site, instantly. Each one flips back on the same way it was turned off.
          </p>

          {!adminKey && <p style={{ color: '#64748b', fontSize: 13 }}>Loading admin session…</p>}
          {adminKey && SWITCHES.map((config) => (
            <KillSwitchCard key={config.key} config={config} adminKey={adminKey} />
          ))}
        </div>
      </div>
    </>
  );
}
