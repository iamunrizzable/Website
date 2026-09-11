'use client';

import './page.css';

import { useState, useEffect } from 'react';

// Newest first — new entries get added to the top of this array so older
// letters naturally sink toward the bottom of the page.
const NEWSLETTERS = [
  {
    date: 'September 10, 2026',
    title: 'Proposed TikTok Servers, Agency and Support Suspension',
    desc: 'Notice of a proposed suspension of our TikTok servers and TikTok agency, effective September 11, 2026 at 12 PM ET, if TikTok does not pay what it owes.',
    href: '/tiktok/notice',
  },
];

export default function News() {
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
        <div className="header section">
          <h1>Newsletters</h1>
          <p className="subtitle">TJB Management Inc. · Public Letters & Statements</p>
          <span className="badge">📰 Newsletter Archive</span>
        </div>

        <div className="list">
          {NEWSLETTERS.map(letter => (
            <a key={letter.href} href={letter.href} className="card section">
              <span className="card-date">{letter.date}</span>
              <span className="card-title">{letter.title}</span>
              <span className="card-desc">{letter.desc}</span>
              <span className="card-link">READ LETTER →</span>
            </a>
          ))}
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
