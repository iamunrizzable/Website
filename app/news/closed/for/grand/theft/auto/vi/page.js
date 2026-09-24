'use client';

import './page.css';

import { useState } from 'react';

// Standalone permalink for this newsletter entry — same pattern as the
// other single-letter pages under /news (e.g. the TikTok suspension
// notice): reachable by anyone at any time, listed on /news, and linked
// to directly from the site-wide GtaViBanner.
export default function ClosedForGtaVi() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="fade-top"></div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <div
          style={{
            maxWidth: 560,
            width: '100%',
            margin: '40px auto 0',
            textAlign: 'center',
            color: '#e2e8f0',
            background: 'rgba(15,23,42,0.6)',
            border: '2px solid rgba(168,85,247,0.35)',
            borderRadius: 16,
            padding: '36px 24px',
            boxSizing: 'border-box',
            animation: 'gtaBorderGlow 3s ease-in-out infinite',
          }}
        >
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 4px' }}>TJB Management Inc.</p>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 22px' }}>September 24, 2026</p>

          <h1
            style={{
              color: '#d4a5ff',
              fontSize: 26,
              lineHeight: 1.4,
              margin: '0 0 22px',
              fontWeight: 800,
              animation: 'gtaGlowPulse 3s ease-in-out infinite',
            }}
          >
            Closed for Grand Theft Auto VI.
          </h1>

          <div style={{ fontSize: 15, lineHeight: 1.7, textAlign: 'left' }}>
            <p style={{ color: '#06b6d4', margin: '0 0 4px' }}>On Thursday, November 19, TJB Management Inc. will close.</p>
            <p style={{ color: '#ec4899', margin: '0 0 4px' }}>Not for a holiday.</p>
            <p style={{ color: '#ec4899', margin: '0 0 4px' }}>Not for a retreat.</p>
            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>For the release of Grand Theft Auto VI.</p>

            <p style={{ color: '#a855f7', margin: '0 0 4px' }}>We believe some days belong to the culture.</p>
            <p style={{ color: '#a855f7', margin: '0 0 24px' }}>This is one of them.</p>

            <h2 style={{ color: '#d4a5ff', fontSize: 18, fontWeight: 700, margin: '0 0 14px' }}>Office hours</h2>

            <p style={{ color: '#e2e8f0', margin: '0 0 2px', fontWeight: 600 }}>Wednesday, November 18</p>
            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>Regular hours.</p>

            <p style={{ color: '#e2e8f0', margin: '0 0 2px', fontWeight: 600 }}>Thursday, November 19 – Monday, November 30</p>
            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>Closed.</p>

            <p style={{ color: '#e2e8f0', margin: '0 0 2px', fontWeight: 600 }}>Tuesday, December 1</p>
            <p style={{ color: '#06b6d4', margin: '0 0 24px' }}>We return.</p>

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>Urgent matters can wait until December 1.</p>

            <p style={{ color: '#a855f7', margin: '0 0 24px' }}>Everything else can wait a little longer.</p>

            <p style={{ color: '#06b6d4', margin: '0 0 24px' }}>
              Thank you for your patience — and for understanding that even a well-run office needs time in Leonida.
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 24px' }}>See you on December 1.</p>

            <p style={{ color: '#94a3b8', margin: '0 0 2px' }}>Tyler, Chief Executive Officer</p>
            <p style={{ color: '#94a3b8', margin: 0 }}>TJB Management Inc.</p>
          </div>
        </div>

        <footer>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </footer>
      </main>
    </>
  );
}
