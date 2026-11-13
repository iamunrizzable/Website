'use client';

import './page.css';

import { useEffect, useState } from 'react';

const PROVIDERS = [
  { id: 'google', name: 'Google' },
  { id: 'apple', name: 'Apple' },
  { id: 'x', name: 'X' },
  { id: 'tiktok', name: 'TikTok' },
];

export default function HallieLogin() {
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('/hallie/chat');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const back = params.get('from');
    if (back && back.startsWith('/') && !back.startsWith('//')) setFrom(back);
    setError(params.get('error') || '');
    fetch('/api/hallie/chats')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data.connections)) setConnections(data.connections); })
      .catch(() => {});
  }, []);

  const hrefFor = (id) => {
    const back = encodeURIComponent(from);
    return id === 'tiktok' ? `/auth/tiktok/system-login?from=${back}` : `/auth/hallie/${id}?from=${back}`;
  };

  return (
    <>
      <div className="fade-top"></div>
      <main>
        <a href="/hallie" className="back-link">← Back to Hallie</a>
        <h1>Log in to Hallie™</h1>
        <p className="login-note">Sign in with any of these. You can connect more than one, and your chats follow you.</p>
        {error && <p className="login-error">{error}</p>}
        <div className="login-list">
          {PROVIDERS.map((p) => {
            const on = connections.some((c) => c.provider === p.id);
            return (
              <a key={p.id} href={hrefFor(p.id)} className={`login-btn${on ? ' on' : ''}`}>
                <span>{p.name}</span>
                <small>{on ? 'Connected' : 'Log in'}</small>
              </a>
            );
          })}
        </div>
        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
