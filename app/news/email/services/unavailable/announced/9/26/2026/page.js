'use client';

import './page.css';

import { useState } from 'react';

// Standalone permalink for this newsletter entry — same pattern as the
// other single-letter pages under /news. Resolved September 27, 2026 —
// see /system/status for live status of the Email row.
export default function EmailServicesUnavailable() {
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
        <a href="/system/status" onClick={() => setMenuOpen(false)}>System Status</a>
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
            border: '2px solid rgba(245,158,11,0.35)',
            borderRadius: 16,
            padding: '36px 24px',
            boxSizing: 'border-box',
            animation: 'euBorderGlow 3s ease-in-out infinite',
          }}
        >
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 4px' }}>TJB Management Inc.</p>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 22px' }}>September 26, 2026 — Resolved September 27, 2026</p>

          <h1
            style={{
              color: '#10b981',
              fontSize: 24,
              lineHeight: 1.4,
              margin: '0 0 22px',
              fontWeight: 800,
              animation: 'euGlowPulse 3s ease-in-out infinite',
            }}
          >
            Email Services Have Been Restored.
          </h1>

          <div style={{ fontSize: 15, lineHeight: 1.7, textAlign: 'left' }}>
            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              This issue is resolved. If you emailed Tyler or another @tjbmanagementinc.com address during
              this window and didn&apos;t get a response, please send it again — email is working normally now.
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              <strong>What happened:</strong> Apple&apos;s iCloud mail servers were rejecting some inbound
              email to our domain with{' '}
              <code style={{ color: '#eab308' }}>554 5.7.1 [HM08] Message rejected due to local policy</code>
              — an anti-abuse/spam hold enforced entirely on Apple&apos;s own systems. It was not a problem
              with any of our systems.
            </p>

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
              <strong>What this was not:</strong> this was not a security incident. No accounts, data, or
              systems were compromised. It was limited to email deliverability on our domain.
            </p>

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              <strong>What caused it:</strong> Apple confirmed the hold was triggered by low-content test
              emails (generic subject lines like &quot;Test,&quot; no real body content). Once a normal, real
              email was sent, it went through cleanly.
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              You can check the current status of email and our other tools anytime at{' '}
              <a href="/system/status" style={{ color: '#eab308', fontWeight: 600 }}>System Status</a>.
            </p>

            <p style={{ color: '#94a3b8', margin: 0 }}>
              Thank you for your patience.
            </p>
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
