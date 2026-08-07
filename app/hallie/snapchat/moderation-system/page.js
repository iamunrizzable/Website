'use client';

import './page.css';

import { useState } from 'react';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #334155' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6, marginTop: 16 },
  textarea: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box', minHeight: 100, resize: 'vertical', fontFamily: 'inherit' },
  input: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box' },
  btn: { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginTop: 16 },
  btnSm: { background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
};

export default function SnapchatModerationSystem() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleDraft(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const res = await fetch('/api/hallie/snapchat/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        setDraft('');
      } else {
        setDraft(data.reply);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
        <a href="/contact-agency" onClick={() => setMenuOpen(false)}>Connect with Agency</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Connect with Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie</a>
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Connect with Hallie</a>
        <a href="/hallie/tiktok-moderation/system" onClick={() => setMenuOpen(false)}>Hallie TikTok Moderation System</a>
        <a href="/merch" onClick={() => setMenuOpen(false)}>Merch</a>
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/tiktok-guidelines" onClick={() => setMenuOpen(false)}>TikTok Guidelines</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <div style={s.page}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 4, animation: 'glowPulse 3s ease-in-out infinite' }}>
            Hallie — Snapchat Reply Drafts
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>
            Paste a Snapchat message below and Hallie will draft a suggested reply in your voice. Nothing is sent
            automatically — copy the draft and send it yourself in Snapchat.
          </p>

          <div style={s.card}>
            <form onSubmit={handleDraft}>
              <label style={s.label}>Message you received</label>
              <textarea
                style={s.textarea}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Paste the Snapchat message here…"
              />
              <label style={s.label}>Extra context (optional)</label>
              <input
                style={s.input}
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="e.g. this is a fan asking about joining the agency"
              />
              <button type="submit" style={{ ...s.btn, opacity: loading || !message.trim() ? 0.6 : 1 }} disabled={loading || !message.trim()}>
                {loading ? 'Drafting…' : 'Draft Reply'}
              </button>
            </form>

            {error && (
              <p style={{ color: '#ef4444', fontSize: 13, marginTop: 16 }}>{error}</p>
            )}

            {draft && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #334155' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Suggested reply</p>
                <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.6, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '12px 16px', whiteSpace: 'pre-wrap' }}>
                  {draft}
                </p>
                <button onClick={handleCopy} style={{ ...s.btnSm, marginTop: 10 }}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
