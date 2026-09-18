'use client';

// Site-wide maintenance notice — amber, not the red used for the agency
// kill switches, since this isn't a moderation/access-revoked action, just
// a temporary planned outage (matches the amber used for DeviceGate.js's
// "unable to verify" soft-block, same distinction: red = something was
// actively shut off, amber = temporary/expected). No email CTA — not
// asked for on this one, unlike the two agency notices.
export default function MaintenanceNotice() {
  return (
    <>
      <style>{`
        @keyframes mnGlowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(245,158,11,0.6), 0 0 40px rgba(245,158,11,0.3); }
          50% { text-shadow: 0 0 40px rgba(245,158,11,1), 0 0 60px rgba(236,72,153,0.6), 0 0 80px rgba(168,85,247,0.4); }
        }
        @keyframes mnBorderGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(245,158,11,0.4), 0 0 30px rgba(245,158,11,0.2); }
          50% { box-shadow: 0 0 25px rgba(245,158,11,0.7), 0 0 50px rgba(236,72,153,0.3); }
        }
        @keyframes mnPopIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed', inset: 0, background: '#0f172a', zIndex: 999999, overflowY: 'auto',
          display: 'flex', padding: '40px 12px', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'fixed', inset: 0, backgroundImage: 'url(/bg-main.jpeg)', backgroundPosition: 'center center',
            backgroundSize: '140%', backgroundRepeat: 'no-repeat', mixBlendMode: 'lighten', opacity: 0.13,
            zIndex: -1, pointerEvents: 'none',
          }}
        />
        <div
          style={{
            maxWidth: 520, width: '100%', margin: 'auto', textAlign: 'center', color: '#e2e8f0',
            background: 'rgba(15,23,42,0.6)', border: '2px solid rgba(245,158,11,0.35)', borderRadius: 16,
            padding: '48px 24px', position: 'relative', zIndex: 10,
            animation: 'mnPopIn 0.6s ease-out, mnBorderGlow 3s ease-in-out infinite',
          }}
        >
          <h1
            style={{
              color: '#f59e0b', fontSize: 28, lineHeight: 1.4, margin: '0 0 16px', fontWeight: 800,
              animation: 'mnGlowPulse 3s ease-in-out infinite',
            }}
          >
            We have taken the site offline for maintenance.
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            The site will be back very soon, thank you for your patience.
          </p>
        </div>
      </div>
    </>
  );
}
