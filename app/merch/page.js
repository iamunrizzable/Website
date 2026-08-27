'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function Merch() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll('.merch-card'));
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

  const items = [
    {
      name: 'TJB INC SUPPORTER HOODIE',
      href: 'https://www.customink.com/designs/TJB%20INC%20supporter-%20NEW/eqs0-00d2-sdhk/share?pc=EMAIL-40778&utm_campaign=shared%20design&utm_source=share%20link&utm_medium=shared%20design&utm_content=shared%20mobile',
      icon: '🤝',
      desc: 'Official TJB Management Inc. Supporter hoodie.',
    },
    {
      name: 'TJB PROMOTER HOODIE',
      href: 'https://www.customink.com/designs/Tjb%20inc%20promoter/eqs0-00d2-hqh4/share?pc=EMAIL-40778&utm_campaign=shared%20design&utm_source=share%20link&utm_medium=shared%20design&utm_content=shared%20mobile',
      icon: '📣',
      desc: 'Official TJB Management Inc. Promoter hoodie.',
    },
    {
      name: 'TJB CREATOR HOODIE',
      href: 'https://www.customink.com/designs/Tjb%20creator%20hoodie/eqs0-00d2-hq5u/share?pc=EMAIL-40778&utm_campaign=shared%20design&utm_source=share%20link&utm_medium=shared%20design&utm_content=shared%20mobile',
      icon: '👕',
      desc: 'Official TJB Management creator hoodie.',
    },
    {
      name: 'TJB CREATOR MANAGER HOODIE',
      href: 'https://www.customink.com/designs/Creator%20manager/eqs0-00d2-hqgb/share?pc=EMAIL-40778&utm_campaign=shared%20design&utm_source=share%20link&utm_medium=shared%20design&utm_content=shared%20mobile',
      icon: '🎯',
      desc: 'Official TJB Management Inc. Creator Manager hoodie.',
    },
    {
      name: 'TJB LEGAL HOODIE',
      href: 'https://www.customink.com/designs/TJB%20INC%20LEGAL/eqs0-00d2-hqd8/share?pc=EMAIL-40778&utm_campaign=shared%20design&utm_source=share%20link&utm_medium=shared%20design&utm_content=shared%20mobile',
      icon: '⚖️',
      desc: 'Official TJB Management Inc. Legal hoodie.',
    },
    {
      name: 'TJB CEO HOODIE',
      href: 'https://www.customink.com/designs/TJB%20INC%20CEO-%20NEW/eqs0-00d2-sdh9/share?pc=EMAIL-40778&utm_campaign=shared%20design&utm_source=share%20link&utm_medium=shared%20design&utm_content=shared%20mobile',
      icon: '🧥',
      desc: 'Official TJB Management Inc. CEO hoodie.',
    },
  ];

  return (
    <>

      <div className="fade-top"></div>

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
        <a href="/" className="back-link">← Back to Home</a>
        <h1>TJB Merch</h1>
        <p className="subtitle">Official TJB Management Inc. merchandise. Orders fulfilled through CustomInk.</p>

        <div className="merch-grid">
          {items.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="merch-card"
            >
              <span className="merch-icon">{item.icon}</span>
              <span className="merch-name">{item.name}</span>
            </a>
          ))}
        </div>

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
