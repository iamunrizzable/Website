'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function C2About() {
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
        <a href="/agencies/c2" className="back-link">← Back to C2</a>

        <h1>About Our C2 Agency</h1>
        <p className="subtitle">What the C2 Agency feature is and how it works — from C2 Capital Group Inc.&apos;s own FAQ.</p>

        <div className="section">
          <p><strong>What is the C2 Agency feature?</strong></p>
          <p>The C2 Agency feature allows experienced streamers to build and manage their own network of streamers. Agency owners earn a commission based on the total earnings of the streamers in their agency.</p>

          <p><strong>Can you leave an agency?</strong></p>
          <p>Yes, you can leave an agency at any time. However, any commission already earned by the agency is non-refundable and irreversible.</p>

          <p><strong>Can you join more than one agency?</strong></p>
          <p>No, you can only join one agency at a time.</p>

          <p><strong>Do streamers pay a fee to join an agency?</strong></p>
          <p>No, streamers do not pay any fee to join an agency.</p>

          <p><strong>Can your agency monitor your performance?</strong></p>
          <p>Yes, Agency owners have access to a &quot;My Agency&quot; report found in settings.</p>
          <p>This report provides insights into agency&apos;s earnings, active members, and overall performance.</p>

          <p><strong>Are there going to be contests for C2 Agencies?</strong></p>
          <p>Yes there will be contests exclusive to agencies and their members on a regular basis.</p>
        </div>

        <a href="https://c2live.co/agency/iamunrizzable" target="_blank" rel="noopener noreferrer" className="cta-btn">Join TJB Management on C2 →</a>

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
