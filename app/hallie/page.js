'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function HallieHub() {
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
          <h1>Hallie™</h1>
          <p className="subtitle">Hallie™ · TJB Management's AI Assistant</p>
        </div>

        <div className="grid">
          <a href="/hallie/about/hallie" className="card section">
            <span className="card-icon">🤖</span>
            <span className="card-title">About Hallie™</span>
            <span className="card-desc">Tyler's AI assistant — managing emails, DMs, and responses across all platforms.</span>
            <span className="card-link">MEET HALLIE →</span>
          </a>

          <a href="/hallie/contact/hallie" className="card section">
            <span className="card-icon">✉️</span>
            <span className="card-title">Connect with Hallie</span>
            <span className="card-desc">Email Hallie directly.</span>
            <span className="card-link">CONNECT →</span>
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
