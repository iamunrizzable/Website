// Screenshots backing specific claims in the suspension letter below —
// grouped by which paragraph they support, in the order they're shown.
const ATTEMPTS_PROOF = [
  { src: '/tiktok-proof/IMG_9866.jpeg', caption: 'Settlement approved, invoice submitted, confirmed — then stuck at "Process payout," 09/06/2026' },
  { src: '/tiktok-proof/IMG_9954.jpeg', caption: 'Message 1: we ask about the payout, our POC — on her second Lark account — blames a holiday — 09/08/2026' },
];

const POLICY_PROOF = [
  { src: '/tiktok-proof/IMG_9865.jpeg', caption: 'Sept 9, 11:41 AM: TikTok’s own support says to "wait until the 7th of this month" — two days after the 7th' },
];

const RUDE_PROOF = [
  { src: '/tiktok-proof/IMG_9949.jpeg', caption: '"Labor Day" / "extremely rude" / "discuss... your performance"' },
  { src: '/tiktok-proof/IMG_9897.jpeg', caption: '"the delay is due to holiday" / "not necessary to be anxious"' },
  { src: '/tiktok-proof/IMG_9950.jpeg', caption: 'Invited to name what was rude — the answer: "You change your CN name" and "You lark me at 3am"' },
  { src: '/tiktok-proof/IMG_9951.jpeg', caption: 'Our own message explaining the CN name change' },
  { src: '/tiktok-proof/IMG_9952.jpeg', caption: 'Our own message explaining our office hours' },
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

// The suspension letter itself, shared by TikTokSuspensionGate (shown when
// the /admin/security kill switch is on) and the /tiktok/notice preview
// page (always shown, regardless of the kill switch, so the notice can be
// reviewed/tweaked without actually blocking the live agency pages).
export default function SuspensionNotice() {
  return (
    <>
      <style>{`
        @keyframes tsGlowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(239,68,68,0.6), 0 0 40px rgba(239,68,68,0.3); }
          50% { text-shadow: 0 0 40px rgba(239,68,68,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(168,85,247,0.5); }
        }
        @keyframes tsBorderGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(239,68,68,0.4), 0 0 30px rgba(239,68,68,0.2); }
          50% { box-shadow: 0 0 25px rgba(239,68,68,0.7), 0 0 50px rgba(236,72,153,0.4); }
        }
        @keyframes tsPopIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0f172a',
          zIndex: 999999,
          overflowY: 'auto',
          display: 'flex',
          padding: '40px 12px',
          boxSizing: 'border-box',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: 'url(/bg-main.jpeg)',
            backgroundPosition: 'center center',
            backgroundSize: '140%',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'lighten',
            opacity: 0.13,
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            maxWidth: 560,
            width: '100%',
            margin: 'auto',
            textAlign: 'center',
            color: '#e2e8f0',
            background: 'rgba(15,23,42,0.6)',
            border: '2px solid rgba(239,68,68,0.35)',
            borderRadius: 16,
            padding: '36px 24px',
            position: 'relative',
            zIndex: 10,
            animation: 'tsPopIn 0.6s ease-out, tsBorderGlow 3s ease-in-out infinite',
          }}
        >
          <h1
            style={{
              color: '#ef4444',
              fontSize: 22,
              lineHeight: 1.4,
              margin: '0 0 22px',
              fontWeight: 800,
              animation: 'tsGlowPulse 3s ease-in-out infinite',
            }}
          >
            WE HAVE SUSPENDED ALL ACCESS<br />TO OUR TIKTOK SERVERS AND SUPPORT.
          </h1>

          <div style={{ fontSize: 15, lineHeight: 1.7, textAlign: 'left' }}>
            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>Hello,</p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              While we we appreciate your interest in our TikTok agency and services, we sadly had to temporarily suspend all access to our TikTok servers, and Agency.
            </p>

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              This is because TikTok Not Only owes us an entire month&apos;s worth of money, they threatened us for asking them when we would be paid.
            </p>

            <p style={{ color: '#d946ef', margin: '0 0 16px' }}>
              We have made multiple attempts through multiple channels to try to get TikTok to process our payment, and none were successful.
            </p>

            <ProofImages items={ATTEMPTS_PROOF} />

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
              TikTok&apos;s own policy states that settlements are released &quot;around the 7th of the following month.&quot; On September 9th — two days after their own stated date — their support was still telling us to &quot;wait until the 7th of this month&quot; for a payment that, by their own timeline, should already have been sent.
            </p>

            <ProofImages items={POLICY_PROOF} />

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              When we asked why our payout still had not been processed, the answer was &quot;Labor Day&quot; and &quot;every single cn is delayed.&quot; When we followed up again, we were told we were &quot;extremely rude&quot; for asking, that our &quot;performance&quot; would be discussed with their team, and that it was &quot;not necessary to be anxious&quot; about money we are owed. When we invited them to point out what they found &quot;extremely rude,&quot; their response was that we abbreviated our own company name to our DBA — after another network was told a shorter name was exactly what unblocked their settlement — and that we send messages outside of their office hours, which we have never once asked them to answer outside of.
            </p>

            <ProofImages items={RUDE_PROOF} />

            <p style={{ color: '#06b6d4', margin: '0 0 16px' }}>
              TJB MANAGEMENT INC., will reactivate it&apos;s servers and support for TikTok WHEN tiktok pays us what they owe us, because after all, they shut off access to systems for consumers and business owners when they are not paid on time, so we thought — why shouldn&apos;t we do the same to them?
            </p>

            <p style={{ color: '#ec4899', margin: '0 0 16px' }}>
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
              {' '}so we can get back to working with their platform.
            </p>

            <p style={{ color: '#a855f7', margin: '0 0 16px' }}>
              Thank you for your patience and understanding,
            </p>

            <p style={{ color: '#06b6d4', margin: 0 }}>
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

          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: 26,
              padding: '12px 28px',
              borderRadius: 999,
              background: '#a855f7',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Go to Homepage →
          </a>
        </div>
      </div>
    </>
  );
}
