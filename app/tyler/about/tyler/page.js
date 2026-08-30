'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function Tyler() {
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
        <a href="/tiktok/agency" onClick={() => setMenuOpen(false)}>TikTok Agency</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/tyler" className="back-link">← Back to Tyler</a>

        <h1>Tyler @ TJB Mgmt</h1>

        <div className="section">
          <h2>Straight to the point.</h2>
          <p>
            Creator manager. Agency founder. Five years in the TikTok LIVE ecosystem.
          </p>
        </div>

        <div className="section">
          <h2>Experience</h2>
          <p>
            I've spent <strong>5 years managing creators</strong> across multiple TikTok agencies, working directly through TikTok's official agency management platform. I know the platform inside and out — from growth strategy and monetization to handling bans, violations, and creator protection at the agency level.
          </p>
          <p>
            I run my own agency, <strong><a href="/tiktok/agency">TJB Management Inc.</a></strong>, built to give creators the real, personalized support that most agencies never deliver.
          </p>
        </div>

        <div className="section">
          <h2>What I Handle</h2>
          <p>
            Strategy, monetization, ban appeals, LIVE optimization, community growth, and creator protection — all with the help of <strong><a href="/hallie">Hallie, my AI assistant</a></strong>. I keep things direct, drama-free, and focused on results.
          </p>
        </div>

        <a href="/tyler/about/tyler" className="cta-btn">Connect with Tyler →</a>

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
