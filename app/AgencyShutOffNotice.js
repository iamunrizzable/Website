'use client';

// Shared "access shut off" notice for both agency kill switches —
// app/agencies/tiktok/SuspensionNotice.js and
// app/agencies/c2/C2SuspensionNotice.js both render this with only the
// agency name differing. Exact copy and the pink solid-button (not the
// gradient-text mailto link used elsewhere on DeviceGate.js's block
// screens) are per explicit instruction.
export default function AgencyShutOffNotice({ agencyName }) {
  return (
    <>
      <style>{`
        @keyframes asoGlowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(239,68,68,0.6), 0 0 40px rgba(239,68,68,0.3); }
          50% { text-shadow: 0 0 40px rgba(239,68,68,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(168,85,247,0.5); }
        }
        @keyframes asoBorderGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(239,68,68,0.4), 0 0 30px rgba(239,68,68,0.2); }
          50% { box-shadow: 0 0 25px rgba(239,68,68,0.7), 0 0 50px rgba(236,72,153,0.4); }
        }
        @keyframes asoPopIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes asoBtnGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(236,72,153,0.4), 0 0 30px rgba(236,72,153,0.2); }
          50% { box-shadow: 0 0 25px rgba(236,72,153,0.7), 0 0 50px rgba(217,70,239,0.4); }
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
            background: 'rgba(15,23,42,0.6)', border: '2px solid rgba(239,68,68,0.35)', borderRadius: 16,
            padding: '48px 24px', position: 'relative', zIndex: 10,
            animation: 'asoPopIn 0.6s ease-out, asoBorderGlow 3s ease-in-out infinite',
          }}
        >
          <h1
            style={{
              color: '#ef4444', fontSize: 26, lineHeight: 1.5, margin: '0 0 28px', fontWeight: 800,
              animation: 'asoGlowPulse 3s ease-in-out infinite',
            }}
          >
            We have shut off access to our {agencyName} Agency, for questions or comments
          </h1>
          <a
            href="mailto:Tyler@tjbmanagementinc.com"
            style={{
              display: 'inline-block', padding: '14px 36px', borderRadius: 999, background: '#ec4899',
              color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: 0.5, textDecoration: 'none',
              animation: 'asoBtnGlow 3s ease-in-out infinite',
            }}
          >
            EMAIL TYLER
          </a>
        </div>
      </div>
    </>
  );
}
