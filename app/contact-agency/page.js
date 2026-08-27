'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function ContactAgency() {
  const [menuOpen, setMenuOpen] = useState(false);

  const contacts = [
{ name: 'Agency TikTok', href: 'https://www.tiktok.com/@tjbmanagementinc?_r=1&_t=ZP-96UttEUm6TW', icon: '🎵' },
    { name: 'Agency Instagram', href: 'https://www.instagram.com/tjbmanagementinc?igsh=MTNydjQ5cnF5cHBlOA==', icon: '📷' },
    { name: 'Discord Community', href: 'https://discord.gg/xznQZY7CeW', icon: '💬' },
    { name: 'Email', href: 'mailto:support@tjbmanagementinc.com', icon: '✉️' },
    { name: 'About the Agency', href: '/agency/about', icon: '🏢' },
  ];

  const internalLinks = ['Email', 'About the Agency'];

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
        <a href="/agency" onClick={() => setMenuOpen(false)}>Agency</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/agency" className="back-link">← Back to Agency</a>
        <h1>Connect with TJB Management</h1>

        <div className="contact-grid">
          {contacts.map((contact) => (
            <a
              key={contact.name}
              href={contact.href}
              target={!internalLinks.includes(contact.name) ? '_blank' : undefined}
              rel={!internalLinks.includes(contact.name) ? 'noopener noreferrer' : undefined}
              className="contact-card"
            >
              <span className="contact-icon">{contact.icon}</span>
              <span className="contact-name">{contact.name}</span>
            </a>
          ))}
        </div>

        <a href="https://www.tiktok.com/t/ZTkgQvTCb/" target="_blank" rel="noopener noreferrer" className="cta-btn">Apply to Join TJB Management →</a>

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
