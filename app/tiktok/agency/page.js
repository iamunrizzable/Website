'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function AgencyHub() {
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
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/tiktok/agency" onClick={() => setMenuOpen(false)}>TikTok Agency</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <div className="header section">
          <h1>TikTok Agency</h1>
          <p className="subtitle">TJB Management Inc. · Agency, Guidelines, Streaming Resources & TikTok Tools</p>
        </div>

        <div className="grid">
          <a href="/tiktok/agency/about" className="card section">
            <span className="card-icon">🏢</span>
            <span className="card-title">About the TikTok Agency</span>
            <span className="card-desc">Who TJB Management is, what we offer creators, and how to join — free, with real support from Tyler and Hallie.</span>
            <span className="card-link">VIEW TIKTOK AGENCY →</span>
          </a>

          <a href="/tiktok/agency/streaming-basics" className="card section">
            <span className="card-icon">📺</span>
            <span className="card-title">Streaming Basics & FAQs</span>
            <span className="card-desc">Going LIVE, gifts and diamonds, Super Fan and Fan Club, Co-Host and Match, visual setup, stream tips, and frequently asked questions.</span>
            <span className="card-link">VIEW GUIDE →</span>
          </a>

          <a href="/tiktok/agency/community-guidelines" className="card section">
            <span className="card-icon">📜</span>
            <span className="card-title">TikTok Community Guidelines</span>
            <span className="card-desc">The 6 main Community Guidelines policies, what's not allowed on LIVE, and gift-baiting rules — with best practices and quick self-checks.</span>
            <span className="card-link">VIEW GUIDELINES →</span>
          </a>

          <a href="/legal/tiktok/agency/guidelines" className="card section">
            <span className="card-icon">📋</span>
            <span className="card-title">TikTok Agency Guidelines</span>
            <span className="card-desc">Creator eligibility, representation terms, non-compete policy, ban appeals, and legal terms for TJB Management agency clients.</span>
            <span className="card-link">VIEW GUIDELINES →</span>
          </a>

          <a href="/tiktok/agency/merch" className="card section">
            <span className="card-icon">👕</span>
            <span className="card-title">Merch</span>
            <span className="card-desc">Official TJB Management merchandise.</span>
            <span className="card-link">SHOP MERCH →</span>
          </a>

          <a href="/tiktok/agency/connect" className="card section">
            <span className="card-icon">🤝</span>
            <span className="card-title">Connect with TikTok Agency</span>
            <span className="card-desc">Reach TJB Management on TikTok, Instagram, Discord, or email — and apply to join.</span>
            <span className="card-link">CONNECT →</span>
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
