'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function PoliciesAndProcedures() {
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

      <div className="fade-top"></div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/system/status" onClick={() => setMenuOpen(false)}>System Status</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/legal" className="back-link">← Back to Legal</a>

        <div className="header section">
          <h1>Policies & Procedures</h1>
          <p className="subtitle">TJB Management Inc. · The full policy library, one topic per page — each page includes the General Legal Terms that apply site-wide</p>
          <span className="badge">📋 Policy Library</span>
        </div>

        <div className="grid">
          <a href="/legal/policies/and/procedures/tiktok/agency" className="card section">
            <span className="card-icon">🏢</span>
            <span className="card-title">TikTok Agency Policies & Procedures</span>
            <span className="card-desc">Creator eligibility, representation terms, non-compete policy, ban appeals, and contact information for TJB Management agency clients.</span>
            <span className="card-link">VIEW POLICY →</span>
          </a>

          <a href="/legal/policies/and/procedures/hallie/tiktok/moderation/system" className="card section">
            <span className="card-icon">🛡️</span>
            <span className="card-title">Hallie Platform — Data Security & Privacy Policy</span>
            <span className="card-desc">Full data security, privacy, and compliance documentation for the Hallie TikTok Account Automation Platform, including USDS and DSPR requirements.</span>
            <span className="card-link">VIEW POLICY →</span>
          </a>

          <a href="/legal/policies/and/procedures/communication/policy" className="card section">
            <span className="card-icon">💬</span>
            <span className="card-title">Communication Policy</span>
            <span className="card-desc">The professional conduct standard for every business communication made on behalf of TJB Management Inc. — channels, response times, confidentiality, and enforcement.</span>
            <span className="card-link">VIEW POLICY →</span>
          </a>

          <a href="/legal/privacy/policy" className="card section">
            <span className="card-icon">🔒</span>
            <span className="card-title">Privacy Policy</span>
            <span className="card-desc">How tjbmanagementinc.com handles data — cookies in use, what creator data managers can see, third-party links, and the full Hallie Platform Data Security & Privacy Policy.</span>
            <span className="card-link">VIEW PRIVACY POLICY →</span>
          </a>
        </div>

        <footer>
          <p>Last Updated: October 13, 2026</p>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </footer>
      </main>
    </>
  );
}
