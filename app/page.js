'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Fixed messages only: the page never prints text taken from the URL.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('notice') === 'redirect-blocked') {
      setNotice('We sent you home because the page you were being redirected to was not on this site, so it was blocked for your safety.');
    }
  }, []);

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

      {notice && (
        <div role="alert" style={{ position: 'relative', zIndex: 50, margin: '70px 16px 0', padding: '12px 16px', borderRadius: 12, border: '1px solid #a855f7', background: '#1a0b2e', color: '#c4b5fd', fontSize: 14, textAlign: 'center' }}>
          {notice}
        </div>
      )}

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
        <div className="logo-section section">
          <div className="logo-backdrop">
            <div className="logo-img-band">
              <img src="/logo-tjb.jpeg" alt="TJB Management" className="logo-img" />
            </div>
            <span className="badge">⚡ Straight to the point.</span>
          </div>
        </div>

        <div className="nav-buttons section">
          <a href="/tyler" className="nav-button"><span>Tyler</span></a>
          <a href="/hallie" className="nav-button"><span>Hallie</span></a>
          <a href="/news" className="nav-button"><span>Newsletters</span></a>
          <a href="/agencies" className="nav-button"><span>Creator Networks</span></a>
          <a href="/system/status" className="nav-button"><span>System Status</span></a>
          <a href="/legal" className="nav-button"><span>Legal</span></a>
        </div>

        <div className="footer section">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
