'use client';

import { useState } from 'react';

export default function ContactAgency() {
  const [menuOpen, setMenuOpen] = useState(false);

  const contacts = [
    { name: 'Apply to Join', href: 'https://www.tiktok.com/t/ZTkgQvTCb/', icon: '📋', bg: 'linear-gradient(135deg, #a855f7, #ec4899)' },
    { name: 'Agency TikTok', href: 'https://tiktok.com/@iamunrizzable', icon: '🎵', bg: 'linear-gradient(135deg, #1e3a5f, #0ea5e9)' },
    { name: 'Discord Community', href: 'https://discord.gg/xznQZY7CeW', icon: '💬', bg: 'linear-gradient(135deg, #4338ca, #5865f2)' },
    { name: 'Email', href: 'mailto:tyler@tjbmanagementinc.com', icon: '✉️', bg: 'linear-gradient(135deg, #6d28d9, #a855f7)' },
    { name: 'About the Agency', href: '/agency', icon: '🏢', bg: 'linear-gradient(135deg, #0f172a, #1e293b)' },
    { name: 'Contact Tyler', href: '/contact-tyler', icon: '👤', bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
  ];

  const internalLinks = ['Email', 'About the Agency', 'Contact Tyler'];

  return (
    <>
      <style>{`
        body::before {
          content: "";
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.82)), url("/bg-main.jpeg");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -3;
          pointer-events: none;
        }
        body { margin: 0; padding: 0; background: transparent; }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.3); }
          50% { text-shadow: 0 0 40px rgba(168,85,247,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(59,130,246,0.5), 0 0 100px rgba(168,85,247,0.4); }
        }
        main { max-width: 900px; margin: 0 auto; padding: 40px 20px; position: relative; z-index: 10; }
        h1 { color: #d4a5ff; margin-bottom: 30px; font-size: 32px; animation: glowPulse 3s ease-in-out infinite; }
        .back-link { display: inline-block; margin-bottom: 30px; color: #a855f7; text-decoration: none; font-weight: 500; }
        .back-link:hover { text-decoration: underline; }
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .contact-card {
          position: relative;
          padding: 30px 20px;
          border-radius: 15px;
          text-decoration: none;
          color: #d4a5ff;
          border: 2px solid rgba(255,255,255,0.15);
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 10px;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInCard 0.6s ease forwards;
        }
        @keyframes fadeInCard {
          to { opacity: 1; transform: translateY(0); }
        }
        .contact-card:nth-child(1) { animation-delay: 0.1s; }
        .contact-card:nth-child(2) { animation-delay: 0.2s; }
        .contact-card:nth-child(3) { animation-delay: 0.3s; }
        .contact-card:nth-child(4) { animation-delay: 0.4s; }
        .contact-card:nth-child(5) { animation-delay: 0.5s; }
        .contact-card:nth-child(6) { animation-delay: 0.6s; }
        .contact-card::before { content: ''; position: absolute; inset: 0; z-index: -1; }
        .contact-card:hover {
          transform: translateY(-12px) scale(1.02);
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 12px 24px rgba(0,0,0,0.5), 0 0 40px currentColor;
          filter: brightness(1.1);
        }
        .contact-icon {
          font-size: 64px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
          transition: all 0.3s ease;
        }
        .contact-card:hover .contact-icon { transform: scale(1.3) rotate(5deg); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6)); }
        .contact-name {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .footer { text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px; font-size: 14px; color: #8b9dc3; }
        .footer p { margin-bottom: 8px; color: #a0aec0; }
        .menu-button { position: fixed; top: 20px; right: 20px; background-color: #a855f7; color: #d4a5ff; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; z-index: 100; font-size: 16px; transition: all 0.3s ease; }
        .menu-button:hover { background-color: #9333ea; transform: scale(1.05); box-shadow: 0 0 20px rgba(168,85,247,0.6); }
        .menu-dropdown { display: none; position: fixed; top: 60px; right: 20px; background-color: #0f172a; border: 2px solid #a855f7; border-radius: 5px; padding: 10px 0; min-width: 200px; z-index: 101; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
        .menu-dropdown.active { display: block; }
        .menu-dropdown a { display: block; padding: 10px 20px; color: #a855f7; text-decoration: none; border-bottom: 1px solid rgba(168,85,247,0.2); transition: background-color 0.2s; }
        .menu-dropdown a:last-child { border-bottom: none; }
        .menu-dropdown a:hover { background-color: rgba(168,85,247,0.1); }
        .fade-top { position: fixed; top: 0; left: 0; width: 100%; height: 200px; background: linear-gradient(to bottom, rgba(15,23,42,0.95), transparent); z-index: 50; pointer-events: none; }
      `}</style>

      <div className="fade-top"></div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie</a>
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Contact Hallie</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Contact Tyler</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
        <a href="/contact-agency" onClick={() => setMenuOpen(false)}>Contact Agency</a>
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/agency" className="back-link">← Back to Agency</a>
        <h1>Contact TJB Management</h1>

        <div className="contact-grid">
          {contacts.map((contact) => (
            <a
              key={contact.name}
              href={contact.href}
              target={!internalLinks.includes(contact.name) ? '_blank' : undefined}
              rel={!internalLinks.includes(contact.name) ? 'noopener noreferrer' : undefined}
              className="contact-card"
              style={{ background: contact.bg }}
            >
              <span className="contact-icon">{contact.icon}</span>
              <span className="contact-name">{contact.name}</span>
            </a>
          ))}
        </div>

        <div className="footer">
          <p>© 2026 Tyler J. Beasley. All rights reserved. TJB Management Inc. and this website cannot be copied or reused without written permission.</p>
          <p>TikTok and the TikTok logo are the property of TikTok US Data Security Joint Venture LLC. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
