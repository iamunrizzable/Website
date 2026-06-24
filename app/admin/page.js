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
    if (params.get('business_connected')) setMsg('TikTok Business API connected successfully!');
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

          {/* Business API Connection */}
          <div style={s.card}>
            <h2 style={s.h2}>Business API</h2>
            {status && !status.redis_configured && (
              <div style={{ background: '#431407', border: '1px solid #ea580c', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#fed7aa' }}>
                Redis not configured — tokens are stored in memory and will be lost on server restart. Add <code>UPSTASH_REDIS_REST_URL</code> and <code>UPSTASH_REDIS_REST_TOKEN</code> to your Vercel environment variables to make the connection permanent.
              </div>
            )}
            {enabled ? (
              <p style={{ marginBottom: 12 }}>
                <span style={s.badge('#10b981')}>CONNECTED</span>
                {status.business_advertiser_id && (
                  <span style={{ fontSize: 12, color: '#64748b', marginLeft: 10 }}>
                    Advertiser ID: {status.business_advertiser_id}
                  </span>
                )}
                {status.business_expires_at && (
                  <span style={{ fontSize: 12, color: Date.now() > status.business_expires_at - 3600000 ? '#f59e0b' : '#475569', marginLeft: 10 }}>
                    · Expires {new Date(status.business_expires_at).toLocaleString()}
                  </span>
                )}
              </p>
            ) : (
              <p style={{ color: '#f59e0b', marginBottom: 12, fontSize: 14 }}>Not connected to Business API.</p>
            )}
            <button style={s.btn} onClick={() => { window.location.href = `/auth/tiktok/business/login?key=${encodeURIComponent(adminKey)}`; }}>
              {enabled ? 'Reconnect Business API' : 'Connect Business API'}
            </button>
          </div>

          <AccountPanel adminKey={adminKey} enabled={enabled} />
          <VideosPanel adminKey={adminKey} enabled={enabled} />
          <MentionsPanel adminKey={adminKey} enabled={enabled} />
          <TrendingPanel adminKey={adminKey} enabled={enabled} />
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

// ── Account Info ──────────────────────────────────────────────────────────────

function AccountPanel({ adminKey, enabled }) {
  const [account, setAccount] = useState(undefined); // undefined = loading, null = loaded/empty
  const [error, setError] = useState('');

  useEffect(() => {
    if (!adminKey || !enabled) return;
    setAccount(undefined);
    setError('');
    fetch('/api/business/account', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => {
        if (d.code && d.code !== 0) { setError(`API error ${d.code}: ${d.message ?? 'unknown'}`); setAccount(null); }
        else setAccount(d.data ?? null);
      })
      .catch(e => { setError(e.message); setAccount(null); });
  }, [adminKey, enabled]);

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Account Info</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect Business API above.</p>
      ) : account === undefined ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p>
      ) : error ? (
        <p style={{ fontSize: 13, color: '#f59e0b' }}>{error}</p>
      ) : !account ? (
        <p style={{ fontSize: 13, color: '#475569' }}>No account data returned.</p>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            {account.profile_image && (
              <img src={account.profile_image} alt="" style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #a855f7' }} />
            )}
            <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>{account.display_name}</div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {account.followers_count != null && <StatBox label="Followers" value={account.followers_count} />}
            {account.likes_count != null && <StatBox label="Likes" value={account.likes_count} />}
            {account.video_views_count != null && <StatBox label="Video Views" value={account.video_views_count} />}
            {account.comment_count != null && <StatBox label="Comments" value={account.comment_count} />}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 18px', textAlign: 'center', flex: '1 1 80px', minWidth: 80 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#d4a5ff' }}>{Number(value).toLocaleString()}</div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Videos & Comment Management ───────────────────────────────────────────────

