'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function ContactHallie() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll('.contact-card'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const idx = cards.indexOf(entry.target);
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${idx * 0.05}s`;
          entry.target.classList.add('visible');
        } else {
          entry.target.style.transitionDelay = '0s';
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <>

      <div className="fade-top"></div>

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
        <a href="/hallie" className="back-link">← Back to Hallie</a>
        <h1>Connect with Hallie™</h1>

        <div className="contact-grid">
          <a href="mailto:hallie@tjbmanagementinc.com" className="contact-card">
            <span className="contact-icon">✉️</span>
            <span className="contact-name">Email Hallie</span>
          </a>
        </div>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, and website are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>TikTok and the TikTok logo are trademarks of TikTok US Data Security Joint Venture LLC. All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
