'use client';

import './page.css';

import { useState, useEffect } from 'react';

const VOICE_KEY = 'tyler_writer_voice_examples';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #334155' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6, marginTop: 16 },
  textarea: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box', minHeight: 100, resize: 'vertical', fontFamily: 'inherit' },
  input: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box' },
  btn: { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginTop: 16 },
  btnSm: { background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  segWrap: { display: 'inline-flex', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, overflow: 'hidden' },
  seg: { background: 'none', border: 'none', color: '#94a3b8', padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  segActive: { background: '#a855f7', color: '#fff' },
};

export default function HallieWriter() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [persona, setPersona] = useState('hallie');
  const [channel, setChannel] = useState('dm');
  const [mode, setMode] = useState('reply');
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [voiceExamples, setVoiceExamples] = useState('');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceSaved, setVoiceSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  // Fetched-but-not-yet-added-to-voiceExamples snippets, each reviewed
  // individually before anything is kept. Unchecked by default — an
  // inbox has personal/sensitive content mixed in with business
  // correspondence (family, legal, medical, harassment reports), and
  // none of that belongs in a business-writing voice profile headed to
  // a third-party AI without Tyler explicitly choosing to include it.
  const [importReview, setImportReview] = useState([]);

  // Tyler's voice samples live in this browser's localStorage — this app
  // has no server-side storage, and they only ever need to exist on
  // Tyler's own devices. Hallie's persona never reads this; it's Tyler-
  // persona-only, on purpose (she keeps her own identity).
  useEffect(() => {
    const stored = localStorage.getItem(VOICE_KEY);
    if (stored) setVoiceExamples(stored);
  }, []);

  function handleVoiceSave() {
    localStorage.setItem(VOICE_KEY, voiceExamples);
    setVoiceSaved(true);
    setTimeout(() => setVoiceSaved(false), 2000);
  }

  async function handleImportEmail() {
    setImporting(true);
    setImportError('');
    try {
      const res = await fetch('/api/hallie/voice-import/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 30 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? 'Import failed');
        return;
      }
      if (!data.snippets?.length) {
        setImportError('No sent emails found to import');
        return;
      }
      setImportReview(data.snippets.map(text => ({ text, checked: false })));
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  }

  function toggleReviewItem(i) {
    setImportReview(prev => prev.map((item, idx) => (idx === i ? { ...item, checked: !item.checked } : item)));
  }

  function setAllReview(checked) {
    setImportReview(prev => prev.map(item => ({ ...item, checked })));
  }

  function addSelectedToVoice() {
    const selected = importReview.filter(item => item.checked).map(item => item.text);
    if (!selected.length) return;
    const joined = selected.join('\n');
    setVoiceExamples(prev => (prev.trim() ? `${prev.trim()}\n${joined}` : joined));
    setImportReview(prev => prev.filter(item => !item.checked));
  }

  const selectedCount = importReview.filter(item => item.checked).length;

  const inputLabel = mode === 'reply'
    ? `${channel === 'email' ? 'Email' : 'DM'} you received`
    : 'What do you want to say, and to who?';
  const inputPlaceholder = mode === 'reply'
    ? `Paste the ${channel === 'email' ? 'email' : 'message'} here…`
    : channel === 'email'
      ? 'e.g. email a brand back saying I’m interested but need details on budget and timeline'
      : 'e.g. tell this creator their audit is done and ask when they can hop on a call';

  async function handleDraft(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const res = await fetch('/api/hallie/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          channel,
          mode,
          persona,
          voiceExamples: persona === 'tyler' ? voiceExamples : undefined,
        }),
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
          <a href="/admin" style={{ color: '#a855f7', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 8 }}>← All Tools</a>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 4, animation: 'glowPulse 3s ease-in-out infinite' }}>
            Writer
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>
            Two voices to draft in: <strong>Hallie</strong> writes as herself — your AI assistant, speaking on your
            behalf, never pretending to be you. <strong>Tyler</strong> writes as you, first person, in your own voice.
            Nothing is sent automatically — copy the draft and send it yourself.
          </p>
          <p style={{ color: '#eab308', fontSize: 12, lineHeight: 1.5, marginBottom: 24, background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 8, padding: '10px 14px' }}>
            ⚠️ Never paste TikTok DMs, comments, or anything pulled from the Hallie TikTok Platform in here.
            Drafts are processed by a third-party AI service, and the Platform&apos;s privacy policy guarantees
            TikTok data never goes to third-party AI. Emails, Snapchat, IG, and everything else are fine.
          </p>

          <div style={s.card}>
            <label style={{ ...s.label, marginTop: 0 }}>Who&apos;s writing?</label>
            <div style={s.segWrap}>
              <button type="button" style={{ ...s.seg, ...(persona === 'hallie' ? s.segActive : {}) }} onClick={() => setPersona('hallie')}>Hallie</button>
              <button type="button" style={{ ...s.seg, ...(persona === 'tyler' ? s.segActive : {}) }} onClick={() => setPersona('tyler')}>Tyler</button>
            </div>
          </div>

          {persona === 'tyler' && (
            <div style={s.card}>
              <button
                onClick={() => setVoiceOpen(!voiceOpen)}
                style={{ background: 'none', border: 'none', color: '#d4a5ff', cursor: 'pointer', fontSize: 15, fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span style={{ fontSize: 12 }}>{voiceOpen ? '▼' : '▶'}</span>
                Your Voice {voiceExamples.trim() ? `(${voiceExamples.split('\n').filter(l => l.trim()).length} samples saved)` : '(not set up — drafts will sound generic)'}
              </button>
              {voiceOpen && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
                    Paste real messages you&apos;ve sent — one per line, the more the better (10-20 is a good start).
                    The Tyler persona studies these and copies how you actually type: slang, punctuation, emoji, all
                    of it. Saved only in this browser, so set it up once per device. TikTok content is never used
                    here, imported or pasted.
                  </p>
                  <button onClick={handleImportEmail} style={{ ...s.btnSm, marginBottom: 10 }} disabled={importing}>
                    {importing ? 'Importing…' : 'Import from Sent Email'}
                  </button>
                  {importError && (
                    <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{importError}</p>
                  )}

                  {importReview.length > 0 && (
                    <div style={{ background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                      <p style={{ color: '#eab308', fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
                        Review each one — inboxes mix business emails with personal, family, legal, or medical
                        content that has no business being sent to an AI as a writing sample. Nothing here is
                        added until you check it.
                      </p>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <button type="button" onClick={() => setAllReview(true)} style={s.btnSm}>Select All</button>
                        <button type="button" onClick={() => setAllReview(false)} style={s.btnSm}>Deselect All</button>
                      </div>
                      <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {importReview.map((item, i) => (
                          <label key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#cbd5e1', cursor: 'pointer' }}>
                            <input type="checkbox" checked={item.checked} onChange={() => toggleReviewItem(i)} style={{ marginTop: 3, flexShrink: 0 }} />
                            <span>{item.text.length > 220 ? `${item.text.slice(0, 220)}…` : item.text}</span>
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addSelectedToVoice}
                        style={{ ...s.btnSm, marginTop: 10, opacity: selectedCount ? 1 : 0.5 }}
                        disabled={!selectedCount}
                      >
                        Add {selectedCount || ''} Selected to Voice Samples
                      </button>
                    </div>
                  )}

                  <textarea
                    style={{ ...s.textarea, minHeight: 160 }}
                    value={voiceExamples}
                    onChange={e => setVoiceExamples(e.target.value)}
                    placeholder={'yo what’s good bro\nlmk when you tryna go live, i can get you set up fr\nnah we don’t do that here 😂'}
                  />
                  <button onClick={handleVoiceSave} style={{ ...s.btnSm, marginTop: 8 }}>
                    {voiceSaved ? 'Saved!' : 'Save Voice'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={s.card}>
            <form onSubmit={handleDraft}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={s.segWrap}>
                  <button type="button" style={{ ...s.seg, ...(channel === 'dm' ? s.segActive : {}) }} onClick={() => setChannel('dm')}>DM</button>
                  <button type="button" style={{ ...s.seg, ...(channel === 'email' ? s.segActive : {}) }} onClick={() => setChannel('email')}>Email</button>
                </div>
                <div style={s.segWrap}>
                  <button type="button" style={{ ...s.seg, ...(mode === 'reply' ? s.segActive : {}) }} onClick={() => setMode('reply')}>Reply</button>
                  <button type="button" style={{ ...s.seg, ...(mode === 'compose' ? s.segActive : {}) }} onClick={() => setMode('compose')}>Write New</button>
                </div>
              </div>

              <label style={s.label}>{inputLabel}</label>
              <textarea
                style={s.textarea}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={inputPlaceholder}
              />
              <label style={s.label}>Extra context (optional)</label>
              <input
                style={s.input}
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="e.g. this is a creator already signed with the agency"
              />
              <button type="submit" style={{ ...s.btn, opacity: loading || !message.trim() ? 0.6 : 1 }} disabled={loading || !message.trim()}>
                {loading ? 'Drafting…' : 'Draft It'}
              </button>
            </form>

            {error && (
              <p style={{ color: '#ef4444', fontSize: 13, marginTop: 16 }}>{error}</p>
            )}

            {draft && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #334155' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>
                  {persona === 'hallie' ? "Hallie's draft" : "Draft (as you)"}
                </p>
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
