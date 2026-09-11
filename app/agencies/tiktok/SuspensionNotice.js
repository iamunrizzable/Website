'use client';

// The suspension block page itself, shared by TikTokSuspensionGate (shown
// when the /admin/security kill switch is on) and the /tiktok/notice
// preview page (always shown, regardless of the kill switch, so the notice
// can be reviewed/tweaked without actually blocking the live agency
// pages). Kept minimal on purpose — the full evidence-backed account lives
// at the linked notice-of-suspension letter, not here.
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
            padding: '48px 24px',
            position: 'relative',
            zIndex: 10,
            animation: 'tsPopIn 0.6s ease-out, tsBorderGlow 3s ease-in-out infinite',
          }}
        >
          <h1
            style={{
              color: '#ef4444',
              fontSize: 34,
              lineHeight: 1.3,
              margin: '0 0 24px',
              fontWeight: 800,
              animation: 'tsGlowPulse 3s ease-in-out infinite',
            }}
          >
            WE HAVE SUSPENDED
            <br />
            ALL ACCESS
            <br />
            TO OUR TIKTOK SERVICES
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.6, color: '#d946ef', margin: '0 0 32px' }}>
            TikTok owes us a month&apos;s pay. When we asked when we&apos;d be paid, they threatened us instead — so we shut them out, the same way they shut out creators who don&apos;t pay on time.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <a
              href="/news/notice/of/tiktok/suspension/on/9/10/2026"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                borderRadius: 999,
                background: '#a855f7',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Read the Full Notice →
            </a>

            <a
              href="/"
              style={{
                display: 'inline-block',
                color: '#94a3b8',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'underline',
              }}
            >
              Go to Homepage →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
