'use client';

// Admin-only: the proxy requires a valid admin session for everything under /admin.
const s = {
  page: { minHeight: '100vh', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10, maxWidth: 720, margin: '0 auto' },
  card: { background: '#1e293b', borderRadius: 12, padding: 20, marginBottom: 20, border: '2px solid rgba(168,85,247,0.25)' },
  h1: { fontSize: 26, fontWeight: 700, marginBottom: 8 },
  h2: { fontSize: 16, fontWeight: 600, color: '#d946ef', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  p: { fontSize: 14, lineHeight: 1.7, color: '#cbd5e1', margin: '0 0 8px' },
  back: { color: '#d4a5ff', fontSize: 14, textDecoration: 'none' },
};

export default function HallieAppPage() {
  return (
    <div style={s.page}>
      <a href="/admin" style={s.back}>← Admin tools</a>
      <h1 style={s.h1}>Hallie App</h1>
      <p style={s.p}>The native iPhone and iPad app. Hallie runs on the device itself, so there is no server model and no rate limit. The app is locked: it opens only after you sign in with the same admin username, password and authenticator code as this site.</p>

      <div style={s.card}>
        <h2 style={s.h2}>What is in the app</h2>
        <p style={s.p}>• Chat with Hallie, with her full persona, on-device.</p>
        <p style={s.p}>• Hallie Writer: drafts emails and DMs as Hallie or as you, with the same prompts as the site. Drafts only, you send everything yourself.</p>
        <p style={s.p}>• Admin sign-in. The session is stored in the device Keychain and the app can sign out.</p>
      </div>

      <div style={s.card}>
        <h2 style={s.h2}>Status</h2>
        <p style={s.p}>In development. The app builds in the cloud on every change, but it has not been installed on a device yet. It needs the Apple Developer account and TestFlight before it can be installed.</p>
      </div>

      <div style={s.card}>
        <h2 style={s.h2}>Not in the app yet</h2>
        <p style={s.p}>Memory, kill switches, security log and the TikTok moderation tools are still on this site only.</p>
      </div>
    </div>
  );
}
