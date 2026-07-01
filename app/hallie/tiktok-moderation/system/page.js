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
              {account?.follower_count != null && <span>{account.follower_count.toLocaleString()} followers</span>}
              {account?.likes_count != null && <span>{account.likes_count.toLocaleString()} likes</span>}
              {account?.video_count != null && <span>{account.video_count.toLocaleString()} videos</span>}
            </div>
          </div>
          <a href="/auth/tiktok/system-login" style={{ marginLeft: 'auto', ...s.btnSm, textDecoration: 'none', display: 'inline-block' }}>Reconnect</a>
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
          <div key={v.id ?? i} style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: 12, marginBottom: 12 }}>
            {v.cover_image_url && <img src={v.cover_image_url} alt="" style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {v.title || <span style={{ color: '#475569', fontStyle: 'italic' }}>Untitled</span>}
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
    const match = trimmed.match(/\/video\/(\d+)/);
    if (match) return match[1];
    if (/^\d+$/.test(trimmed)) return trimmed;
    return null;
  }

  async function loadComments(vid) {
    const raw = vid || videoId;
    const id = extractVideoId(raw);
    if (!id) { setCommentsError('Paste a TikTok video URL or numeric video ID.'); return; }

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
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Paste a TikTok video ID or URL to load its comments.</p>
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
    </div>
  );
}

// ── Automated Rules ───────────────────────────────────────────────────────────

function AutomatedRulesPanel() {
  const [rules, setRules] = useState(null);
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function loadRules() {
    fetch('/api/system/rules')
      .then(r => r.json())
      .then(d => setRules(d.data?.rules ?? d.rules ?? []))
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
      if (data.code && data.code !== 0) setMsg('Error: ' + (data.message ?? JSON.stringify(data)));
      else { setMsg('Rule created.'); setName(''); setKeywords(''); loadRules(); }
    } catch (err) { setMsg('Error: ' + err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(ruleId) {
    await fetch('/api/system/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', rule_id: ruleId }),
    });
    setRules(prev => prev.filter(r => r.rule_id !== ruleId));
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Automated Comment Rules</h2>
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
          <div key={rule.rule_id ?? i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{rule.rule_name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{rule.status}</div>
            </div>
            <button onClick={() => handleDelete(rule.rule_id)} style={s.btnDanger}>Delete</button>
          </div>
        ))
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
