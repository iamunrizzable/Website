'use client';

import './page.css';

import { useState } from 'react';

// Standalone permalink for this newsletter entry — same pattern as the
// other single-letter pages under /news. Linked from the site-wide
// EmailBanner while the underlying iCloud+ custom domain issue is
// unresolved (see /system/status for live status of the Email row).
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
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 22px' }}>September 26, 2026</p>

          <h1
            style={{
              color: '#f59e0b',
              fontSize: 24,
              lineHeight: 1.4,
              margin: '0 0 22px',
              fontWeight: 800,
              animation: 'euGlowPulse 3s ease-in-out infinite',
            }}
          >
            Some Email Services Are Currently Unavailable.
          </h1>

          <div style={{ fontSize: 15, lineHeight: 1.7, textAlign: 'left' }}>
            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              If you&apos;ve recently emailed Tyler or another @tjbmanagementinc.com address and haven&apos;t
              gotten a response, it&apos;s not being ignored — some inbound and outbound email on our domain
              is currently being delayed or not delivered at all.
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              <strong>What we know:</strong> the issue is on our email provider&apos;s side, tied to how our
              custom email domain (tjbmanagementinc.com) is set up and verified with them — not a problem
              with this website or our other systems.
            </p>

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
              <strong>What this is not:</strong> this is not a security incident. No accounts, data, or
              systems were compromised. It is limited to email deliverability on our domain.
            </p>

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              <strong>What we&apos;re doing:</strong> we&apos;re actively working with our email provider to
              resolve it. We don&apos;t have a confirmed timeline yet.
            </p>

            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              <strong>How to reach us in the meantime:</strong> you can call Tyler directly at{' '}
              <a href="tel:+14086696123" style={{ color: '#eab308', fontWeight: 600 }}>(408) 669-6123</a>, or
              use any of the other contact methods on the{' '}
              <a href="/tyler/contact/tyler" style={{ color: '#eab308', fontWeight: 600 }}>Connect with Tyler</a> page.
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              You can also check the current status of email and our other tools anytime at{' '}
              <a href="/system/status" style={{ color: '#eab308', fontWeight: 600 }}>System Status</a>.
            </p>

            <p style={{ color: '#94a3b8', margin: 0 }}>
              We&apos;ll update this notice once email service is fully restored. Thank you for your patience.
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
