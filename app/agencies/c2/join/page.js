'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function C2Join() {
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
        <a href="/agencies/c2" className="back-link">← Back to C2</a>

        <h1>Joining TJB Management&apos;s C2 Agency</h1>

        <div className="section">
          <p><strong>Does it cost anything to join?</strong></p>
          <p>No, streamers do not pay any fee to join an agency.</p>

          <p><strong>Can you be in more than one agency?</strong></p>
          <p>No, you can only join one agency at a time.</p>

          <p><strong>Can you leave the agency?</strong></p>
          <p>Yes, you can leave an agency at any time.</p>

          <p><strong>Are there contests for agency members?</strong></p>
          <p>Yes, there will be contests exclusive to agencies and their members on a regular basis.</p>
        </div>

        <a href="/agencies/c2/about" className="cta-btn">About Our C2 Agency →</a>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
