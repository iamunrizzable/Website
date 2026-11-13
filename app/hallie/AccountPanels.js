'use client';

import { useEffect, useState } from 'react';

const CATEGORIES = [
  'PERSONAL_BLOG', 'MACHINERY_AND_EQUIPMENT', 'HEALTH_AND_WELLNESS', 'PETS',
  'AUTOMOTIVE_AND_TRANSPORTATION', 'EDUCATION_AND_TRAINING', 'FOOD_AND_BEVERAGE',
  'REAL_ESTATE', 'ELECTRONICS', 'SHOPPING_AND_RETAIL', 'PUBLIC_ADMINISTRATION',
  'ART_AND_CRAFTS', 'BABY', 'GAMING', 'RESTAURANTS_AND_BARS',
  'HOME_FURNITURE_AND_APPLIANCES', 'PROFESSIONAL_SERVICES', 'SOFTWARE_AND_APPS',
  'MEDIA_AND_ENTERTAINMENT', 'BEAUTY', 'SPORTS_FITNESS_AND_OUTDOORS',
  'CLOTHING_AND_ACCESSORIES', 'TRAVEL_AND_TOURISM', 'OTHERS', 'FINANCE_AND_INVESTING',
];

function label(code) {
  return code.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function firstArray(data, known) {
  if (Array.isArray(known)) return known;
  const dd = data?.data ?? {};
  for (const v of Object.values(dd)) if (Array.isArray(v)) return v;
  return [];
}

export function AccountPanels() {
  return (
    <section className="local-panels">
      <Mentions />
      <Trending />
    </section>
  );
}

function Mentions() {
  const [tab, setTab] = useState('videos');
  const [username, setUsername] = useState('');
  const [rows, setRows] = useState(undefined);
  const [error, setError] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetch('/api/system/account')
      .then((r) => r.json())
      .then((d) => { const u = (d.data ?? d)?.username; if (u) setUsername(u); })
      .catch(() => {});
  }, []);

  function load(type, name = username) {
    setRows(undefined);
    setError('');
    const params = new URLSearchParams({ type });
    if (type === 'tracked_hashtags') {
      if (!name) { setRows(null); return; }
      params.set('username', name);
    }
    fetch(`/api/system/mentions?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error === 'Not connected') { setError('connect'); setRows([]); return; }
        if (d.code && d.code !== 0) { setError(d.message || 'TikTok returned an error'); setRows([]); return; }
        const known = {
          videos: d.data?.videos,
          comments: d.data?.comments,
          top_words: d.data?.words ?? d.data?.top_words,
          top_hashtags: d.data?.hashtags ?? d.data?.top_hashtags,
          tracked_hashtags: d.data?.hashtags,
        }[type];
        setRows(firstArray(d, known));
      })
      .catch((e) => { setError(e.message); setRows([]); });
  }

  useEffect(() => {
    if (tab === 'tracked_hashtags' && !username) { setRows(null); return; }
    load(tab);
  }, [tab, username]);

  async function changeHashtag(action, tag) {
    setNote('');
    const res = await fetch('/api/system/mentions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, hashtag: tag, username }),
    });
    const d = await res.json();
    if (d.code && d.code !== 0) setNote(d.message || 'TikTok returned an error');
    else if (d.error) setNote(d.error);
    else { setNote(action === 'add_hashtag' ? 'Hashtag added.' : 'Hashtag removed.'); setHashtag(''); load('tracked_hashtags'); }
  }

  const tabs = [
    ['videos', 'Videos'],
    ['comments', 'Comments'],
    ['top_words', 'Top Words'],
    ['top_hashtags', 'Top Hashtags'],
    ['tracked_hashtags', 'Tracked Hashtags'],
  ];

  return (
    <div className="local-panel">
      <h2>Mentions</h2>
      <div className="local-tabs">
        {tabs.map(([key, name]) => (
          <button key={key} type="button" className={tab === key ? 'on' : ''} onClick={() => { setTab(key); setNote(''); }}>{name}</button>
        ))}
      </div>
      {tab === 'tracked_hashtags' && (
        <form className="local-row" onSubmit={(e) => { e.preventDefault(); if (hashtag.trim()) changeHashtag('add_hashtag', hashtag.trim()); }}>
          <input value={hashtag} onChange={(e) => setHashtag(e.target.value)} placeholder="Add hashtag to track (without #)…" />
          <button type="submit">Add</button>
        </form>
      )}
      {note && <p className="local-note">{note}</p>}
      <Rows rows={rows} error={error} empty="No data found.">
        {(item, i) => <MentionRow key={item.item_id ?? item.comment_id ?? item.hashtag ?? item.word ?? i} tab={tab} item={item} onRemove={(tag) => changeHashtag('remove_hashtag', tag)} />}
      </Rows>
    </div>
  );
}

function MentionRow({ tab, item, onRemove }) {
  if (typeof item === 'string' && tab !== 'tracked_hashtags') return item;
  if (tab === 'videos' && typeof item !== 'string') {
    return <>{item.caption ?? item.title ?? item.item_id} <span>{item.create_time ? new Date(item.create_time * 1000).toLocaleDateString() : ''}</span></>;
  }
  if (tab === 'comments' && typeof item !== 'string') return <>@{item.username ?? 'unknown'}: {item.text}</>;
  if (tab === 'top_words' && item.word) return <>{item.word}{item.count != null ? ` · ${item.count}` : ''}</>;
  if (tab === 'top_hashtags' && item.hashtag) return <>#{item.hashtag}{item.count != null ? ` · ${item.count}` : ''}</>;
  if (tab === 'tracked_hashtags') {
    const tag = typeof item === 'string' ? item : item.hashtag;
    return (
      <span className="local-spread">
        <span>#{tag}</span>
        <button type="button" onClick={() => onRemove(tag)}>Remove</button>
      </span>
    );
  }
  return typeof item === 'string' ? item : JSON.stringify(item);
}

function Trending() {
  const [tab, setTab] = useState('trending');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [rows, setRows] = useState(undefined);
  const [error, setError] = useState('');

  function load(nextTab = tab, nextKeyword = keyword, nextCategory = category) {
    if ((nextTab === 'keywords' || nextTab === 'hashtags') && !nextKeyword.trim()) { setRows(null); setError(''); return; }
    if (nextTab === 'benchmark' && !nextCategory) { setRows(null); setError(''); return; }
    setRows(undefined);
    setError('');
    const params = new URLSearchParams({ type: nextTab });
    if (nextKeyword.trim()) params.set('keyword', nextKeyword.trim());
    if (nextCategory) params.set('business_category', nextCategory);
    fetch(`/api/system/trending?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error === 'Not connected') { setError('connect'); setRows([]); return; }
        if (d.code && d.code !== 0) { setError(d.message || 'TikTok returned an error'); setRows([]); return; }
        const known = {
          trending: d.data?.list ?? d.data?.trending_list ?? d.data?.videos,
          keywords: d.data?.search_keywords ?? d.data?.keywords,
          hashtags: d.data?.hashtags,
          benchmark: d.data?.benchmark ? [d.data.benchmark] : undefined,
        }[nextTab];
        setRows(firstArray(d, known));
      })
      .catch((e) => { setError(e.message); setRows([]); });
  }

  useEffect(() => { load(tab, keyword, category); }, [tab]);

  const tabs = [
    ['trending', 'Trending'],
    ['keywords', 'Keywords'],
    ['hashtags', 'Hashtag Suggestions'],
    ['benchmark', 'Benchmark'],
  ];

  return (
    <div className="local-panel">
      <h2>Trending & Discovery</h2>
      <div className="local-tabs">
        {tabs.map(([key, name]) => (
          <button key={key} type="button" className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>{name}</button>
        ))}
      </div>
      {tab === 'benchmark' ? (
        <form className="local-row" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <select value={category} onChange={(e) => { setCategory(e.target.value); load(tab, keyword, e.target.value); }}>
            <option value="">Select a business category…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
          </select>
          <button type="submit">Search</button>
        </form>
      ) : (
        <form className="local-row" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={tab === 'trending' ? 'Keyword (optional)…' : 'Keyword (required)…'} />
          <button type="submit">Search</button>
        </form>
      )}
      <Rows rows={rows} error={error} empty={tab === 'benchmark' ? 'Pick a category.' : 'Type a keyword and hit Search.'}>
        {(item, i) => (
          <p key={typeof item === 'string' ? item : (item.id ?? item.keyword ?? item.hashtag ?? i)}>
            {typeof item === 'string' ? item : tab === 'hashtags' && item.name ? `#${item.name}${item.view_count != null ? ` · ${Number(item.view_count).toLocaleString()} views` : ''}` : JSON.stringify(item)}
          </p>
        )}
      </Rows>
    </div>
  );
}

function Rows({ rows, error, empty, children }) {
  if (error === 'connect') {
    return <p className="local-note"><a href="/auth/tiktok/system-login?from=/hallie/chat">Connect TikTok</a> to use this.</p>;
  }
  if (rows === null) return <p className="local-note">{empty}</p>;
  if (rows === undefined) return <p className="local-note">Loading…</p>;
  if (error) return <p className="local-note">{error}</p>;
  if (!rows.length) return <p className="local-note">No data found.</p>;
  return <div className="local-list">{rows.map(children)}</div>;
}
