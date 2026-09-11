'use client';

import './page.css';

import { useState } from 'react';

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
              Today we are withdrawing the proposed suspension of our TikTok servers and TikTok agency. TikTok paid what they owe us. Servers stay on. Agency support stays on.
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              The payment is closed. The threat is not.
            </p>

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              When we asked when an entire month of payment would be released, our point of contact threatened us. After the settlement was confirmed, invoiced, and approved, the file stopped at &quot;Process payout&quot; on September 6. On September 8 she blamed a holiday. On September 9 at 11:41 a.m., two days after TikTok&apos;s own &quot;around the 7th&quot; release date, support was still telling us to wait until the 7th. When we asked why the payout still had not processed, the answer was &quot;Labor Day&quot; and &quot;every single CN is delayed.&quot; When we followed up again, we were told we were &quot;extremely rude&quot; for asking, that our &quot;performance&quot; would be discussed with their team, and that it was &quot;not necessary to be anxious&quot; about money we are owed.
            </p>

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
              When we invited them to point out what they found extremely rude, they could not. Their response was that we abbreviated our company name to our DBA — after another network was told a shorter name was exactly what unblocked their settlement — and that we send messages outside of their office hours, which we have never asked them to answer outside of. We explained the name change in writing. We explained our office hours in writing. The last message she sent was that the delay was due to the holiday and that it was not necessary to be anxious.
            </p>

            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              She threatened us for asking when we would be paid for work we already did. We have asked TikTok to review that conversation and take appropriate action. We will continue to work with TikTok as a company.
            </p>

            <p style={{ color: '#ec4899', margin: 0 }}>
              The proposed suspension is withdrawn because they paid.
            </p>
          </div>
        </div>

        <footer>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
        </footer>
      </main>
    </>
  );
}
