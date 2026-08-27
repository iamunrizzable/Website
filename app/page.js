'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function Home() {
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
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal Hub</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <div className="logo-section section">
          <img src="/bg-main.jpeg" alt="TJB Management" className="logo-img" />
          <p className="tagline">TikTok LIVE creator agency & resource hub</p>
        </div>

        <div className="nav-buttons section">
          <a href="/tyler" className="nav-button"><span>Tyler Hub</span></a>
          <a href="/hallie" className="nav-button"><span>Hallie Hub</span></a>
          <a href="/agency" className="nav-button"><span>Agency Hub</span></a>
          <a href="/legal" className="nav-button"><span>Legal Hub</span></a>
        </div>

        <div className="footer section">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, and website are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>TikTok and the TikTok logo are trademarks of TikTok US Data Security Joint Venture LLC. All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
