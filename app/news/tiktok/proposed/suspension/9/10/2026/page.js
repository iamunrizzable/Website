'use client';

import './page.css';

import { useState } from 'react';

// Screenshots backing specific claims in the letter below — each one
// placed directly under the paragraph it supports.
const SETTLEMENT_PROOF = [
  { src: '/tiktok-proof/IMG_9866.jpeg', caption: 'Settlement confirmed, invoice submitted, approved — then stuck at "Process payout," 09/06/2026' },
];

const ATTEMPT_PROOF = [
  { src: '/tiktok-proof/IMG_9954.jpeg', caption: 'September 8: we ask about the payout — our POC blames a holiday' },
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
  { src: '/tiktok-proof/IMG_9897.jpeg', caption: '"the delay is due to holiday" / "not necessary to be anxious" — the last message our POC sent' },
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

// Standalone permalink for this newsletter entry, separate from the
// actual block-popup gate (TikTokSuspensionGate / SuspensionNotice.js).
// This is an archived public letter, reachable by anyone at any time —
// it does not drive or read the /admin/security kill switch.
export default function ProposedSuspensionLetter() {
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
            Potential TikTok Servers, Agency and Support Suspension
          </h1>

          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 4px' }}>TJB Management Inc.</p>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 22px' }}>September 10, 2026 — 11 AM Eastern Time</p>

          <div style={{ fontSize: 15, lineHeight: 1.7, textAlign: 'left' }}>
            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              Notice of potential suspension of TJB Management inc&apos;s Tiktok agency, Tjb Inc&apos;s TikTok servers, and TJB Management inc&apos;s TikTok support to take effect 9/11/2026 at 12 PM ET.
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              TikTok owes us an entire month of payment. When we asked when that payment would be released, they threatened us. We made multiple attempts through multiple channels to get the payment processed. None were successful.
            </p>

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              The settlement was confirmed. The invoice was submitted. The settlement was approved. On September 6, 2026, the file stopped at &quot;Process payout.&quot;
            </p>

            <ProofImages items={SETTLEMENT_PROOF} />

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
              On September 8 we asked our point of contact why the payout had not processed. She blamed a holiday.
            </p>

            <ProofImages items={ATTEMPT_PROOF} />

            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              TikTok&apos;s own policy states that settlements are released around the 7th of the following month. On September 9 at 11:41 a.m. — two days after that date — support was still telling us to wait until the 7th of this month for a payment that, by their own timeline, should already have been sent.
            </p>

            <ProofImages items={POLICY_PROOF} />

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              When we asked why the payout still had not been processed, the answer was &quot;Labor Day&quot; and &quot;every single CN is delayed.&quot;
            </p>

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              When we followed up again on September 9, 2026 after still not seeing our payment remitted, we were told we were &quot;extremely rude&quot; for asking, that our &quot;performance&quot; would be discussed with their team.
            </p>

            <ProofImages items={ESCALATION_PROOF} />

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
              When we invited them to point out what they found extremely rude, their response was that we abbreviated our company name to our DBA — after another network was told a shorter name was exactly what unblocked their settlement — and that we send messages outside of their office hours, which we have never asked them to answer outside of.
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
              The last message our POC sent was that the delay was due to the holiday, that it was not necessary to be anxious about money we are owed, and that we were told to continue to wait.
            </p>

            <ProofImages items={LAST_MESSAGE_PROOF} />

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
              If TikTok does not pay TJB Management Inc., the money it owes TJB Management Inc., TJB Management Inc., will suspend our TikTok servers and TikTok agency support on September 11th, 2026 at 12 PM Eastern time until that payment is processed, because after all, they shut off access to systems for consumers and business owners when they are not paid on time, so we thought — why shouldn&apos;t we do the same to them?
            </p>

            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              We encourage you to tell TikTok to process the payment they owe us at{' '}
              <a
                href="https://www.tiktok.com/legal/report/feedback"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                tiktok.com/legal/report/feedback
              </a>
              {' '}so we can continue working with their platform.
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              Thank you for your patience and understanding.
            </p>

            <p style={{ color: '#a855f7', margin: 0 }}>
              If you have any questions, please email Tyler at{' '}
              <a
                href="mailto:Tyler@TJBManagementinc.com"
                style={{
                  background: 'linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                Tyler@TJBManagementinc.com
              </a>
              .
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
