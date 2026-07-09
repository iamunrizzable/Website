'use client';

import './page.css';

import { useEffect, useState, useCallback } from 'react';

const ACTION_COLORS = {
  hide: '#ef4444',
  flag: '#f59e0b',
  review: '#3b82f6',
  allow: '#10b981',
};

// The complete, valid business_category enum for /business/benchmark/,
// confirmed directly from TikTok's own validation error message (API
// error 40002 lists every allowed value when a bad one is sent).
const BUSINESS_CATEGORIES = [
  'PERSONAL_BLOG', 'MACHINERY_AND_EQUIPMENT', 'HEALTH_AND_WELLNESS', 'PETS',
  'AUTOMOTIVE_AND_TRANSPORTATION', 'EDUCATION_AND_TRAINING', 'FOOD_AND_BEVERAGE',
  'REAL_ESTATE', 'ELECTRONICS', 'SHOPPING_AND_RETAIL', 'PUBLIC_ADMINISTRATION',
  'ART_AND_CRAFTS', 'BABY', 'GAMING', 'RESTAURANTS_AND_BARS',
  'HOME_FURNITURE_AND_APPLIANCES', 'PROFESSIONAL_SERVICES', 'SOFTWARE_AND_APPS',
  'MEDIA_AND_ENTERTAINMENT', 'BEAUTY', 'SPORTS_FITNESS_AND_OUTDOORS',
  'CLOTHING_AND_ACCESSORIES', 'TRAVEL_AND_TOURISM', 'OTHERS', 'FINANCE_AND_INVESTING',
];
function categoryLabel(code) {
  return code.split('_').map(w => (w === 'AND' ? '&' : w[0] + w.slice(1).toLowerCase())).join(' ');
}

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
  // Shared OK / Hidden pill — identical on /admin and /system. Keep in sync.
  statusBadge: (hidden) => ({
    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0,
    background: hidden ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)',
    color: hidden ? '#f59e0b' : '#10b981',
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
    if (params.get('business_connected') || params.get('account_connected')) {
      setTimeout(() => setMsg(''), 4000);
    }
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
          <SyncPanel adminKey={adminKey} enabled={accountEnabled} />
          <AutomatedRulesPanel adminKey={adminKey} enabled={accountEnabled} />
          <MentionsPanel adminKey={adminKey} enabled={accountEnabled} />
          <TrendingPanel adminKey={adminKey} enabled={accountEnabled} />
          <ExportTokenPanel adminKey={adminKey} enabled={enabled} />
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
          <button style={{ ...s.btnSm, whiteSpace: 'nowrap' }} onClick={() => { window.location.href = '/auth/tiktok/business/login'; }}>
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
              {accountEnabled && status?.account_scope && <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>scopes: {status.account_scope}</div>}
              {accountEnabled && !status?.account_scope && <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>scopes: none stored</div>}
            </div>
          </div>
          <button style={{ ...s.btnSm, whiteSpace: 'nowrap' }} onClick={() => { window.location.href = '/auth/tiktok/account-login'; }}>
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
        </div>
      )}
    </div>
  );
}

// ── Videos ────────────────────────────────────────────────────────────────────

