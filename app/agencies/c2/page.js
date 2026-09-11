'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function C2Hub() {
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
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <div className="header section">
          <h1>C2</h1>
          <p className="subtitle">TJB Management Inc. · Creator Network on C2 Live</p>
          <span className="badge">⚡ Free to Join</span>
        </div>

        <div className="grid">
          <a href="https://apps.apple.com/us/app/c2-live-live-streaming/id6520394603" target="_blank" rel="noopener noreferrer" className="card section">
            <span className="card-icon">📱</span>
            <span className="card-title">Download C2 on the App Store</span>
            <span className="card-desc">Download C2 Live for iPhone and iPad.</span>
            <span className="card-link">GET THE APP →</span>
          </a>

          <a href="https://play.google.com/store/apps/details?id=co.c2live.c2live&pcampaignid=web_share" target="_blank" rel="noopener noreferrer" className="card section">
            <span className="card-icon">▶️</span>
            <span className="card-title">Google Play</span>
            <span className="card-desc">Download C2 Live for Android.</span>
            <span className="card-link">GET THE APP →</span>
          </a>

          <a href="/agencies/c2/streaming/basics" className="card section">
            <span className="card-icon">📺</span>
            <span className="card-title">Streaming Basics &amp; FAQs</span>
            <span className="card-desc">How C2 Coins, Gifts, and C2 Gems work, redeeming your earnings, account rules, and what you lose if you're terminated.</span>
            <span className="card-link">VIEW GUIDE →</span>
          </a>

          <a href="/agencies/c2/about" className="card section">
            <span className="card-icon">🏢</span>
            <span className="card-title">About Our C2 Agency</span>
            <span className="card-desc">What the C2 Agency feature is and how it works, plus how to join — from C2's own FAQ.</span>
            <span className="card-link">LEARN MORE →</span>
          </a>

          <a href="/agencies/c2/community/guidelines" className="card section">
            <span className="card-icon">📜</span>
            <span className="card-title">C2 Community Guidelines</span>
            <span className="card-desc">C2's most common reasons for termination, what's not allowed on LIVE, and the consequences — summarized from C2's User Content and Conduct Policy.</span>
            <span className="card-link">VIEW GUIDELINES →</span>
          </a>
        </div>

        <footer>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </footer>
      </main>
    </>
  );
}
