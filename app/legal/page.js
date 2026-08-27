'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function Legal() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>Agency Hub</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler Hub</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™ Hub</a>
        <a href="/tiktok/agency" onClick={() => setMenuOpen(false)}>TikTok Hub</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal Hub</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <div className="header section">
          <h1>Legal & Guidelines</h1>
          <p className="subtitle">TJB Management Inc. · Policies, Terms & Compliance Documentation</p>
        </div>

        <div className="grid">
          <a href="/legal/general" className="card section">
            <span className="card-icon">📄</span>
            <span className="card-title">General Legal Terms</span>
            <span className="card-desc">General terms of use, intellectual property, liability, and contact information applicable to tjbmanagementinc.com as a whole.</span>
            <span className="card-link">VIEW TERMS →</span>
          </a>

          <a href="/legal/agency" className="card section">
            <span className="card-icon">🏢</span>
            <span className="card-title">Agency Guidelines</span>
            <span className="card-desc">Creator eligibility, representation terms, non-compete policy, ban appeals, and contact information for TJB Management agency clients.</span>
            <span className="card-link">VIEW GUIDELINES →</span>
          </a>

          <a href="/legal/hallie-tiktok-moderation-system" className="card section">
            <span className="card-icon">🛡️</span>
            <span className="card-title">Hallie Platform — Data Security & Privacy</span>
            <span className="card-desc">Full data security, privacy, and compliance documentation for the Hallie TikTok Account Automation Platform, including USDS and DSPR requirements.</span>
            <span className="card-link">VIEW POLICY →</span>
          </a>

          <a href="/legal/policies-and-procedures" className="card section">
            <span className="card-icon">📋</span>
            <span className="card-title">Policies & Procedures</span>
            <span className="card-desc">A single consolidated reference for every policy and procedure TJB Management Inc. has written across this website — agency terms, the Hallie data security policy, and general legal terms.</span>
            <span className="card-link">VIEW ALL POLICIES →</span>
          </a>

          <a href="/legal/privacy-policy" className="card section">
            <span className="card-icon">🔒</span>
            <span className="card-title">Privacy Policy</span>
            <span className="card-desc">How tjbmanagementinc.com handles data — cookies in use, what creator data managers can see, third-party links, and the full Hallie Platform Data Security & Privacy Policy.</span>
            <span className="card-link">VIEW PRIVACY POLICY →</span>
          </a>
        </div>

        <footer>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>TikTok and the TikTok logo are trademarks of TikTok US Data Security Joint Venture LLC. All other logos and trademarks are the property of their respective owners.</p>
        </footer>
      </main>
    </>
  );
}
