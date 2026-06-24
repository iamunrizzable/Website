'use client';

import { useEffect, useState, useCallback } from 'react';

const ACTION_COLORS = {
  hide: '#ef4444',
  flag: '#f59e0b',
  review: '#3b82f6',
  allow: '#10b981',
};

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #334155' },
  h2: { fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  input: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box' },
  btn: { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnSm: { background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  btnDanger: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  badge: (color) => ({ background: color + '22', color, border: `1px solid ${color}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }),
  msg: { background: '#1e3a5f', border: '1px solid #3b82f6', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 },
  inlineMsg: (ok) => ({ fontSize: 12, color: ok ? '#10b981' : '#f59e0b', marginBottom: 8, minHeight: 18 }),
  tab: (active) => ({
    padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: active ? 600 : 400,
    background: active ? '#a855f7' : 'transparent', color: active ? '#fff' : '#64748b', border: 'none',
  }),
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchStatus = useCallback(async (key) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/status', { headers: { 'x-admin-key': key } });
      if (res.status === 401) { localStorage.removeItem('admin_key'); return; }
      setStatus(await res.json());
      localStorage.setItem('admin_key', key);
    } catch (e) {
      setMsg('Failed to load status: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('business_connected')) setMsg('TikTok Business API (advertiser) connected successfully!');
    if (params.get('account_connected')) setMsg('TikTok Account Token connected successfully!');
    if (params.get('error')) setMsg('Error: ' + params.get('error'));
    const saved = localStorage.getItem('admin_key');
    if (saved) {
      setAdminKey(saved);
      fetchStatus(saved);
    } else {
      fetch('/api/admin/me')
        .then(r => r.json())
        .then(({ key }) => { if (key) { setAdminKey(key); fetchStatus(key); } })
        .catch(() => {});
    }
  }, [fetchStatus]);

  const enabled = !!status?.business_connected;
  const accountEnabled = !!status?.account_connected;

  return (
    <>
      <style>{`
        body::before {
          content: "";
          position: fixed; top: 0; left: 0;
          width: 100vw; height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-main.jpeg");
          background-size: cover; background-position: center center; background-repeat: no-repeat;
          z-index: -1; pointer-events: none;
        }
        body { margin: 0; padding: 0; background: transparent; }
      `}</style>
      <div style={s.page}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 0 }}>TJB Management Inc.</h1>
            <button
              style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#64748b', fontSize: 13, padding: '6px 14px', cursor: 'pointer' }}
              onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/admin/login'; }}
            >Sign Out</button>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>tjbmanagementinc.com · Hallie Moderation System</p>

          {msg && <div style={s.msg}>{msg}</div>}

          {/* Connection status — compact when connected, expanded when action needed */}
          <ConnectionCard
            adminKey={adminKey}
            status={status}
            enabled={enabled}
            accountEnabled={accountEnabled}
          />

          <AccountPanel adminKey={adminKey} enabled={accountEnabled} />
          <VideosPanel adminKey={adminKey} enabled={accountEnabled} />
          <CommentsPanel adminKey={adminKey} enabled={enabled} />
          <AutomatedRulesPanel adminKey={adminKey} enabled={enabled} />
          <OptimizerRulesPanel adminKey={adminKey} enabled={enabled} />
          <ApplicationsPanel />
          <DMPanel />
          <TestPanel adminKey={adminKey} />

          {/* Recent Flagged Events */}
          <div style={s.card}>
            <h2 style={s.h2}>Recent Flagged Events</h2>
            {(status?.events ?? []).length === 0 ? (
              <p style={{ fontSize: 13, color: '#475569' }}>No events yet. POST to /api/moderate to test.</p>
            ) : (
              (status?.events ?? []).map((ev, i) => (
                <div key={i} style={{ borderBottom: '1px solid #1e293b', paddingBottom: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={s.badge(ACTION_COLORS[ev.action] ?? '#94a3b8')}>{ev.action?.toUpperCase()}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{ev.type}</span>
                    {ev.author && <span style={{ fontSize: 12, color: '#94a3b8' }}>@{ev.author}</span>}
                    <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>score: {ev.score}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#cbd5e1', margin: '0 0 4px' }}>{ev.text?.slice(0, 200)}{ev.text?.length > 200 ? '…' : ''}</p>
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

        </div>
      </div>
    </>
  );
}

// ── Connection Card ───────────────────────────────────────────────────────────

function ConnectionCard({ adminKey, status, enabled, accountEnabled }) {
  const [expanded, setExpanded] = useState(false);

  const bothOk = enabled && accountEnabled;
  const advExpiring = status?.business_expires_at && Date.now() > status.business_expires_at - 3600000;
  const acctExpiring = status?.account_expires_at && Date.now() > status.account_expires_at - 3600000;
  const needsAttention = !enabled || !accountEnabled || advExpiring || acctExpiring;

  if (bothOk && !expanded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', borderRadius: 10, padding: '10px 16px', marginBottom: 20, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: '#64748b' }}>TikTok Business API connected</span>
        </div>
        <button style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, cursor: 'pointer', padding: '2px 6px' }} onClick={() => setExpanded(true)}>
          manage
        </button>
      </div>
    );
  }

  return (
    <div style={{ ...s.card, marginBottom: 20, borderColor: needsAttention && !bothOk ? '#7c3aed' : '#334155' }}>
      {bothOk && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, cursor: 'pointer' }} onClick={() => setExpanded(false)}>
            collapse
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: enabled ? '#10b981' : '#ef4444', display: 'inline-block', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>Advertiser Token</span>
              {!enabled && <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>comment management &amp; rules</span>}
              {enabled && advExpiring && <span style={{ fontSize: 12, color: '#f59e0b', marginLeft: 8 }}>expiring soon</span>}
            </div>
          </div>
          <button style={{ ...s.btnSm, whiteSpace: 'nowrap' }} onClick={() => { window.location.href = `/auth/tiktok/business/login?key=${encodeURIComponent(adminKey)}`; }}>
            {enabled ? 'Reconnect' : 'Connect'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: accountEnabled ? '#10b981' : '#ef4444', display: 'inline-block', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>TikTok Account Token</span>
              {!accountEnabled && <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>account info &amp; videos</span>}
              {accountEnabled && acctExpiring && <span style={{ fontSize: 12, color: '#f59e0b', marginLeft: 8 }}>expiring soon</span>}
            </div>
          </div>
          <button style={{ ...s.btnSm, whiteSpace: 'nowrap' }} onClick={() => { window.location.href = `/auth/tiktok/account-login?key=${encodeURIComponent(adminKey)}`; }}>
            {accountEnabled ? 'Reconnect' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Account Info ─────────────────────────────────────────────────────────────

function AccountPanel({ adminKey, enabled }) {
  const [account, setAccount] = useState(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!adminKey || !enabled) return;
    fetch('/api/business/account', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => {
        const errCode = d.error?.code;
        const hasError = (d.code && d.code !== 0) || (errCode && errCode !== 'ok' && errCode !== 'success');
        if (hasError) { setError(`API error ${d.code ?? errCode}: ${d.message ?? d.error?.message ?? 'unknown'}`); setAccount(null); }
        else setAccount(d.data ?? d);
      })
      .catch(e => { setError(e.message); setAccount(null); });
  }, [adminKey, enabled]);

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Account Info</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect TikTok Account Token to view account info.</p>
      ) : account === undefined ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p>
      ) : error ? (
        <p style={{ fontSize: 13, color: '#f59e0b' }}>{error}</p>
      ) : (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {account?.avatar_url && <img src={account.avatar_url} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />}
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>{account?.display_name ?? '—'}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, display: 'flex', gap: 16 }}>
              {account?.follower_count != null && <span>{account.follower_count.toLocaleString()} followers</span>}
              {account?.likes_count != null && <span>{account.likes_count.toLocaleString()} likes</span>}
              {account?.video_count != null && <span>{account.video_count.toLocaleString()} videos</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Videos ────────────────────────────────────────────────────────────────────

function VideosPanel({ adminKey, enabled }) {
  const [videos, setVideos] = useState(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!adminKey || !enabled) return;
    fetch('/api/business/videos', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => {
        // Open Platform errors: d.error.code !== 'ok'; Business API errors: d.code !== 0
        const errCode = d.error?.code;
        const hasError = (d.code && d.code !== 0) || (errCode && errCode !== 'ok' && errCode !== 'success');
        if (hasError) {
          setError(`API error ${d.code ?? errCode}: ${d.message ?? d.error?.message ?? 'unknown'}`);
          setVideos([]);
        } else {
          setVideos(d.data?.videos ?? d.videos ?? []);
        }
      })
      .catch(e => { setError(e.message); setVideos([]); });
  }, [adminKey, enabled]);

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Videos</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect TikTok Account Token to view videos.</p>
      ) : videos === undefined ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p>
      ) : error ? (
        <p style={{ fontSize: 13, color: '#f59e0b' }}>{error}</p>
      ) : videos.length === 0 ? (
        <p style={{ fontSize: 13, color: '#475569' }}>No videos found.</p>
      ) : (
        videos.map((v, i) => (
          <div key={v.id ?? i} style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: 12, marginBottom: 12 }}>
            {v.cover_image_url && <img src={v.cover_image_url} alt="" style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {v.title || v.id}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {v.create_time ? new Date(v.create_time * 1000).toLocaleDateString() : ''}
                {v.view_count != null && ` · ${v.view_count.toLocaleString()} views`}
                {v.like_count != null && ` · ${v.like_count.toLocaleString()} likes`}
                {v.comment_count != null && ` · ${v.comment_count.toLocaleString()} comments`}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Comment Management ────────────────────────────────────────────────────────

function CommentsPanel({ adminKey, enabled }) {
  const [videoId, setVideoId] = useState('');
  const [activeVideoId, setActiveVideoId] = useState('');
  const [comments, setComments] = useState(null);
  const [commentsError, setCommentsError] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  function extractVideoId(input) {
    // Accept raw ID or TikTok URL (e.g. tiktok.com/@user/video/7123456789)
    const match = input.match(/\/video\/(\d+)/);
    return match ? match[1] : input.trim();
  }

  function loadComments(vid) {
    const id = extractVideoId(vid || videoId);
    if (!id) return;
    setActiveVideoId(id);
    setComments(null);
    setCommentsError('');
    setActionMsg('');
    setReplyTo(null);
    setReplyText('');
    setCommentsLoading(true);
    fetch(`/api/business/comments?video_id=${encodeURIComponent(id)}`, { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => {
        if (d.code && d.code !== 0) { setCommentsError(`API error ${d.code}: ${d.message ?? 'unknown'}`); setComments([]); }
        else setComments(d.data?.comments ?? d.comments ?? []);
      })
      .catch(e => { setCommentsError(e.message); setComments([]); })
      .finally(() => setCommentsLoading(false));
  }

  async function doAction(action, extra = {}) {
    setActionMsg('');
    const body = { action, video_id: activeVideoId, ...extra };
    try {
      const res = await fetch('/api/business/comments', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.code && data.code !== 0) {
        setActionMsg('Error: ' + (data.message ?? JSON.stringify(data)));
      } else {
        setActionMsg('Done.');
        loadComments(activeVideoId);
      }
    } catch (e) {
      setActionMsg('Error: ' + e.message);
    }
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Comment Management</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect Business API to manage comments.</p>
      ) : (
        <>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
            Paste a TikTok video ID or URL to load its comments.
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              style={{ ...s.input, flex: 1 }}
              placeholder="Video ID or TikTok URL…"
              value={videoId}
              onChange={e => setVideoId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadComments()}
            />
            <button style={{ ...s.btn, whiteSpace: 'nowrap' }} onClick={() => loadComments()} disabled={!videoId.trim() || commentsLoading}>
              {commentsLoading ? 'Loading…' : 'Load'}
            </button>
          </div>

          {actionMsg && <div style={s.inlineMsg(!actionMsg.startsWith('Error'))}>{actionMsg}</div>}

          {commentsError ? (
            <p style={{ fontSize: 13, color: '#f59e0b' }}>{commentsError}</p>
          ) : comments === null ? null : comments.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569' }}>No comments found.</p>
          ) : (
            comments.map(c => (
              <div key={c.comment_id} style={{ borderBottom: '1px solid #0f172a', paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>@{c.username}</span>
                    {c.status === 'HIDDEN' && <span style={s.badge('#f59e0b')}>HIDDEN</span>}
                  </div>
                  <span style={{ fontSize: 11, color: '#475569' }}>
                    {c.create_time ? new Date(c.create_time * 1000).toLocaleDateString() : ''}
                    {c.like_count ? ` · ♥ ${c.like_count}` : ''}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', margin: '0 0 8px' }}>{c.text}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button style={s.btnSm} onClick={() => doAction(c.status === 'HIDDEN' ? 'show' : 'hide', { comment_id: c.comment_id })}>
                    {c.status === 'HIDDEN' ? 'Show' : 'Hide'}
                  </button>
                  <button style={s.btnDanger} onClick={() => doAction('delete', { comment_id: c.comment_id })}>Delete</button>
                  <button style={s.btnSm} onClick={() => doAction('pin', { comment_id: c.comment_id, is_pinned: true })}>Pin</button>
                  <button
                    style={{ ...s.btnSm, background: replyTo === c.comment_id ? '#475569' : '#334155' }}
                    onClick={() => { setReplyTo(replyTo === c.comment_id ? null : c.comment_id); setReplyText(''); }}
                  >
                    {replyTo === c.comment_id ? 'Cancel' : '↩ Reply'}
                  </button>
                </div>
                {replyTo === c.comment_id && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <input
                      style={{ ...s.input, flex: 1, padding: '8px 12px', fontSize: 13 }}
                      placeholder="Write a reply…"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && replyText.trim()) {
                          doAction('reply', { comment_id: c.comment_id, content: replyText });
                          setReplyText(''); setReplyTo(null);
                        }
                      }}
                    />
                    <button
                      style={{ ...s.btn, padding: '8px 14px', fontSize: 13 }}
                      onClick={() => {
                        if (!replyText.trim()) return;
                        doAction('reply', { comment_id: c.comment_id, content: replyText });
                        setReplyText(''); setReplyTo(null);
                      }}
                    >Send</button>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

// ── Automated Rules (keyword → hide comment) ──────────────────────────────────

function AutomatedRulesPanel({ adminKey, enabled }) {
  const [rules, setRules] = useState(null);
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function loadRules() {
    if (!adminKey) return;
    fetch('/api/business/rules', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => setRules(d.data?.rules ?? d.rules ?? []))
      .catch(() => setRules([]));
  }

  useEffect(() => { if (adminKey && enabled) loadRules(); }, [adminKey, enabled]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || !keywords.trim()) return;
    setSaving(true); setMsg('');
    try {
      const kws = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const res = await fetch('/api/business/rules', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, keywords: kws }),
      });
      const data = await res.json();
      if (data.code && data.code !== 0) setMsg('Error: ' + (data.message ?? JSON.stringify(data)));
      else { setMsg('Rule created.'); setName(''); setKeywords(''); loadRules(); }
    } catch (err) { setMsg('Error: ' + err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(ruleId) {
    const res = await fetch('/api/business/rules', {
      method: 'POST',
      headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', rule_id: ruleId }),
    });
    const data = await res.json();
    if (data.code === 0 || data.ok) setRules(prev => prev.filter(r => r.rule_id !== ruleId));
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Automated Comment Rules</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect Business API to manage automated rules.</p>
      ) : (
        <>
          {msg && <div style={s.inlineMsg(!msg.startsWith('Error'))}>{msg}</div>}
          <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                style={{ ...s.input, flex: 1 }}
                placeholder="Rule name (e.g. Block spam)"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...s.input, flex: 1 }}
                placeholder="Keywords, comma separated (e.g. spam, scam, follow me)"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
              />
              <button type="submit" style={{ ...s.btn, opacity: saving ? 0.6 : 1 }} disabled={saving}>
                {saving ? 'Saving…' : 'Add Rule'}
              </button>
            </div>
          </form>
          {rules === null ? (
            <p style={{ fontSize: 13, color: '#475569' }}>Loading rules…</p>
          ) : rules.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569' }}>No rules yet.</p>
          ) : (
            rules.map((rule, i) => (
              <div key={rule.rule_id ?? i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{rule.rule_name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{rule.status}</div>
                </div>
                <button onClick={() => handleDelete(rule.rule_id)} style={s.btnDanger}>Delete</button>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

// ── Optimizer Rules ───────────────────────────────────────────────────────────

function OptimizerRulesPanel({ adminKey, enabled }) {
  const [rules, setRules] = useState(null);
  const [msg, setMsg] = useState('');

  function loadRules() {
    if (!adminKey) return;
    fetch('/api/business/optimizer', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => setRules(d.data?.rules ?? d.rules ?? []))
      .catch(() => setRules([]));
  }

  useEffect(() => { if (adminKey && enabled) loadRules(); }, [adminKey, enabled]);

  async function toggleStatus(rule) {
    const newStatus = rule.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setMsg('');
    const res = await fetch('/api/business/optimizer', {
      method: 'POST',
      headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', rule_id: rule.rule_id, status: newStatus }),
    });
    const data = await res.json();
    if (data.code && data.code !== 0) setMsg('Error: ' + (data.message ?? JSON.stringify(data)));
    else loadRules();
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Optimizer Rules</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect Business API to view optimizer rules.</p>
      ) : (
        <>
          {msg && <div style={s.inlineMsg(!msg.startsWith('Error'))}>{msg}</div>}
          <button style={{ ...s.btnSm, marginBottom: 14 }} onClick={loadRules}>Refresh</button>
          {rules === null ? (
            <p style={{ fontSize: 13, color: '#475569' }}>Loading optimizer rules…</p>
          ) : rules.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569' }}>No optimizer rules found.</p>
          ) : (
            rules.map((rule, i) => (
              <div key={rule.rule_id ?? i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{rule.rule_name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{rule.rule_type} · {rule.status}</div>
                </div>
                <button
                  onClick={() => toggleStatus(rule)}
                  style={{ ...s.btnSm, color: rule.status === 'ACTIVE' ? '#10b981' : '#64748b' }}
                >
                  {rule.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </button>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

// ── Agency Applications ───────────────────────────────────────────────────────

function ApplicationsPanel() {
  const [apps, setApps] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch('/api/agency').then(r => r.json()).then(d => setApps(d.applications ?? []));
  }, []);

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Agency Applications</h2>
      {apps === null ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p>
      ) : apps.length === 0 ? (
        <p style={{ fontSize: 13, color: '#475569' }}>No applications yet.</p>
      ) : (
        apps.map((app, i) => (
          <div key={i} style={{ borderBottom: '1px solid #334155', paddingBottom: 12, marginBottom: 12, cursor: 'pointer' }} onClick={() => setExpanded(expanded === i ? null : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{app.tiktok} <span style={{ color: '#64748b', fontWeight: 400 }}>— {app.name}</span></div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                  {app.diamonds}/mo · {app.hours}/mo · {new Date(app.submitted_at).toLocaleDateString()}
                </div>
              </div>
              <span style={{ color: '#a855f7', fontSize: 14 }}>{expanded === i ? '▲' : '▼'}</span>
            </div>
            {expanded === i && (
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginTop: 8, fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Why they want to join:</div>
                {app.why}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ── DM Assistant ──────────────────────────────────────────────────────────────

function DMPanel() {
  const [dm, setDm] = useState('');
  const [context, setContext] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const ta = { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box', minHeight: 80, resize: 'vertical' };

  async function generate() {
    if (!dm.trim()) return;
    setLoading(true); setReply(''); setCopied(false);
    try {
      const res = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: dm, context }),
      });
      const data = await res.json();
      setReply(data.error ? 'Error: ' + data.error : data.reply);
    } catch (e) { setReply('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Hallie DM Assistant</h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Paste a TikTok DM — Hallie will draft a reply to copy back.</p>
      <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>Incoming DM</label>
      <textarea style={{ ...ta, marginBottom: 12 }} value={dm} onChange={e => setDm(e.target.value)} placeholder="Paste the TikTok DM here…" />
      <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>Context (optional)</label>
      <input style={{ ...s.input, marginBottom: 12 }} value={context} onChange={e => setContext(e.target.value)} placeholder="e.g. creator with 50k followers asking about joining the agency" />
      <div>
        <button style={s.btn} onClick={generate} disabled={loading || !dm.trim()}>{loading ? 'Generating…' : 'Generate Reply'}</button>
        {reply && !reply.startsWith('Error') && (
          <button
            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginLeft: 10 }}
            onClick={() => { navigator.clipboard.writeText(reply); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          >
            {copied ? 'Copied!' : 'Copy Reply'}
          </button>
        )}
      </div>
      {reply && <div style={{ marginTop: 16, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 16, fontSize: 14, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{reply}</div>}
    </div>
  );
}

// ── Test Moderation ───────────────────────────────────────────────────────────

function TestPanel({ adminKey }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

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
        style={{ background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box', minHeight: 80, resize: 'vertical' }}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste a comment, DM, or LIVE chat message to score it…"
      />
      <button style={{ ...s.btn, marginTop: 10 }} onClick={test} disabled={!text.trim()}>Score It</button>
      {result && (
        <pre style={{ marginTop: 12, background: '#0f172a', padding: 12, borderRadius: 8, fontSize: 12, color: '#94a3b8', overflowX: 'auto' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
