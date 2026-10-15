'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function ExternalContracts() {
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
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/system/status" onClick={() => setMenuOpen(false)}>System Status</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/legal" className="back-link">← Back to Legal</a>

        <div className="header section">
          <h1>External Contracts</h1>
          <p className="subtitle">TJB Management Inc. · The underlying contracts governing our agency relationships</p>
          <span className="badge">📑 Contract Library</span>
        </div>

        <div className="grid">
          <a href="/legal/contracts/tiktok-agency-contract.pdf" className="card section" target="_blank" rel="noopener noreferrer">
            <span className="card-icon">🏢</span>
            <span className="card-title">TikTok Agency Contract</span>
            <span className="card-desc">The TikTok Agency contract governing TJB Management Inc.'s participation in TikTok's agency program.</span>
            <span className="card-link">VIEW CONTRACT →</span>
          </a>

          <a href="/legal/external/contracts/c2/agency/contract" className="card section">
            <span className="card-icon">📋</span>
            <span className="card-title">C2 Agency Agreement</span>
            <span className="card-desc">The full text of C2 Capital Group Inc.'s own C2 Live Streamer Agency Agreement — registration, commission structure, obligations, and termination.</span>
            <span className="card-link">VIEW AGREEMENT →</span>
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
