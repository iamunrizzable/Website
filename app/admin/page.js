'use client';

import { useEffect, useState, useCallback } from 'react';

const ACTION_COLORS = {
  hide: '#ef4444',
  flag: '#f59e0b',
  review: '#3b82f6',
  allow: '#10b981',
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchStatus = useCallback(async (key) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/status', {
        headers: { 'x-admin-key': key },
      });
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      setStatus(data);
      setAuthed(true);
    } catch (e) {
      setMsg('Failed to load status: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    fetchStatus(adminKey);
  }

  async function handleSync() {
    setSyncing(true);
    setMsg('');
    try {
      const res = await fetch('/api/sync/tiktok/comments', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_hide: false }),
      });
      const data = await res.json();
      if (data.error) setMsg('Sync error: ' + JSON.stringify(data.error));
      else setMsg(`Synced ${data.synced} items.`);
      fetchStatus(adminKey);
    } catch (e) {
      setMsg('Sync failed: ' + e.message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleConnect() {
    // Pass admin key as query param so the browser redirect works
    window.location.href = `/auth/tiktok/login?key=${encodeURIComponent(adminKey)}`;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) setMsg('✅ TikTok connected successfully!');
    if (params.get('error')) setMsg('❌ Error: ' + params.get('error'));
  }, []);

  const s = {
    page: { minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px' },
    card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #334155' },
    h1: { fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 8 },
    h2: { fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    input: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box' },
    btn: { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    btnSm: { background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, marginRight: 8 },
    badge: (color) => ({ background: color + '22', color, border: `1px solid ${color}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }),
    label: { fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' },
    msg: { background: '#1e3a5f', border: '1px solid #3b82f6', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 },
  };

  if (!authed) {
    return (
      <div style={s.page}>
        <div style={{ maxWidth: 400, margin: '80px auto' }}>
          <div style={s.card}>
            <h1 style={s.h1}>TJB Moderation Admin</h1>
            <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>Enter your admin secret to continue.</p>
            {msg && <div style={s.msg}>{msg}</div>}
            <form onSubmit={handleLogin}>
              <label style={s.label}>Admin Secret</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                style={{ ...s.input, marginBottom: 16 }}
                placeholder="ADMIN_SECRET value"
              />
              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? 'Checking…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={s.h1}>TJB Moderation Admin</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>tjbmanagementinc.com · Hallie Moderation System</p>

        {msg && <div style={s.msg}>{msg}</div>}

        {/* Connection Status */}
        <div style={s.card}>
          <h2 style={s.h2}>TikTok Connection</h2>
          {status?.connected ? (
            <>
              <p style={{ marginBottom: 12 }}>
                <span style={s.badge('#10b981')}>CONNECTED</span>
                {status.expired && <span style={{ ...s.badge('#ef4444'), marginLeft: 8 }}>TOKEN EXPIRED</span>}
              </p>
              {status.user && (
                <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>
                  Logged in as <strong style={{ color: '#e2e8f0' }}>{status.user.display_name}</strong>
                  {status.user.follower_count != null && ` · ${status.user.follower_count.toLocaleString()} followers`}
                </p>
              )}
              <p style={{ fontSize: 12, color: '#475569' }}>
                Scopes: {status.scope} · Stored: {new Date(status.stored_at).toLocaleString()}
              </p>
            </>
          ) : (
            <p style={{ color: '#f59e0b', marginBottom: 12, fontSize: 14 }}>Not connected to TikTok.</p>
          )}
          <div style={{ marginTop: 16 }}>
            <button style={s.btn} onClick={handleConnect}>
              {status?.connected ? 'Reconnect TikTok' : 'Connect TikTok'}
            </button>
            {status?.connected && (
              <button
                style={{ ...s.btnSm, marginLeft: 10 }}
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? 'Syncing…' : '🔄 Sync Comments'}
              </button>
            )}
          </div>
          <p style={{ fontSize: 11, color: '#475569', marginTop: 12 }}>
            ⚠️ Comment sync requires video.comment.list scope — apply in TikTok Developer Portal when ready.
          </p>
        </div>

        {/* Scope Status */}
        <div style={s.card}>
          <h2 style={s.h2}>Scope Checklist</h2>
          {[
            { scope: 'user.info.profile', status: 'approved', note: 'Profile info' },
            { scope: 'user.info.stats', status: 'approved', note: 'Follower/like counts' },
            { scope: 'video.list', status: 'approved', note: 'List public videos' },
            { scope: 'video.comment.list', status: 'pending', note: 'Read comments — APPLY IN PORTAL' },
            { scope: 'video.comment.moderate', status: 'pending', note: 'Hide/delete comments — APPLY IN PORTAL' },
            { scope: 'dm.inbox', status: 'pending', note: 'Read DMs — APPLY IN PORTAL' },
          ].map(({ scope, status: st, note }) => (
            <div key={scope} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={s.badge(st === 'approved' ? '#10b981' : '#f59e0b')}>
                {st === 'approved' ? '✓' : '⏳'}
              </span>
              <code style={{ fontSize: 13, color: '#e2e8f0' }}>{scope}</code>
              <span style={{ fontSize: 12, color: '#64748b' }}>{note}</span>
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div style={s.card}>
          <h2 style={s.h2}>Recent Flagged Events</h2>
          {(status?.events ?? []).length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569' }}>No events yet. Run a sync or POST to /api/moderate to test.</p>
          ) : (
            (status?.events ?? []).map((ev, i) => (
              <div key={i} style={{ borderBottom: '1px solid #1e293b', paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={s.badge(ACTION_COLORS[ev.action] ?? '#94a3b8')}>{ev.action?.toUpperCase()}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{ev.type}</span>
                  {ev.author && <span style={{ fontSize: 12, color: '#94a3b8' }}>@{ev.author}</span>}
                  <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>score: {ev.score}</span>
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0, marginBottom: 4 }}>
                  {ev.text?.slice(0, 200)}{ev.text?.length > 200 ? '…' : ''}
                </p>
                {ev.flags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {ev.flags.map((f) => (
                      <span key={f} style={{ fontSize: 11, background: '#334155', color: '#94a3b8', padding: '2px 6px', borderRadius: 4 }}>{f}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Test Moderation */}
        <TestPanel adminKey={adminKey} />
      </div>
    </div>
  );
}

function TestPanel({ adminKey }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const s = {
    card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #334155' },
    h2: { fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    textarea: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box', minHeight: 80, resize: 'vertical' },
    btn: { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginTop: 10 },
  };

  async function test() {
    const res = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type: 'test', send_alert: false }),
    });
    setResult(await res.json());
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Test Moderation</h2>
      <textarea
        style={s.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste comment, DM, or LIVE chat message to score it…"
      />
      <button style={s.btn} onClick={test} disabled={!text.trim()}>Score It</button>
      {result && (
        <pre style={{ marginTop: 12, background: '#0f172a', padding: 12, borderRadius: 8, fontSize: 12, color: '#94a3b8', overflowX: 'auto' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
