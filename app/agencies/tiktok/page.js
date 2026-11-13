'use client';

import './page.css';

import { useState, useEffect } from 'react';
import { TIKTOK_AGENCY_APPLY_URL } from '@/lib/agency-apply';

export default function AgencyHub() {
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
        <div className="header section">
          <h1>One Creator Network</h1>
          <p className="subtitle">One team · One family · TikTok LIVE</p>
          <span className="badge">⚡ Free to Join</span>
        </div>

        <div className="grid">
          <a href={TIKTOK_AGENCY_APPLY_URL} target="_blank" rel="noopener noreferrer" className="card section">
            <span className="card-icon">✅</span>
            <span className="card-title">Apply to Join One Creator Network</span>
            <span className="card-desc">The application for One Creator Network. Free to join.</span>
            <span className="card-link">APPLY ON TIKTOK →</span>
          </a>
          <a href="/agencies/tiktok/about" className="card section">
            <span className="card-icon">🏢</span>
            <span className="card-title">About One Creator Network</span>
            <span className="card-desc">Who we are, what One Creator Network offers creators, and how to join — free.</span>
            <span className="card-link">VIEW ABOUT →</span>
          </a>

          <a href="/agencies/tiktok/streaming/basics" className="card section">
            <span className="card-icon">📺</span>
            <span className="card-title">Streaming Basics & FAQs</span>
            <span className="card-desc">Going LIVE, gifts and diamonds, Super Fan and Fan Club, Co-Host and Match, visual setup, stream tips, and frequently asked questions.</span>
            <span className="card-link">VIEW GUIDE →</span>
          </a>

          <a href="/agencies/tiktok/tiktok/community/guidelines" className="card section">
            <span className="card-icon">📜</span>
            <span className="card-title">TikTok Community Guidelines</span>
            <span className="card-desc">The 6 main Community Guidelines policies, what's not allowed on LIVE, and gift-baiting rules — with best practices and quick self-checks.</span>
            <span className="card-link">VIEW GUIDELINES →</span>
          </a>

          <a href="/legal/policies/and/procedures/tiktok/agency" className="card section">
            <span className="card-icon">📋</span>
            <span className="card-title">One Creator Network Guidelines</span>
            <span className="card-desc">Creator eligibility, representation terms, non-compete policy, ban appeals, and legal terms for creators.</span>
            <span className="card-link">VIEW GUIDELINES →</span>
          </a>

          <a href="/agencies/tiktok/merch" className="card section">
            <span className="card-icon">👕</span>
            <span className="card-title">Merch</span>
            <span className="card-desc">TJB Management merchandise.</span>
            <span className="card-link">SHOP MERCH →</span>
          </a>

          <a href="/agencies/tiktok/connect" className="card section">
            <span className="card-icon">🤝</span>
            <span className="card-title">Connect with One Creator Network</span>
            <span className="card-desc">Reach One Creator Network on TikTok, Instagram, Discord, or email — and apply to join.</span>
            <span className="card-link">CONNECT →</span>
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
