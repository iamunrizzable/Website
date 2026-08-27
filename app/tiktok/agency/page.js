'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function TikTokHub() {
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
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
        <a href="/contact-agency" onClick={() => setMenuOpen(false)}>Connect with Agency</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Connect with Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Connect with Hallie</a>
        <a href="/hallie/tiktok-moderation/system" onClick={() => setMenuOpen(false)}>Hallie™ TikTok Moderation System</a>
        <a href="/merch" onClick={() => setMenuOpen(false)}>Merch</a>
        <a href="/tiktok/agency" onClick={() => setMenuOpen(false)}>TikTok Hub</a>
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/tiktok-guidelines" onClick={() => setMenuOpen(false)}>TikTok Guidelines</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <div className="header section">
          <h1>TikTok Hub</h1>
          <p className="subtitle">TJB Management Inc. · Agency, Guidelines, Streaming Resources & TikTok Tools</p>
        </div>

        <div className="grid">
          <a href="/agency" className="card section">
            <span className="card-icon">🏢</span>
            <span className="card-title">Agency</span>
            <span className="card-desc">Who TJB Management is, what we offer creators, and how to join — free, with real support from Tyler and Hallie.</span>
            <span className="card-link">VIEW AGENCY →</span>
          </a>

          <a href="/legal/agency" className="card section">
            <span className="card-icon">📋</span>
            <span className="card-title">Agency Guidelines</span>
            <span className="card-desc">Creator eligibility, representation terms, non-compete policy, ban appeals, and legal terms for TJB Management agency clients.</span>
            <span className="card-link">VIEW GUIDELINES →</span>
          </a>

          <a href="/streaming-basics" className="card section">
            <span className="card-icon">📺</span>
            <span className="card-title">Streaming Basics & FAQs</span>
            <span className="card-desc">Going LIVE, gifts and diamonds, Super Fan and Fan Club, Co-Host and Match, visual setup, stream tips, and frequently asked questions.</span>
            <span className="card-link">VIEW GUIDE →</span>
          </a>

          <a href="/tiktok-guidelines" className="card section">
            <span className="card-icon">📜</span>
            <span className="card-title">TikTok Community Guidelines</span>
            <span className="card-desc">The 6 main Community Guidelines policies, what's not allowed on LIVE, and gift-baiting rules — with best practices and quick self-checks.</span>
            <span className="card-link">VIEW GUIDELINES →</span>
          </a>

          <a href="/hallie/tiktok-moderation/system" className="card section">
            <span className="card-icon">🛡️</span>
            <span className="card-title">Hallie™ TikTok Moderation System</span>
            <span className="card-desc">Hallie's live comment moderation tool for your TikTok account — review, hide, and manage comments automatically.</span>
            <span className="card-link">OPEN SYSTEM →</span>
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
