'use client';

import { useState } from 'react';

export default function JoinAgency() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: '', tiktok: '', diamonds: '', hours: '', why: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) alert('Error: ' + data.error);
      else setSubmitted(true);
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        body::before {
          content: "";
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-tyler.png");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -2;
          pointer-events: none;
        }
        body { margin: 0; padding: 0; background: transparent; }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.3); }
          50% { text-shadow: 0 0 40px rgba(168,85,247,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(59,130,246,0.5); }
        }
        main { max-width: 600px; margin: 0 auto; padding: 40px 20px; position: relative; z-index: 10; }
        h1 { color: #d4a5ff; font-size: 32px; margin-bottom: 8px; animation: glowPulse 3s ease-in-out infinite; }
        .subtitle { color: #a0aec0; font-size: 15px; margin-bottom: 36px; }
        .card { background: rgba(30,41,59,0.9); border: 1px solid #334155; border-radius: 14px; padding: 32px; }
        label { display: block; font-size: 13px; color: #94a3b8; margin-bottom: 6px; margin-top: 18px; }
        label:first-of-type { margin-top: 0; }
        input, textarea, select {
          width: 100%; background: #0f172a; border: 1px solid #475569;
          border-radius: 8px; padding: 11px 14px; color: #e2e8f0;
          font-size: 14px; box-sizing: border-box; font-family: inherit;
        }
        textarea { min-height: 100px; resize: vertical; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #a855f7; }
        .btn {
          margin-top: 24px; width: 100%; padding: 14px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          color: #fff; font-size: 17px; font-weight: 700;
          border: none; border-radius: 10px; cursor: pointer;
          transition: all 0.3s ease; box-shadow: 0 0 20px rgba(168,85,247,0.4);
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(168,85,247,0.7); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .success { text-align: center; padding: 40px 20px; }
        .success h2 { color: #10b981; font-size: 28px; margin-bottom: 12px; }
        .success p { color: #a0aec0; font-size: 15px; line-height: 1.7; }
        .back-link { display: inline-block; margin-bottom: 30px; color: #a855f7; text-decoration: none; font-weight: 500; }
        .back-link:hover { text-decoration: underline; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #4b5563; }
        .menu-button { position: fixed; top: 20px; right: 20px; background-color: #a855f7; color: #fff; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; z-index: 100; font-size: 16px; transition: all 0.3s ease; }
        .menu-button:hover { background-color: #9333ea; transform: scale(1.05); box-shadow: 0 0 20px rgba(168,85,247,0.6); }
        .menu-dropdown { display: none; position: fixed; top: 60px; right: 20px; background-color: #0f172a; border: 2px solid #a855f7; border-radius: 5px; padding: 10px 0; min-width: 200px; z-index: 101; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
        .menu-dropdown.active { display: block; }
        .menu-dropdown a { display: block; padding: 10px 20px; color: #a855f7; text-decoration: none; border-bottom: 1px solid rgba(168,85,247,0.2); transition: background-color 0.2s; }
        .menu-dropdown a:last-child { border-bottom: none; }
        .menu-dropdown a:hover { background-color: rgba(168,85,247,0.1); }
        .fade-top { position: fixed; top: 0; left: 0; width: 100%; height: 200px; background: linear-gradient(to bottom, rgba(15,23,42,0.95), transparent); z-index: 50; pointer-events: none; }
      `}</style>

      <div className="fade-top"></div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie</a>
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Contact Hallie</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Contact Tyler</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
        <a href="/join-agency" onClick={() => setMenuOpen(false)}>Join the Agency</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/agency" className="back-link">← Back to Agency</a>
        <h1>Join TJB Management</h1>
        <p className="subtitle">Apply below — Tyler reviews every application personally.</p>

        <div className="card">
          {submitted ? (
            <div className="success">
              <h2>✅ Application Sent!</h2>
              <p>Thanks for applying to TJB Management Inc. Tyler or Hallie will be in touch shortly. Make sure your TikTok DMs are open.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>Your Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />

              <label>TikTok Username</label>
              <input name="tiktok" value={form.tiktok} onChange={handleChange} placeholder="@yourusername" required />

              <label>Average Monthly Diamonds</label>
              <input name="diamonds" value={form.diamonds} onChange={handleChange} placeholder="e.g. 50,000" required />

              <label>Average Monthly LIVE Hours</label>
              <input name="hours" value={form.hours} onChange={handleChange} placeholder="e.g. 40 hours" required />

              <label>Why do you want to join TJB Management?</label>
              <textarea name="why" value={form.why} onChange={handleChange} placeholder="Tell Tyler a little about yourself and what you're looking for..." required />

              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Application →'}
              </button>
            </form>
          )}
        </div>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
