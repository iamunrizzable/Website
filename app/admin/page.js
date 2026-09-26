'use client';

import './page.css';

import { useState } from 'react';

const TOOLS = [
  {
    href: '/hallie/writer',
    title: 'Hallie™ Writer',
    desc: 'Draft emails and DMs — as Hallie speaking on your behalf, or as yourself in your own voice.',
  },
  {
    href: '/admin/internal/hallie/tiktok/moderation/system',
    title: 'Admin Panel',
    desc: 'Internal testing and debug surface for the Hallie TikTok Platform — raw API probes, diagnostics.',
  },
  {
    href: '/admin/security',
    title: 'Security',
    desc: 'Permanently ban devices from the site by Fingerprint ID.',
  },
  {
    href: '/admin/visitor/list',
    title: 'Site Visitors',
    desc: 'Every visitor the site has identified, banned or not — first seen, last seen, visit count, IP, and location.',
  },
  {
    href: '/admin/security/kill/switches',
    title: 'Kill Switches',
    desc: 'Shut off the TikTok Agency, the C2 Agency, or the entire site, instantly.',
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
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
        <a href="/system/status" onClick={() => setMenuOpen(false)}>System Status</a>
      </div>

      <div className="admin-page">
        <div className="admin-content">
          <h1 className="admin-h1">
            Your Tools
          </h1>
          <p className="admin-subtitle">
            Everything you're signed in for, in one place.
          </p>

          {TOOLS.map(tool => (
            <a
              key={tool.href}
              href={tool.href}
              className="tool-card"
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#a855f7'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)'; }}
            >
              <div className="tool-title">{tool.title}</div>
              <div className="tool-desc">{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
