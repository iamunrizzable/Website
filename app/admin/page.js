'use client';

import './page.css';

import { useState } from 'react';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { display: 'block', background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 16, border: '2px solid rgba(168,85,247,0.25)', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s, transform 0.15s', animation: 'borderGlow 3s ease-in-out infinite' },
  title: { fontSize: 17, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 },
  desc: { fontSize: 13, color: '#d946ef', lineHeight: 1.5 },
};

const TOOLS = [
  {
    href: '/hallie/writer',
    title: 'Hallie™ Writer',
    desc: 'Draft emails and DMs — as Hallie speaking on your behalf, or as yourself in your own voice.',
  },
  {
    href: '/admin/internal/hallie/tiktok-moderation/system',
    title: 'Admin Panel',
    desc: 'Internal testing and debug surface for the Hallie TikTok Platform — raw API probes, diagnostics.',
  },
  {
    href: '/admin/security',
    title: 'Security',
    desc: 'Permanently ban devices from the site by Fingerprint ID.',
  },
];

export default function AdminTools() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/tiktok/agency" onClick={() => setMenuOpen(false)}>TikTok Agency</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <div style={s.page}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 4, animation: 'glowPulse 3s ease-in-out infinite' }}>
            Your Tools
          </h1>
          <p style={{ color: '#06b6d4', fontSize: 13, marginBottom: 28 }}>
            Everything you're signed in for, in one place.
          </p>

          {TOOLS.map(tool => (
            <a
              key={tool.href}
              href={tool.href}
              style={s.card}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#a855f7'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)'; }}
            >
              <div style={s.title}>{tool.title}</div>
              <div style={s.desc}>{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
