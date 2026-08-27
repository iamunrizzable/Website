'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function TylerHub() {
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
        <a href="/agency" onClick={() => setMenuOpen(false)}>Agency</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <div className="header section">
          <h1>Tyler</h1>
          <p className="subtitle">Tyler @ TJB Mgmt · Creator Manager & Agency Founder</p>
        </div>

        <div className="grid">
          <a href="/tyler/about" className="card section">
            <span className="card-icon">👤</span>
            <span className="card-title">About Tyler</span>
            <span className="card-desc">Five years managing TikTok LIVE creators — his experience, what he handles, and how he works.</span>
            <span className="card-link">MEET TYLER →</span>
          </a>

          <a href="/contact-tyler" className="card section">
            <span className="card-icon">🔗</span>
            <span className="card-title">Connect with Tyler</span>
            <span className="card-desc">Phone, email, TikTok, Discord, Instagram, Snapchat, X, PlayStation, playlists, and more.</span>
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
