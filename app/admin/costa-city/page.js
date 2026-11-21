'use client';

import './page.css';

import { useEffect, useState } from 'react';

export default function CostaCity() {
  const [info, setInfo] = useState(undefined);
  const [msg, setMsg] = useState('');
  const [v, setV] = useState(0);

  const load = () => fetch('/api/admin/costa-city?status=1', { cache: 'no-store' })
    .then((r) => r.json()).then((d) => setInfo(d)).catch(() => setInfo(null));
  useEffect(() => { load(); }, []);

  async function upload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMsg('Uploading…');
    const r = await fetch('/api/admin/costa-city', { method: 'POST', body: await f.text() });
    const d = await r.json().catch(() => ({}));
    setMsg(r.ok ? 'Uploaded.' : (d.error || 'Upload failed.'));
    if (r.ok) { await load(); setV((n) => n + 1); }
    e.target.value = '';
  }

  return (
    <>
      <div className="cc-bar">
        <a href="/admin">← Admin</a>
        <span>Costa City</span>
        <label>Upload new build<input type="file" accept=".html,text/html" onChange={upload} hidden /></label>
        <span className="cc-msg">{msg}</span>
      </div>
      {info?.uploaded ? (
        <iframe key={v} className="cc-frame" title="Costa City" src="/api/admin/costa-city" sandbox="allow-scripts allow-pointer-lock" allow="fullscreen" />
      ) : (
        <div className="cc-empty">{info === undefined ? 'Loading…' : 'No build uploaded yet. Use “Upload new build” above and choose the game.html file.'}</div>
      )}
    </>
  );
}
