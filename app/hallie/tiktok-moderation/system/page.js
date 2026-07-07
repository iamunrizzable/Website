'use client';

import { useEffect, useState, useCallback } from 'react';

const ACTION_COLORS = { hide: '#ef4444', flag: '#f59e0b', review: '#3b82f6', allow: '#10b981' };

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
  // Shared OK / Hidden pill — identical on /admin and /system. Keep in sync.
  statusBadge: (hidden) => ({
    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0,
    background: hidden ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)',
    color: hidden ? '#f59e0b' : '#10b981',
  }),
};

export default function SystemPage() {
  const [connected, setConnected] = useState(null);
  const [msg, setMsg] = useState('');

  const checkStatus = useCallback(async () => {
    const res = await fetch('/api/system/status');
    const data = await res.json();
    setConnected(data.connected);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) { setMsg('TikTok account connected!'); setTimeout(() => setMsg(''), 4000); }
    if (params.get('error')) setMsg('Error: ' + params.get('error'));
    checkStatus();
  }, [checkStatus]);

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
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.3); }
          50% { text-shadow: 0 0 40px rgba(168,85,247,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(59,130,246,0.5); }
        }
      `}</style>
      <div style={s.page}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 4, animation: 'glowPulse 3s ease-in-out infinite' }}>
              Hallie
            </h1>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>TikTok Account Automation · Powered by TJB Management Inc.</p>
          </div>

          {msg && <div style={s.msg}>{msg}</div>}

          {connected === null ? (
            <div style={{ ...s.card, textAlign: 'center', padding: 40 }}>
              <p style={{ color: '#64748b', fontSize: 14 }}>Loading…</p>
            </div>
          ) : !connected ? (
            <ConnectPrompt />
          ) : (
            <>
              <AccountPanel />
              <VideosPanel />
              <CommentsPanel />
              <SyncPanel />
              <AutomatedRulesPanel />
              <MentionsPanel />
              <TrendingPanel />
              <TestPanel />
            </>
          )}

        </div>
      </div>
    </>
  );
}

// ── Connect Prompt ────────────────────────────────────────────────────────────

function ConnectPrompt() {
  return (
    <div style={{ ...s.card, textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
      <h2 style={{ color: '#d4a5ff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Connect Your TikTok Account</h2>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
        Sign in with TikTok to start automating your account — comment moderation, sync, and more.
      </p>
      <a
        href="/auth/tiktok/system-login"
        style={{ ...s.btn, display: 'inline-block', textDecoration: 'none', padding: '14px 32px', fontSize: 15 }}
      >
        Connect with TikTok
      </a>
    </div>
  );
}

// ── Account Info ──────────────────────────────────────────────────────────────

function AccountPanel() {
  const [account, setAccount] = useState(undefined);
  const [error, setError] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch('/api/system/account')
      .then(r => r.json())
      .then(d => {
        const errCode = d.error?.code;
        const hasError = (d.code && d.code !== 0) || (errCode && errCode !== 'ok' && errCode !== 'success');
        if (hasError) { setError(`API error ${d.code ?? errCode}: ${d.message ?? d.error?.message ?? 'unknown'}`); setAccount(null); }
        else setAccount(d.data ?? d);
      })
      .catch(e => { setError(e.message); setAccount(null); });
  }, []);

  async function disconnect() {
    if (!confirm('Disconnect your TikTok account and delete all session data? You can reconnect at any time.')) return;
    setDisconnecting(true);
    await fetch('/api/system/disconnect', { method: 'POST' });
    window.location.href = '/hallie/tiktok-moderation/system';
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Account</h2>
      {account === undefined ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p>
      ) : error ? (
        <p style={{ fontSize: 13, color: '#f59e0b' }}>{error}</p>
      ) : (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {account?.profile_image && <img src={account.profile_image} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />}
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>{account?.display_name ?? '—'}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {account?.username && <span>@{account.username}</span>}
              {account?.followers_count != null && <span>{account.followers_count.toLocaleString()} followers</span>}
              {account?.likes != null && <span>{account.likes.toLocaleString()} likes</span>}
              {account?.videos_count != null && <span>{account.videos_count.toLocaleString()} videos</span>}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexShrink: 0 }}>
            <a href="/auth/tiktok/system-login" style={{ ...s.btnSm, textDecoration: 'none', display: 'inline-block' }}>Reconnect</a>
            <button onClick={disconnect} disabled={disconnecting} style={{ ...s.btnDanger, fontSize: 11 }}>
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Videos ────────────────────────────────────────────────────────────────────

function VideosPanel() {
  const [videos, setVideos] = useState(undefined);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch('/api/system/videos')
      .then(r => r.json())
      .then(d => {
        const errCode = d.error?.code;
        const hasError = (d.code && d.code !== 0) || (errCode && errCode !== 'ok' && errCode !== 'success');
        if (hasError) { setError(`API error ${d.code ?? errCode}: ${d.message ?? d.error?.message ?? 'unknown'}`); setVideos([]); }
        else setVideos(d.data?.videos ?? d.videos ?? []);
      })
      .catch(e => { setError(e.message); setVideos([]); });
  }, []);

  return (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ ...s.h2, marginBottom: 0 }}>Videos</h2>
        <button onClick={() => setCollapsed(c => !c)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', padding: '4px 8px' }}>
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>
      {!collapsed && (videos === undefined ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p>
      ) : error ? (
        <p style={{ fontSize: 13, color: '#f59e0b' }}>{error}</p>
      ) : videos.length === 0 ? (
        <p style={{ fontSize: 13, color: '#475569' }}>No videos found.</p>
      ) : (
        videos.map((v, i) => (
          <div key={v.item_id ?? i} style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: 12, marginBottom: 12 }}>
            {v.thumbnail_url && <img src={v.thumbnail_url} alt="" style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {v.caption || <span style={{ color: '#475569', fontStyle: 'italic' }}>Untitled</span>}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {v.create_time ? new Date(v.create_time * 1000).toLocaleDateString() : ''}
                {v.video_views != null && ` · ${v.video_views.toLocaleString()} views`}
                {v.likes != null && ` · ${v.likes.toLocaleString()} likes`}
                {v.comments != null && ` · ${v.comments.toLocaleString()} comments`}
              </div>
            </div>
          </div>
        ))
      ))}
    </div>
  );
}

// ── Comment Management ────────────────────────────────────────────────────────

function CommentsPanel() {
  const [videoId, setVideoId] = useState('');
  const [activeVideoId, setActiveVideoId] = useState('');
  const [comments, setComments] = useState(null);
  const [commentsError, setCommentsError] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  function extractVideoId(input) {
    const trimmed = input.trim();
    const match = trimmed.match(/\/(?:video|photo)\/(\d+)/);
    if (match) return match[1];
    if (/^\d+$/.test(trimmed)) return trimmed;
    return null;
  }

  function isShortUrl(input) {
    return /tiktok\.com\/t\//i.test(input.trim());
  }

  async function loadComments(vid) {
    const raw = vid || videoId;
    let id = extractVideoId(raw);

    if (!id && isShortUrl(raw)) {
      setCommentsLoading(true);
      setComments(null);
      setCommentsError('');
      try {
        const r = await fetch(`/api/system/resolve-video?url=${encodeURIComponent(raw.trim())}`);
        const d = await r.json();
        if (d.error) { setCommentsError(`Could not resolve link: ${d.error}`); setCommentsLoading(false); return; }
        id = d.video_id;
      } catch (e) {
        setCommentsError(`Could not resolve link: ${e.message}`);
        setCommentsLoading(false);
        return;
      }
    }

    if (!id) { setCommentsError('Paste a TikTok video URL, a short share link (tiktok.com/t/…), or a numeric video ID.'); return; }

    setActiveVideoId(id);
    setComments(null);
    setCommentsError('');
    setActionMsg('');
    setReplyTo(null);
    setReplyText('');
    setCommentsLoading(true);

    fetch(`/api/system/comments?video_id=${encodeURIComponent(id)}`)
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
    try {
      const res = await fetch('/api/system/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, video_id: activeVideoId, ...extra }),
      });
      const data = await res.json();
      if (data.code && data.code !== 0) setActionMsg('Error: ' + (data.message ?? JSON.stringify(data)));
      else { setActionMsg('Done.'); loadComments(activeVideoId); }
    } catch (e) { setActionMsg('Error: ' + e.message); }
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Comment Management</h2>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Paste a TikTok video or photo link, a share link (tiktok.com/t/…), or a numeric ID to load its comments.</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>@{c.username}</span>
                <span style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap' }}>
                  {c.create_time ? new Date(c.create_time * 1000).toLocaleDateString() : ''}
                  {c.like_count ? ` · ♥ ${c.like_count}` : ''}
                </span>
              </div>
              <span style={s.statusBadge(c.status === 'HIDDEN')}>
                {c.status === 'HIDDEN' ? 'Hidden' : 'OK'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#cbd5e1', margin: '0 0 8px' }}>{c.text}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={s.btnSm} onClick={() => doAction(c.status === 'HIDDEN' ? 'show' : 'hide', { comment_id: c.comment_id })}>
                {c.status === 'HIDDEN' ? 'Show' : 'Hide'}
              </button>
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
                <button style={{ ...s.btn, padding: '8px 14px', fontSize: 13 }} onClick={() => {
                  if (!replyText.trim()) return;
                  doAction('reply', { comment_id: c.comment_id, content: replyText });
                  setReplyText(''); setReplyTo(null);
                }}>Send</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ── Comment Sync ──────────────────────────────────────────────────────────────

function SyncPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('all');
  const [count, setCount] = useState('20');

  const tabStyle = (active) => ({
    padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: active ? 600 : 400,
    background: active ? '#334155' : 'transparent', color: active ? '#e2e8f0' : '#64748b', border: 'none',
  });

  async function runSync() {
    setLoading(true);
    setResult(null);
    const maxVideos = mode === 'custom' ? parseInt(count, 10) || 20 : null;
    try {
      const res = await fetch('/api/system/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxVideos }),
      });
      setResult(await res.json());
    } catch (e) { setResult({ error: e.message }); }
    finally { setLoading(false); }
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Comment Sync</h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
        Scores all new comments and auto-hides anything that triggers the filter.
      </p>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <button style={tabStyle(mode === 'all')} onClick={() => setMode('all')}>All videos</button>
        <button style={tabStyle(mode === 'custom')} onClick={() => setMode('custom')}>Last N videos</button>
      </div>
      {mode === 'custom' && (
        <input
          style={{ ...s.input, marginBottom: 12, width: 120 }}
          type="number" min="1"
          value={count}
          onChange={e => setCount(e.target.value)}
          placeholder="# of videos"
        />
      )}
      <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} onClick={runSync} disabled={loading}>
        {loading ? 'Syncing…' : 'Sync Now'}
      </button>
      {result && (
        <div style={{ marginTop: 12, fontSize: 13 }}>
          {result.error ? (
            <span style={{ color: '#f59e0b' }}>Error: {result.error}</span>
          ) : (
            <span style={{ color: '#10b981' }}>
              Done — {result.synced} comment{result.synced !== 1 ? 's' : ''} processed
              {result.hidden > 0 ? `, ${result.hidden} hidden` : ''}
            </span>
          )}
        </div>
      )}
      {result?.comments?.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 320, overflowY: 'auto', border: '1px solid #334155', borderRadius: 8 }}>
          {[...result.comments].sort((a, b) => (a.action === 'hidden' ? -1 : 0) - (b.action === 'hidden' ? -1 : 0)).map(c => (
            <div key={c.comment_id} style={{ padding: '10px 12px', borderBottom: '1px solid #1e293b', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>@{c.username ?? 'unknown'}</span>
                <span style={s.statusBadge(c.action === 'hidden')}>
                  {c.action === 'hidden' ? 'Hidden' : 'OK'}
                </span>
              </div>
              <div style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>{c.text || <em style={{ color: '#64748b' }}>(no text)</em>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Automated Rules (keyword → auto-hide, applied during Comment Sync) ────────

function AutomatedRulesPanel() {
  const [rules, setRules] = useState(null);
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function loadRules() {
    fetch('/api/system/rules')
      .then(r => r.json())
      .then(d => setRules(d.rules ?? []))
      .catch(() => setRules([]));
  }

  useEffect(() => { loadRules(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || !keywords.trim()) return;
    setSaving(true); setMsg('');
    try {
      const kws = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const res = await fetch('/api/system/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, keywords: kws }),
      });
      const data = await res.json();
      if (!data.ok) setMsg('Error: ' + (data.error ?? JSON.stringify(data)));
      else { setMsg('Rule created.'); setName(''); setKeywords(''); setRules(data.rules); }
    } catch (err) { setMsg('Error: ' + err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(ruleId) {
    const res = await fetch('/api/system/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', rule_id: ruleId }),
    });
    const data = await res.json();
    if (data.ok) setRules(data.rules);
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Automated Comment Rules</h2>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
        Comments matching any rule's keywords are automatically hidden the next time Comment Sync runs — not in real time.
      </p>
      {msg && <div style={s.inlineMsg(!msg.startsWith('Error'))}>{msg}</div>}
      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input style={{ ...s.input, flex: 1 }} placeholder="Rule name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...s.input, flex: 1 }} placeholder="Keywords, comma separated" value={keywords} onChange={e => setKeywords(e.target.value)} />
          <button type="submit" style={{ ...s.btn, opacity: saving ? 0.6 : 1 }} disabled={saving}>{saving ? 'Saving…' : 'Add Rule'}</button>
        </div>
      </form>
      {rules === null ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading rules…</p>
      ) : rules.length === 0 ? (
        <p style={{ fontSize: 13, color: '#475569' }}>No rules yet.</p>
      ) : (
        rules.map((rule, i) => (
          <div key={rule.id ?? i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{rule.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{(rule.keywords ?? []).join(', ')}</div>
            </div>
            <button onClick={() => handleDelete(rule.id)} style={s.btnDanger}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

// ── Mentions ──────────────────────────────────────────────────────────────────

function MentionsPanel() {
  const [tab, setTab] = useState('videos');
  const [data, setData] = useState(undefined);
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  function extractList(type, d) {
    const dd = d.data ?? {};
    if (type === 'videos') return dd.videos ?? [];
    if (type === 'comments') return dd.comments ?? [];
    if (type === 'top_words') return dd.words ?? dd.top_words ?? dd.list ?? [];
    if (type === 'top_hashtags') return dd.hashtags ?? dd.top_hashtags ?? dd.list ?? [];
    if (type === 'tracked_hashtags') return dd.hashtags ?? dd.list ?? [];
    return [];
  }

  function load(type) {
    setData(undefined);
    setError('');
    fetch(`/api/system/mentions?type=${type}`)
      .then(r => r.json())
      .then(d => {
        setRaw(d);
        if (d.code && d.code !== 0) { setError(`API error ${d.code}: ${d.message ?? 'unknown'}`); setData([]); }
        else setData(extractList(type, d));
      })
      .catch(e => { setError(e.message); setData([]); });
  }

  useEffect(() => { load(tab); }, [tab]);

  async function addHashtag() {
    if (!hashtag.trim()) return;
    setActionMsg('');
    try {
      const res = await fetch('/api/system/mentions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_hashtag', hashtag: hashtag.trim() }),
      });
      const d = await res.json();
      if (d.code && d.code !== 0) setActionMsg(`Error: ${d.message ?? 'unknown'}`);
      else { setActionMsg('Hashtag added.'); setHashtag(''); load('tracked_hashtags'); }
    } catch (e) { setActionMsg('Error: ' + e.message); }
  }

  async function removeHashtag(tag) {
    try {
      await fetch('/api/system/mentions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_hashtag', hashtag: tag }),
      });
      load('tracked_hashtags');
    } catch {}
  }

  const TABS = [
    ['videos', 'Videos'],
    ['comments', 'Comments'],
    ['top_words', 'Top Words'],
    ['top_hashtags', 'Top Hashtags'],
    ['tracked_hashtags', 'Tracked Hashtags'],
  ];

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Mentions</h2>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {TABS.map(([key, label]) => (
          <button key={key} style={s.tab(tab === key)} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'tracked_hashtags' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Add hashtag to track (without #)…"
            value={hashtag}
            onChange={e => setHashtag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addHashtag()}
          />
          <button style={{ ...s.btn, whiteSpace: 'nowrap' }} onClick={addHashtag}>Add</button>
        </div>
      )}
      {actionMsg && <div style={s.inlineMsg(!actionMsg.startsWith('Error'))}>{actionMsg}</div>}

      {data === undefined ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p>
      ) : error ? (
        <p style={{ fontSize: 13, color: '#f59e0b' }}>{error}</p>
      ) : data.length === 0 ? (
        <p style={{ fontSize: 13, color: '#475569' }}>No data found.</p>
      ) : (
        data.map((item, i) => (
          <div key={item.video_id ?? item.comment_id ?? item.hashtag ?? item.word ?? i} style={{ borderBottom: '1px solid #0f172a', paddingBottom: 10, marginBottom: 10, fontSize: 13, color: '#cbd5e1' }}>
            {tab === 'videos' && <>{item.title ?? item.video_id} <span style={{ color: '#64748b' }}>{item.create_time ? new Date(item.create_time * 1000).toLocaleDateString() : ''}</span></>}
            {tab === 'comments' && <>@{item.username ?? 'unknown'}: {item.text}</>}
            {tab === 'top_words' && (item.word ? <>{item.word}{item.count != null && ` · ${item.count}`}</> : JSON.stringify(item))}
            {tab === 'top_hashtags' && (item.hashtag ? <>#{item.hashtag}{item.count != null && ` · ${item.count}`}</> : JSON.stringify(item))}
            {tab === 'tracked_hashtags' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>#{item.hashtag ?? item}</span>
                <button style={s.btnDanger} onClick={() => removeHashtag(item.hashtag ?? item)}>Remove</button>
              </div>
            )}
          </div>
        ))
      )}
      {raw && (
        <button style={{ ...s.btnSm, marginTop: 4 }} onClick={() => alert(JSON.stringify(raw, null, 2))}>
          View raw API response
        </button>
      )}
    </div>
  );
}

// ── Trending & Discovery ──────────────────────────────────────────────────────

function TrendingPanel() {
  const [tab, setTab] = useState('trending');
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState(undefined);
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState('');

  function extractList(type, d) {
    const dd = d.data ?? {};
    if (type === 'trending') return dd.list ?? dd.trending_list ?? dd.videos ?? [];
    if (type === 'keywords') return dd.keywords ?? dd.list ?? [];
    if (type === 'hashtags') return dd.hashtags ?? dd.list ?? [];
    if (type === 'benchmark') return dd.benchmark ? [dd.benchmark] : (Array.isArray(dd) ? dd : dd.list ?? []);
    return [];
  }

  function load() {
    setData(undefined);
    setError('');
    const params = new URLSearchParams({ type: tab });
    if (keyword.trim()) params.set('keyword', keyword.trim());
    fetch(`/api/system/trending?${params}`)
      .then(r => r.json())
      .then(d => {
        setRaw(d);
        if (d.code && d.code !== 0) { setError(`API error ${d.code}: ${d.message ?? 'unknown'}`); setData([]); }
        else setData(extractList(tab, d));
      })
      .catch(e => { setError(e.message); setData([]); });
  }

  useEffect(() => { load(); }, [tab]);

  const TABS = [
    ['trending', 'Trending'],
    ['keywords', 'Keywords'],
    ['hashtags', 'Hashtag Suggestions'],
    ['benchmark', 'Benchmark'],
  ];

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Trending & Discovery</h2>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {TABS.map(([key, label]) => (
          <button key={key} style={s.tab(tab === key)} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {tab !== 'benchmark' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Keyword (optional)…"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
          />
          <button style={{ ...s.btn, whiteSpace: 'nowrap' }} onClick={load}>Search</button>
        </div>
      )}

      {data === undefined ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p>
      ) : error ? (
        <p style={{ fontSize: 13, color: '#f59e0b' }}>{error}</p>
      ) : data.length === 0 ? (
        <p style={{ fontSize: 13, color: '#475569' }}>No data found.</p>
      ) : (
        data.map((item, i) => (
          <div key={item.id ?? item.keyword ?? item.hashtag ?? i} style={{ borderBottom: '1px solid #0f172a', paddingBottom: 10, marginBottom: 10, fontSize: 13, color: '#cbd5e1' }}>
            {JSON.stringify(item)}
          </div>
        ))
      )}
      {raw && (
        <button style={{ ...s.btnSm, marginTop: 4 }} onClick={() => alert(JSON.stringify(raw, null, 2))}>
          View raw API response
        </button>
      )}
    </div>
  );
}

// ── Test Moderation ───────────────────────────────────────────────────────────

function TestPanel() {
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
        placeholder="Paste a comment to score it…"
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
