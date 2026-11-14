'use client';

import './page.css';

import { useState, useEffect } from 'react';
import { TIKTOK_AGENCY_APPLY_URL } from '@/lib/agency-apply';

export default function ContactAgency() {
  const [menuOpen, setMenuOpen] = useState(false);

  const contacts = [
    { name: 'Apply to Join One Creator Network', href: TIKTOK_AGENCY_APPLY_URL, icon: '✅' },
    { name: 'Email One Creator Network', href: 'mailto:info@onecn.live', icon: '✉️' },
    { name: 'Check Out One Creator Network on TikTok', href: 'https://www.tiktok.com/@onecreatornetwork', icon: '🎵' },
    { name: 'Check Out One Creator Network Family Clips on TikTok', href: 'https://www.tiktok.com/@onecnclips', icon: '🎬' },
    { name: 'Check Out One Creator Network on Instagram', href: 'https://www.instagram.com/onecreatornetwork/', icon: '📷' },
    { name: 'Join the One Creator Network Discord', href: 'https://discord.gg/jvyUYSKhQb', icon: '💬' },
    { name: 'Visit onecn.live', href: 'https://onecn.live', icon: '🌐' },
  ];

  const internalLinks = ['Email One Creator Network'];

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
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/system/status" onClick={() => setMenuOpen(false)}>System Status</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/agencies/tiktok" className="back-link">← Back to One Creator Network</a>
        <h1>Connect with One Creator Network</h1>

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
