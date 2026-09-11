'use client';

import './page.css';

import { useState } from 'react';

// Screenshots backing specific claims in this recap — each one placed
// directly under the sentence it supports, same pattern as the original
// letter at /news/notice/of/tiktok/suspension/on/9/10/2026.
const SETTLEMENT_PROOF = [
  { src: '/tiktok-proof/IMG_9866.jpeg', caption: 'Settlement confirmed, invoice submitted, approved — then stuck at "Process payout," 09/06/2026' },
];

const HOLIDAY_PROOF = [
  { src: '/tiktok-proof/IMG_9954.jpeg', caption: 'September 8: our POC blames a holiday' },
];

const POLICY_PROOF = [
  { src: '/tiktok-proof/IMG_9865.jpeg', caption: 'Sept 9, 11:41 AM: TikTok’s own support says to "wait until the 7th of this month" — two days after the 7th' },
];

const ESCALATION_PROOF = [
  { src: '/tiktok-proof/IMG_9949.jpeg', caption: '"Labor Day" / "extremely rude" / "discuss... your performance"' },
];

const INVITE_PROOF = [
  { src: '/tiktok-proof/IMG_9950.jpeg', caption: 'Invited to name what was rude — the answer: "You change your CN name" and "You lark me at 3am"' },
];

const NAME_PROOF = [
  { src: '/tiktok-proof/IMG_9951.jpeg', caption: 'Our own message explaining the CN name change' },
];

const HOURS_PROOF = [
  { src: '/tiktok-proof/IMG_9952.jpeg', caption: 'Our own message explaining our office hours' },
];

const LAST_MESSAGE_PROOF = [
  { src: '/tiktok-proof/IMG_9979.jpeg', caption: 'We offered to let her deny the name change — "That’s not an issue" — her reply: "not necessary to be anxious," the last message our POC sent' },
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
              Today we are withdrawing the proposed suspension of our TikTok servers and TikTok agency. TikTok paid what they owe us. Servers stay on. Agency support stays on.
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              The payment is closed. The threat is not.
            </p>

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              When we asked when an entire month of payment would be released, our point of contact threatened us.
            </p>

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
              After the settlement was confirmed, invoiced, and approved, the file stopped at &quot;Process payout&quot; on September 6.
            </p>

            <ProofImages items={SETTLEMENT_PROOF} />

            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              On September 8 she blamed a holiday.
            </p>

            <ProofImages items={HOLIDAY_PROOF} />

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              On September 9 at 11:41 a.m., two days after TikTok&apos;s own &quot;around the 7th&quot; release date, support was still telling us to wait until the 7th.
            </p>

            <ProofImages items={POLICY_PROOF} />

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              When we asked why the payout still had not processed, the answer was &quot;Labor Day&quot; and &quot;every single CN is delayed.&quot; When we followed up again, we were told we were &quot;extremely rude&quot; for asking, that our &quot;performance&quot; would be discussed with their team, and that it was &quot;not necessary to be anxious&quot; about money we are owed.
            </p>

            <ProofImages items={ESCALATION_PROOF} />

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
              When we invited them to point out what they found extremely rude, they could not. Their response was that we abbreviated our company name to our DBA — after another network was told a shorter name was exactly what unblocked their settlement — and that we send messages outside of their office hours, which we have never asked them to answer outside of.
            </p>

            <ProofImages items={INVITE_PROOF} />

            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              We explained the name change in writing.
            </p>

            <ProofImages items={NAME_PROOF} />

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              We explained our office hours in writing.
            </p>

            <ProofImages items={HOURS_PROOF} />

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              The last message she sent was that the delay was due to the holiday and that it was not necessary to be anxious.
            </p>

            <ProofImages items={LAST_MESSAGE_PROOF} />

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
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
