'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function C2Network() {
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
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/agencies" className="back-link">← Back to Creator Networks</a>

        <h1>C2 @ TJB Mgmt</h1>

        <div className="section">
          <h2>Straight to the point.</h2>
          <p>
            TJB Management Inc.&apos;s creator network on <strong>C2 Live</strong> — the live-streaming app.
          </p>
        </div>

        <div className="section">
          <h2>Get the App</h2>
          <p>
            Download C2 Live on the <strong><a href="https://apps.apple.com/us/app/c2-live-live-streaming/id6520394603" target="_blank" rel="noopener noreferrer">App Store</a></strong> or <strong><a href="https://play.google.com/store/apps/details?id=co.c2live.c2live&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">Google Play</a></strong>.
          </p>
        </div>

        <a href="https://c2live.co/agency/iamunrizzable" target="_blank" rel="noopener noreferrer" className="cta-btn">Join C2 →</a>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>C2 Live and the C2 logo are trademarks of their respective owner. All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