function VideosPanel({ adminKey, enabled }) {
  const [videos, setVideos] = useState(undefined);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ ...s.h2, marginBottom: 0 }}>Videos</h2>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', padding: '4px 8px' }}
        >{collapsed ? 'Show' : 'Hide'}</button>
      </div>
      {!collapsed && (!enabled ? (
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
                {v.title ? v.title : <span style={{ color: '#475569', fontStyle: 'italic' }}>Untitled</span>}
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
        const r = await fetch(`/api/admin/resolve-video?url=${encodeURIComponent(raw.trim())}`, { headers: { 'x-admin-key': adminKey } });
        const d = await r.json();
        if (d.error) { setCommentsError(`Could not resolve link: ${d.error}`); setCommentsLoading(false); return; }
        id = d.video_id;
      } catch (e) {
        setCommentsError(`Could not resolve link: ${e.message}`);
        setCommentsLoading(false);
        return;
      }
    }

    if (!id) {
      setCommentsError('Paste a TikTok video URL, a short share link (tiktok.com/t/…), or a raw numeric video ID.');
      return;
    }

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
        setActionMsg('Error: ' + (data.message ?? JSON.stringify(data)) + (data._sent ? '\nSent: ' + data._sent : ''));
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
            Paste a TikTok video or photo link, a share link (tiktok.com/t/…), or a numeric ID to load its comments.
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

          {activeVideoId && (
            <details style={{ marginBottom: 10 }}>
              <summary style={{ fontSize: 11, color: '#475569', cursor: 'pointer' }}>Debug raw response</summary>
              <button style={{ ...s.btnSm, marginTop: 6 }} onClick={() =>
                fetch(`/api/admin/debug-comments?video_id=${activeVideoId}`, { headers: { 'x-admin-key': adminKey } })
                  .then(r => r.text()).then(t => alert(t)).catch(e => alert(e.message))
              }>Fetch raw TikTok data</button>
            </details>
          )}

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
                  {c.owner && <button style={s.btnDanger} onClick={() => doAction('delete', { comment_id: c.comment_id })}>Delete</button>}
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

// ── Comment Sync ─────────────────────────────────────────────────────────────

function SyncPanel({ adminKey, enabled }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('all');
  const [count, setCount] = useState('20');

  async function runSync() {
    setLoading(true);
    setResult(null);
    const maxVideos = mode === 'custom' ? parseInt(count, 10) || 20 : null;
    try {
      const res = await fetch('/api/admin/sync-comments', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxVideos }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  const tabStyle = (active) => ({
    padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: active ? 600 : 400,
    background: active ? '#334155' : 'transparent', color: active ? '#e2e8f0' : '#64748b', border: 'none',
  });

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Comment Sync</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect TikTok Account Token to sync comments.</p>
      ) : (
        <>
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
              type="number"
              min="1"
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
                  Done — {result.synced} new comment{result.synced !== 1 ? 's' : ''} processed
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
        </>
      )}
    </div>
  );
}

