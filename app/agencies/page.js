'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function AgenciesHub() {
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
          <h1>Agencies</h1>
          <p className="subtitle">TJB Management Inc. · Creator Agencies</p>
          <span className="badge">⚡ Free to Join</span>
        </div>

        <div className="grid">
          <a href="/agencies/tiktok" className="card section">
            <span className="card-icon">🎵</span>
            <span className="card-title">TikTok Agency</span>
            <span className="card-desc">TJB Management's TikTok LIVE creator agency — guidelines, streaming resources, merch, and how to join.</span>
            <span className="card-link">VIEW TIKTOK AGENCY →</span>
          </a>

          <a href="/agencies/c2" className="card section">
            <span className="card-icon">😄</span>
            <span className="card-title">C2</span>
            <span className="card-desc">TJB Management's creator network on C2 Live — join through Tyler and get the app.</span>
            <span className="card-link">VIEW C2 →</span>
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