function VideosPanel({ adminKey, enabled }) {
  const [videos, setVideos] = useState(undefined); // undefined = loading
  const [videosError, setVideosError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [comments, setComments] = useState(null);
  const [commentsError, setCommentsError] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!adminKey || !enabled) return;
    setVideos(undefined);
    setVideosError('');
    fetch('/api/business/videos', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => {
        if (d.code && d.code !== 0) { setVideosError(`API error ${d.code}: ${d.message ?? 'unknown'}`); setVideos([]); }
        else setVideos(d.data?.videos ?? d.videos ?? []);
      })
      .catch(e => { setVideosError(e.message); setVideos([]); });
  }, [adminKey, enabled]);

  function loadComments(video) {
    setSelectedVideo(video);
    setComments(null);
    setCommentsError('');
    setActionMsg('');
    setReplyTo(null);
    setReplyText('');
    setCommentsLoading(true);
    fetch(`/api/business/comments?video_id=${encodeURIComponent(video.video_id)}`, { headers: { 'x-admin-key': adminKey } })
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
    const body = { action, video_id: selectedVideo?.video_id, ...extra };
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
        if (selectedVideo) loadComments(selectedVideo);
      }
    } catch (e) {
      setActionMsg('Error: ' + e.message);
    }
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Videos & Comments</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect Business API to manage videos and comments.</p>
      ) : videos === undefined ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Loading videos…</p>
      ) : videosError ? (
        <p style={{ fontSize: 13, color: '#f59e0b' }}>{videosError}</p>
      ) : videos.length === 0 ? (
        <p style={{ fontSize: 13, color: '#475569' }}>No videos found.</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: selectedVideo ? 20 : 0 }}>
            {videos.map(v => (
              <div
                key={v.video_id}
                onClick={() => loadComments(v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                  background: selectedVideo?.video_id === v.video_id ? '#1a2744' : '#0f172a',
                  border: `1px solid ${selectedVideo?.video_id === v.video_id ? '#a855f7' : 'transparent'}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>
                    {v.title || `Video ${String(v.video_id).slice(-8)}`}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {v.statistics?.comment_count != null && `${v.statistics.comment_count} comments`}
                    {v.statistics?.play_count != null && ` · ${Number(v.statistics.play_count).toLocaleString()} plays`}
                    {v.create_time && ` · ${new Date(v.create_time * 1000).toLocaleDateString()}`}
                  </div>
                </div>
                <span style={{ color: '#64748b', fontSize: 11 }}>▶ Load</span>
              </div>
            ))}
          </div>

          {selectedVideo && (
            <div style={{ borderTop: '1px solid #334155', paddingTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>
                Comments — {selectedVideo.title || `Video ${String(selectedVideo.video_id).slice(-8)}`}
              </div>
              {actionMsg && <div style={s.inlineMsg(!actionMsg.startsWith('Error'))}>{actionMsg}</div>}
              {commentsLoading ? (
                <p style={{ fontSize: 13, color: '#475569' }}>Loading comments…</p>
              ) : commentsError ? (
                <p style={{ fontSize: 13, color: '#f59e0b' }}>{commentsError}</p>
              ) : !comments || comments.length === 0 ? (
                <p style={{ fontSize: 13, color: '#475569' }}>No comments found.</p>
              ) : (
                comments.map(c => (
                  <div key={c.comment_id} style={{ borderBottom: '1px solid #0f172a', paddingBottom: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>@{c.username}</span>
                        {c.status === 'HIDDEN' && <span style={s.badge('#f59e0b')}>HIDDEN</span>}
                        {c.is_pinned && <span style={s.badge('#a855f7')}>PINNED</span>}
                      </div>
                      <span style={{ fontSize: 11, color: '#475569' }}>
                        {c.create_time ? new Date(c.create_time * 1000).toLocaleDateString() : ''}
                        {c.like_count ? ` · ♥ ${c.like_count}` : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#cbd5e1', margin: '0 0 8px' }}>{c.text}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        style={s.btnSm}
                        onClick={() => doAction(c.status === 'HIDDEN' ? 'show' : 'hide', { comment_ids: [c.comment_id] })}
                      >
                        {c.status === 'HIDDEN' ? 'Show' : 'Hide'}
                      </button>
                      <button style={s.btnDanger} onClick={() => doAction('delete', { comment_id: c.comment_id })}>Delete</button>
                      <button style={s.btnSm} onClick={() => doAction('pin', { comment_id: c.comment_id, is_pinned: !c.is_pinned })}>
                        {c.is_pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button style={s.btnSm} onClick={() => doAction('like', { comment_id: c.comment_id, is_liked: true })}>♥ Like</button>
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
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Mentions ──────────────────────────────────────────────────────────────────

function MentionsPanel({ adminKey, enabled }) {
  const [tab, setTab] = useState('videos');
  const [videos, setVideos] = useState(null);
  const [comments, setComments] = useState(null);
  const [hashtags, setHashtags] = useState(null);
  const [newHashtag, setNewHashtag] = useState('');
  const [hashMsg, setHashMsg] = useState('');

  useEffect(() => {
    if (!adminKey || !enabled) return;
    fetch('/api/business/mentions?type=videos', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json()).then(d => setVideos(d.data?.mention_videos ?? d.videos ?? [])).catch(() => setVideos([]));
    fetch('/api/business/mentions?type=comments', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json()).then(d => setComments(d.data?.mention_comments ?? d.comments ?? [])).catch(() => setComments([]));
    fetch('/api/business/mentions?type=tracked_hashtags', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json()).then(d => setHashtags(d.data?.hashtags ?? d.hashtags ?? [])).catch(() => setHashtags([]));
  }, [adminKey, enabled]);

  async function handleHashtag(action, hashtag) {
    setHashMsg('');
    const res = await fetch('/api/business/mentions', {
      method: 'POST',
      headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, hashtag }),
    });
    const data = await res.json();
    if (data.code && data.code !== 0) {
      setHashMsg('Error: ' + (data.message ?? JSON.stringify(data)));
    } else {
      setHashMsg('Done.');
      fetch('/api/business/mentions?type=tracked_hashtags', { headers: { 'x-admin-key': adminKey } })
        .then(r => r.json()).then(d => setHashtags(d.data?.hashtags ?? d.hashtags ?? []));
    }
  }

  const MentionVideo = ({ v }) => (
    <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
      <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{v.title || v.video_id}</div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>@{v.username} · {v.create_time ? new Date(v.create_time * 1000).toLocaleDateString() : ''}</div>
    </div>
  );

  const MentionComment = ({ c }) => (
    <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>@{c.username}</span>
      <span style={{ fontSize: 11, color: '#64748b', marginLeft: 10 }}>{c.create_time ? new Date(c.create_time * 1000).toLocaleDateString() : ''}</span>
      <p style={{ fontSize: 13, color: '#cbd5e1', margin: '4px 0 0' }}>{c.text}</p>
    </div>
  );

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Mentions</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect Business API to monitor mentions.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <button style={s.tab(tab === 'videos')} onClick={() => setTab('videos')}>Videos</button>
            <button style={s.tab(tab === 'comments')} onClick={() => setTab('comments')}>Comments</button>
            <button style={s.tab(tab === 'hashtags')} onClick={() => setTab('hashtags')}>Hashtags</button>
          </div>

          {tab === 'videos' && (
            videos === null ? <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p> :
            videos.length === 0 ? <p style={{ fontSize: 13, color: '#475569' }}>No mention videos found.</p> :
            videos.map((v, i) => <MentionVideo key={i} v={v} />)
          )}

          {tab === 'comments' && (
            comments === null ? <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p> :
            comments.length === 0 ? <p style={{ fontSize: 13, color: '#475569' }}>No mention comments found.</p> :
            comments.map((c, i) => <MentionComment key={i} c={c} />)
          )}

          {tab === 'hashtags' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  style={{ ...s.input, flex: 1 }}
                  placeholder="Add hashtag to track (e.g. tjbmanagement)"
                  value={newHashtag}
                  onChange={e => setNewHashtag(e.target.value)}
                />
                <button
                  style={s.btn}
                  onClick={async () => {
                    if (!newHashtag.trim()) return;
                    await handleHashtag('add_hashtag', newHashtag.trim());
                    setNewHashtag('');
                  }}
                >Track</button>
              </div>
              {hashMsg && <div style={s.inlineMsg(!hashMsg.startsWith('Error'))}>{hashMsg}</div>}
              {hashtags === null ? <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p> :
               hashtags.length === 0 ? <p style={{ fontSize: 13, color: '#475569' }}>No tracked hashtags yet.</p> :
               hashtags.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                  <span style={{ fontSize: 14, color: '#e2e8f0' }}>#{h.hashtag ?? h}</span>
                  <button style={s.btnDanger} onClick={() => handleHashtag('remove_hashtag', h.hashtag ?? h)}>Remove</button>
                </div>
               ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── Trending & Discovery ──────────────────────────────────────────────────────

function TrendingPanel({ adminKey, enabled }) {
  const [mode, setMode] = useState('trending');
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    setResults(null);
    try {
      const params = new URLSearchParams({ type: mode });
      if (keyword.trim()) params.set('keyword', keyword.trim());
      const res = await fetch(`/api/business/trending?${params}`, { headers: { 'x-admin-key': adminKey } });
      setResults(await res.json());
    } catch (e) {
      setResults({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  const items = results?.data?.videos ?? results?.data?.keywords ?? results?.data?.hashtags ?? results?.data?.benchmarks ?? [];

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Trending & Discovery</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect Business API to explore trends.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {['trending', 'keywords', 'hashtags', 'benchmark'].map(m => (
              <button key={m} style={s.tab(mode === m)} onClick={() => { setMode(m); setResults(null); }}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          {mode !== 'benchmark' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                style={{ ...s.input, flex: 1 }}
                placeholder={mode === 'hashtags' ? 'Keyword for hashtag suggestions…' : 'Search keyword (optional)…'}
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
              <button style={{ ...s.btn, whiteSpace: 'nowrap' }} onClick={search} disabled={loading}>
                {loading ? 'Loading…' : 'Search'}
              </button>
            </div>
          )}
          {mode === 'benchmark' && (
            <button style={{ ...s.btn, marginBottom: 14 }} onClick={search} disabled={loading}>
              {loading ? 'Loading…' : 'Load Benchmark'}
            </button>
          )}
          {results?.error && <p style={{ color: '#ef4444', fontSize: 13 }}>{results.error}</p>}
          {items.length > 0 && (
            <div>
              {items.map((item, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
                  {item.title && <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{item.title}</div>}
                  {item.keyword && <div style={{ fontSize: 13, color: '#d4a5ff', fontWeight: 500 }}>#{item.keyword}</div>}
                  {item.hashtag && <div style={{ fontSize: 13, color: '#d4a5ff', fontWeight: 500 }}>#{item.hashtag}</div>}
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                    {item.play_count != null && `${Number(item.play_count).toLocaleString()} plays`}
                    {item.video_count != null && ` · ${Number(item.video_count).toLocaleString()} videos`}
                    {item.search_volume != null && ` · vol: ${Number(item.search_volume).toLocaleString()}`}
                  </div>
                </div>
              ))}
            </div>
          )}
          {results && items.length === 0 && !results.error && (
            <p style={{ fontSize: 13, color: '#475569' }}>No results found.</p>
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