// ── Automated Rules (keyword → auto-hide, applied during Comment Sync) ────────

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
      .then(d => setRules(d.rules ?? []))
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
      if (!data.ok) setMsg('Error: ' + (data.error ?? JSON.stringify(data)));
      else { setMsg('Rule created.'); setName(''); setKeywords(''); setRules(data.rules); }
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
    if (data.ok) setRules(data.rules);
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Automated Comment Rules</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect TikTok Account Token to manage automated rules.</p>
      ) : (
        <>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
            Comments matching any rule's keywords are automatically hidden the next time Comment Sync runs (manually or via the daily cron) — not in real time.
          </p>
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
              <div key={rule.id ?? i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{rule.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{(rule.keywords ?? []).join(', ')}</div>
                </div>
                <button onClick={() => handleDelete(rule.id)} style={s.btnDanger}>Delete</button>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

// ── Mentions ──────────────────────────────────────────────────────────────────

function MentionsPanel({ adminKey, enabled }) {
  const [tab, setTab] = useState('videos');
  const [data, setData] = useState(undefined);
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [username, setUsername] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyUsername, setVerifyUsername] = useState('');

  // Pull the connected account's own username from account info instead of
  // asking the operator to type it — hashtag/manage/list requires it as a
  // param but there's no reason to make a human supply data we already have.
  useEffect(() => {
    if (!adminKey || !enabled) return;
    fetch('/api/business/account', { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => {
        const u = (d.data ?? d)?.username;
        if (u) { setUsername(u); setVerifyUsername(prev => prev || u); }
      })
      .catch(() => {});
  }, [adminKey, enabled]);

  function extractList(type, d) {
    const dd = d.data ?? {};
    const known = {
      videos: dd.videos,
      comments: dd.comments,
      top_words: dd.words ?? dd.top_words,
      top_hashtags: dd.hashtags ?? dd.top_hashtags,
      tracked_hashtags: dd.hashtags,
    }[type];
    if (Array.isArray(known)) return known;
    // Field names vary per endpoint — fall back to the first array in data
    for (const v of Object.values(dd)) if (Array.isArray(v)) return v;
    return [];
  }

  function load(type) {
    if (!adminKey || !enabled) return;
    setData(undefined);
    setError('');
    const params = new URLSearchParams({ type });
    if (type === 'tracked_hashtags' && username.trim()) params.set('username', username.trim());
    fetch(`/api/business/mentions?${params}`, { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => {
        setRaw(d);
        if (d.code && d.code !== 0) { setError(`API error ${d.code}: ${d.message ?? 'unknown'}`); setData([]); }
        else setData(extractList(type, d));
      })
      .catch(e => { setError(e.message); setData([]); });
  }

  useEffect(() => {
    // Tracked Hashtags requires a TikTok username. It's usually already
    // known by the time this tab is opened (see the account-info effect
    // above); if not yet, wait rather than fire an error.
    if (tab === 'tracked_hashtags' && !username.trim()) { setData(null); setError(''); return; }
    load(tab);
  }, [adminKey, enabled, tab]);

  // If the account-info fetch resolves after the operator has already
  // switched to this tab, load as soon as the username arrives.
  useEffect(() => {
    if (tab === 'tracked_hashtags' && username.trim() && data === null) load('tracked_hashtags');
  }, [username]);

  async function addHashtag() {
    if (!hashtag.trim()) return;
    setActionMsg('');
    try {
      const res = await fetch('/api/business/mentions', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_hashtag', hashtag: hashtag.trim(), username }),
      });
      const d = await res.json();
      if (d.code && d.code !== 0) setActionMsg(`Error: ${d.message ?? 'unknown'}`);
      else { setActionMsg('Hashtag added.'); setHashtag(''); load('tracked_hashtags'); }
    } catch (e) { setActionMsg('Error: ' + e.message); }
  }

  // Temporary diagnostic. hashtag/verify/list is a LIST endpoint, not a
  // validity check — confirmed from TikTok's own example request (no
  // hashtag param at all, just business_id + username): it returns
  // { hashtag_list: [{ hashtag, create_date }] }, the hashtags TikTok
  // already considers verified for that username. Sending a `hashtags`
  // param (the old behavior here) isn't part of the real request shape,
  // which is almost certainly why every hashtag tried came back "no
  // valid hashtag for this username." verifyUsername lets us check any
  // username's verified-hashtag list (defaults to the connected
  // account's own username) to see what's actually returned.
  async function verifyHashtag() {
    if (!verifyUsername.trim()) return;
    setVerifyMsg('Checking…');
    try {
      const res = await fetch(`/api/business/mentions?${new URLSearchParams({ type: 'verify_hashtag', username: verifyUsername.trim() })}`, {
        headers: { 'x-admin-key': adminKey },
      });
      const d = await res.json();
      setVerifyMsg(JSON.stringify(d));
    } catch (e) { setVerifyMsg('Error: ' + e.message); }
  }

  async function removeHashtag(tag) {
    try {
      await fetch('/api/business/mentions', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_hashtag', hashtag: tag, username }),
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
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect TikTok Account Token to view mentions.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
            {TABS.map(([key, label]) => (
              <button key={key} style={s.tab(tab === key)} onClick={() => { setTab(key); setActionMsg(''); setVerifyMsg(''); }}>{label}</button>
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

          {tab === 'tracked_hashtags' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                style={{ ...s.input, flex: 1, minWidth: 160 }}
                placeholder="username to test verify with…"
                value={verifyUsername}
                onChange={e => setVerifyUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verifyHashtag()}
              />
              <button style={{ ...s.btn, whiteSpace: 'nowrap', background: '#475569' }} onClick={verifyHashtag}>Verify (debug)</button>
            </div>
          )}
          {verifyMsg && <p style={{ fontSize: 12, color: '#94a3b8', wordBreak: 'break-all', marginBottom: 12 }}>{verifyMsg}</p>}

          {data === null ? (
            <p style={{ fontSize: 13, color: '#475569' }}>Loading your account info…</p>
          ) : data === undefined ? (
            <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p>
          ) : error ? (
            <p style={{ fontSize: 13, color: '#f59e0b' }}>{error}</p>
          ) : data.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569' }}>No data found.</p>
          ) : (
            data.map((item, i) => (
              <div key={item.item_id ?? item.video_id ?? item.comment_id ?? item.hashtag ?? item.word ?? i} style={{ borderBottom: '1px solid #334155', paddingBottom: 10, marginBottom: 10, fontSize: 13, color: '#cbd5e1' }}>
                {typeof item === 'string' && tab !== 'tracked_hashtags' && item}
                {tab === 'videos' && typeof item !== 'string' && <>{item.caption ?? item.title ?? item.item_id ?? item.video_id} <span style={{ color: '#64748b' }}>{item.create_time ? new Date(item.create_time * 1000).toLocaleDateString() : ''}</span></>}
                {tab === 'comments' && typeof item !== 'string' && <>@{item.username ?? 'unknown'}: {item.text}</>}
                {tab === 'top_words' && typeof item !== 'string' && (item.word ? <>{item.word}{item.count != null && ` · ${item.count}`}</> : JSON.stringify(item))}
                {tab === 'top_hashtags' && typeof item !== 'string' && (item.hashtag ? <>#{item.hashtag}{item.count != null && ` · ${item.count}`}</> : JSON.stringify(item))}
                {tab === 'tracked_hashtags' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>#{typeof item === 'string' ? item : (item.hashtag ?? JSON.stringify(item))}</span>
                    <button style={s.btnDanger} onClick={() => removeHashtag(typeof item === 'string' ? item : item.hashtag)}>Remove</button>
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
        </>
      )}
    </div>
  );
}

// ── Trending & Discovery ──────────────────────────────────────────────────────

function TrendingPanel({ adminKey, enabled }) {
  const [tab, setTab] = useState('trending');
  const [keyword, setKeyword] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [data, setData] = useState(undefined);
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState('');

  function extractList(type, d) {
    const dd = d.data ?? {};
    const known = {
      trending: dd.list ?? dd.trending_list ?? dd.videos,
      keywords: dd.search_keywords ?? dd.keywords, // TikTok returns search_keywords: string[]
      hashtags: dd.hashtags,
      benchmark: dd.benchmark ? [dd.benchmark] : undefined,
    }[type];
    if (Array.isArray(known)) return known;
    // Field names vary per endpoint — fall back to the first array in data
    for (const v of Object.values(dd)) if (Array.isArray(v)) return v;
    return [];
  }

  function load() {
    if (!adminKey || !enabled) return;
    setData(undefined);
    setError('');
    const params = new URLSearchParams({ type: tab });
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (businessCategory.trim()) params.set('business_category', businessCategory.trim());
    fetch(`/api/business/trending?${params}`, { headers: { 'x-admin-key': adminKey } })
      .then(r => r.json())
      .then(d => {
        setRaw(d);
        if (d.code && d.code !== 0) { setError(`API error ${d.code}: ${d.message ?? 'unknown'}`); setData([]); }
        else setData(extractList(tab, d));
      })
      .catch(e => { setError(e.message); setData([]); });
  }

  useEffect(() => {
    // Keywords, Hashtag Suggestions, and Benchmark all require non-empty
    // input — don't auto-fire on tab switch and throw an error before the
    // user has typed anything.
    if ((tab === 'keywords' || tab === 'hashtags') && !keyword.trim()) { setData(null); setError(''); return; }
    if (tab === 'benchmark' && !businessCategory.trim()) { setData(null); setError(''); return; }
    load();
  }, [adminKey, enabled, tab]);

  // Selecting a category should search immediately, not wait for a click.
  useEffect(() => {
    if (tab === 'benchmark' && businessCategory.trim()) load();
  }, [businessCategory]);

  const TABS = [
    ['trending', 'Trending'],
    ['keywords', 'Keywords'],
    ['hashtags', 'Hashtag Suggestions'],
    ['benchmark', 'Benchmark'],
  ];

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Trending & Discovery</h2>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect TikTok Account Token to view trending data.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
            {TABS.map(([key, label]) => (
              <button key={key} style={s.tab(tab === key)} onClick={() => setTab(key)}>{label}</button>
            ))}
          </div>
          {tab === 'benchmark' ? (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <select
                style={{ ...s.input, flex: 1 }}
                value={businessCategory}
                onChange={e => setBusinessCategory(e.target.value)}
              >
                <option value="">Select a business category…</option>
                {BUSINESS_CATEGORIES.map(c => (
                  <option key={c} value={c}>{categoryLabel(c)}</option>
                ))}
              </select>
              <button style={{ ...s.btn, whiteSpace: 'nowrap' }} onClick={load}>Search</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                style={{ ...s.input, flex: 1 }}
                placeholder={tab === 'keywords' || tab === 'hashtags' ? 'Keyword (required)…' : 'Keyword (optional)…'}
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && load()}
              />
              <button style={{ ...s.btn, whiteSpace: 'nowrap' }} onClick={load}>Search</button>
            </div>
          )}

          {data === null ? (
            <p style={{ fontSize: 13, color: '#475569' }}>{tab === 'benchmark' ? 'Enter a business category and hit Search.' : 'Type a keyword and hit Search.'}</p>
          ) : data === undefined ? (
            <p style={{ fontSize: 13, color: '#475569' }}>Loading…</p>
          ) : error ? (
            <p style={{ fontSize: 13, color: '#f59e0b' }}>{error}</p>
          ) : data.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569' }}>No data found.</p>
          ) : (
            data.map((item, i) => (
              <div key={typeof item === 'string' ? item : (item.id ?? item.keyword ?? item.hashtag ?? item.name ?? i)} style={{ borderBottom: '1px solid #334155', paddingBottom: 10, marginBottom: 10, fontSize: 13, color: '#cbd5e1' }}>
                {typeof item === 'string' ? (
                  item
                ) : tab === 'hashtags' && item.name ? (
                  <>#{item.name}{item.view_count != null && <span style={{ color: '#64748b' }}> · {item.view_count.toLocaleString()} views</span>}</>
                ) : (
                  JSON.stringify(item)
                )}
              </div>
            ))
          )}
          {raw && (
            <button style={{ ...s.btnSm, marginTop: 4 }} onClick={() => alert(JSON.stringify(raw, null, 2))}>
              View raw API response
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Export Advertiser Token ───────────────────────────────────────────────────

function ExportTokenPanel({ adminKey, enabled }) {
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function load() {
    setError(''); setToken(null); setCopied(false);
    try {
      const res = await fetch('/api/admin/export-token', { headers: { 'x-admin-key': adminKey } });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setToken(data.token);
    } catch (e) {
      setError(e.message);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div style={s.card}>
      <h2 style={s.h2}>Export Advertiser Token</h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
        Copy this value and paste it as <code style={{ background: '#0f172a', padding: '1px 6px', borderRadius: 4, color: '#a855f7' }}>TIKTOK_ADVERTISER_TOKEN</code> in Vercel → Settings → Environment Variables. After that, no one ever needs to reconnect the advertiser token.
      </p>
      {!enabled ? (
        <p style={{ fontSize: 13, color: '#475569' }}>Connect the Advertiser Token first, then export it.</p>
      ) : token ? (
        <>
          <textarea
            readOnly
            value={token}
            style={{ ...s.input, fontFamily: 'monospace', fontSize: 11, minHeight: 80, resize: 'vertical', marginBottom: 10, wordBreak: 'break-all' }}
          />
          <button style={{ ...s.btn, background: copied ? '#10b981' : '#a855f7' }} onClick={copy}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </>
      ) : (
        <>
          {error && <p style={{ fontSize: 13, color: '#f59e0b', marginBottom: 8 }}>{error}</p>}
          <button style={s.btn} onClick={load}>Show Token</button>
        </>
      )}
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
