'use client';

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
      href: 'https://www.customink.com/designs/Tjb%20inc%20supporter/eqs0-00d2-jmrq/share?pc=EMAIL-40778&utm_campaign=shared%20design&utm_source=share%20link&utm_medium=shared%20design&utm_content=shared%20mobile',
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
      <style>{`
        body::before {
          content: "";
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-main.jpeg");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -3;
          pointer-events: none;
        }
        body { margin: 0; padding: 0; background: transparent; }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.3); }
          50% { text-shadow: 0 0 40px rgba(168,85,247,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(59,130,246,0.5); }
        }
        @keyframes fadeInCard {
          to { opacity: 1; transform: translateY(0); }
        }
        main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          position: relative;
          z-index: 10;
        }
        h1 {
          color: #d4a5ff;
          margin-bottom: 10px;
          font-size: 32px;
          animation: glowPulse 3s ease-in-out infinite;
        }
        .subtitle {
          color: #a0aec0;
          font-size: 15px;
          margin-bottom: 40px;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 30px;
          color: #a855f7;
          text-decoration: none;
          font-weight: 500;
        }
        .back-link:hover { text-decoration: underline; }
        .merch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .merch-card {
          position: relative;
          padding: 30px 20px;
          border-radius: 15px;
          text-decoration: none;
          color: #d4a5ff;
          background: rgba(15, 23, 42, 0.55);
          border: 2px solid rgba(168, 85, 247, 0.25);
          overflow: hidden;
          transition: all 0.3s ease;
          height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 10px;
          opacity: 0;
          transform: translateY(20px);
        }
        .merch-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .merch-card:hover {
          transform: translateY(-12px) scale(1.02);
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 12px 24px rgba(0,0,0,0.5), 0 0 40px currentColor;
          filter: brightness(1.1);
        }
        .merch-icon {
          font-size: 64px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
          transition: all 0.3s ease;
        }
        .merch-card:hover .merch-icon { transform: scale(1.3) rotate(5deg); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6)); }
        .merch-name {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .footer {
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 30px;
          font-size: 14px;
        }
        .footer p {
          margin-bottom: 1.5em;
          margin-top: 0;
          line-height: 1.6;
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .menu-button {
          position: fixed; top: 20px; right: 20px;
          background-color: #a855f7; color: #d4a5ff;
          border: none; padding: 10px 15px; border-radius: 5px;
          cursor: pointer; font-weight: bold; z-index: 100; font-size: 16px;
          transition: all 0.3s ease;
        }
        .menu-button:hover { background-color: #9333ea; transform: scale(1.05); box-shadow: 0 0 20px rgba(168,85,247,0.6); }
        .menu-dropdown {
          display: none; position: fixed; top: 60px; right: 20px;
          background-color: #0f172a; border: 2px solid #a855f7;
          border-radius: 5px; padding: 10px 0; min-width: 200px;
          z-index: 101; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        .menu-dropdown.active { display: block; }
        .menu-dropdown a { display: block; padding: 10px 20px; color: #a855f7; text-decoration: none; border-bottom: 1px solid rgba(168,85,247,0.2); transition: background-color 0.2s; }
        .menu-dropdown a:last-child { border-bottom: none; }
        .menu-dropdown a:hover { background-color: rgba(168,85,247,0.1); }
        .fade-top { position: fixed; top: 0; left: 0; width: 100%; height: 200px; background: linear-gradient(to bottom, rgba(15,23,42,0.95), transparent); z-index: 50; pointer-events: none; }
      `}</style>

      <div className="fade-top"></div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie</a>
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Connect with Hallie</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Connect with Tyler</a>
        <a href="/contact-agency" onClick={() => setMenuOpen(false)}>Connect with Agency</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
        <a href="/merch" onClick={() => setMenuOpen(false)}>Merch</a>
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/tiktok-guidelines" onClick={() => setMenuOpen(false)}>TikTok Guidelines</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
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
