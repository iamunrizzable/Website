'use client';

import './page.css';

import { useState } from 'react';

// Proof that TikTok actually paid.
const PAYMENT_PROOF = [
  { src: '/tiktok-proof/IMG_0096.jpeg', caption: 'Settlement dashboard: "Payout processed" 09/10/2026 10:58:44 — status Finished' },
  { src: '/tiktok-proof/IMG_9981.jpeg', caption: '"chase just released the payment" — 1:48 PM' },
];

function ProofImages({ items }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        margin: '0 0 16px',
      }}
    >
      {items.map((item) => (
        <figure key={item.src} style={{ margin: 0, width: 'min(100%, 260px)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.caption}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: 10,
              border: '1px solid rgba(168,85,247,0.35)',
            }}
          />
          <figcaption style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, lineHeight: 1.4 }}>
            {item.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

// Standalone permalink for this newsletter entry — the withdrawal notice
// following up on the proposed suspension letter at
// /news/notice/of/tiktok/suspension/on/9/10/2026. Independent of the
// /admin/security kill switch, same as that letter.
export default function SuspensionWithdrawn() {
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
            border: '2px solid rgba(239,68,68,0.35)',
            borderRadius: 16,
            padding: '36px 24px',
            boxSizing: 'border-box',
            animation: 'tsBorderGlow 3s ease-in-out infinite',
          }}
        >
          <h1
            style={{
              color: '#ef4444',
              fontSize: 22,
              lineHeight: 1.4,
              margin: '0 0 14px',
              fontWeight: 800,
              animation: 'tsGlowPulse 3s ease-in-out infinite',
            }}
          >
            Notice of Suspension of TikTok Services Withdrawn
          </h1>

          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 4px' }}>TJB Management Inc.</p>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 22px' }}>September 11, 2026</p>

          <div style={{ fontSize: 15, lineHeight: 1.7, textAlign: 'left' }}>
            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              TikTok has remitted the payment owed to us. As our primary concern has been resolved, we will not be proceeding with the suspension of our TikTok services.
            </p>

            <ProofImages items={PAYMENT_PROOF} />

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              We are leaving our previous notice, announced yesterday at 2 PM, public because we do not believe our point of contact was justified.
            </p>

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              A full account of this matter is detailed in{' '}
              <a
                href="/news/notice/of/tiktok/suspension/on/9/10/2026"
                style={{
                  background: 'linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                our proposed suspension letter
              </a>
              .
            </p>

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
              We also note that, when given the opportunity, our point of contact could not identify anything we had actually done that was &quot;extremely rude.&quot;
            </p>

            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              We do not know what accounts for this individual&apos;s conduct, but we will not continue to accept being treated this way by a single representative.
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              We will continue working with TikTok as a company, as we do not hold an entire organization responsible for the actions of one employee.
            </p>

            <p style={{ color: '#a855f7', margin: 0 }}>
              We encourage TikTok to review this conversation and take appropriate action regarding this representative&apos;s conduct.
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
