'use client';

import { useState, useEffect } from 'react';

export default function Contact() {
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

  const contacts = [
    { name: 'Email', href: 'mailto:tyler@tjbmanagementinc.com', icon: '✉️' },
    { name: 'X', href: 'https://x.com/iamunrizzable', icon: '𝕏' },
    { name: 'Discord', href: 'https://discord.gg/qFk5phHZss', icon: '💬' },
    { name: 'Snapchat', href: 'https://snapchat.com/add/iamunrizzabl3', icon: '👻' },
    { name: 'Instagram', href: 'https://instagram.com/iamunrizzable', icon: '📷' },
    { name: 'TikTok', href: 'https://tiktok.com/@iamunrizzable', icon: '🎵' },
    { name: 'Phone', href: 'tel:+14086696123', icon: '📱' },
    { name: 'TikTok Cheaper Coins Recharge', href: 'https://www.tiktok.com/coin/', icon: '🪙', iconSrc: null },
    { name: 'Swave Social', href: '/swave-social', icon: null, iconSrc: '/swave-logo.svg' },
  ];

  return (
    <>
      <style>{`
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-tyler.png") center/cover no-repeat;
          z-index: -2;
          pointer-events: none;
        }
        body {
          position: relative;
        }
        
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-tyler.png");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -3;
          pointer-events: none;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: transparent;
        }
        @keyframes glowPulse {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.3);
          }
          50% { 
            text-shadow: 0 0 40px rgba(168, 85, 247, 1), 0 0 60px rgba(236, 72, 153, 0.8), 0 0 80px rgba(59, 130, 246, 0.5), 0 0 100px rgba(168, 85, 247, 0.4);
          }
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
          margin-bottom: 30px;
          font-size: 32px;
          animation: glowPulse 3s ease-in-out infinite;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 30px;
          color: #a855f7;
          text-decoration: none;
          font-weight: 500;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .contact-card {
          position: relative;
          padding: 30px 20px;
          border-radius: 15px;
          text-decoration: none;
          color: #d4a5ff;
          border: 2px solid rgba(255,255,255,0.15);
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 10px;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInCard 0.6s ease forwards;
        }
        @keyframes fadeInCard {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .contact-card:nth-child(1) { animation-delay: 0.1s; }
        .contact-card:nth-child(2) { animation-delay: 0.2s; }
        .contact-card:nth-child(3) { animation-delay: 0.3s; }
        .contact-card:nth-child(4) { animation-delay: 0.4s; }
        .contact-card:nth-child(5) { animation-delay: 0.5s; }
        .contact-card:nth-child(6) { animation-delay: 0.6s; }
        .contact-card:nth-child(7) { animation-delay: 0.7s; }
        .contact-card:nth-child(8) { animation-delay: 0.8s; }
        .contact-card:nth-child(9) { animation-delay: 0.9s; }
        .contact-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
        }
        .contact-card.email::before { background: linear-gradient(135deg, #2563eb, #60a5fa); }
        .contact-card.x::before { background: linear-gradient(135deg, #3b82f6, #1e40af); }
        .contact-card.discord::before { background: linear-gradient(135deg, #5865f2, #4752c4); }
        .contact-card.snapchat::before { background: linear-gradient(135deg, #fcd34d, #fef3c7); }
        .contact-card.instagram::before { background: linear-gradient(135deg, #ec4899, #fb7185); }
        .contact-card.tiktok::before { background: linear-gradient(135deg, #000, #4b5563); }
        .contact-card.phone::before { background: linear-gradient(135deg, #10b981, #059669); }
        .contact-card.apply-to-join-swave-social::before { background: linear-gradient(135deg, #0ea5e9, #6366f1); }
        .contact-card.tiktok-cheaper-coins-recharge::before { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .contact-card:hover {
          transform: translateY(-12px) scale(1.02);
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 12px 24px rgba(0,0,0,0.5), 0 0 40px currentColor;
          filter: brightness(1.1);
        }
        .contact-icon {
          font-size: 64px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
          transition: all 0.3s ease;
        }
        .contact-card:hover .contact-icon {
          transform: scale(1.3) rotate(5deg);
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6));
        }
        .contact-icon-img {
          width: 64px;
          height: 64px;
          object-fit: contain;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        .contact-card:hover .contact-icon-img {
          transform: scale(1.3) rotate(5deg);
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6));
        }
        .contact-name {
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
          color: #8b9dc3;
        }
        .footer-text {
          margin-bottom: 10px;
          color: #a0aec0;
        }
        .hallie-link {
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: bold;
          text-decoration: none;
          cursor: pointer;
        }
        .hallie-link:hover {
          text-decoration: underline;
        }
        .footer-disclaimer {
          font-size: 12px;
          margin-top: 15px;
          color: #a0aec0;
        }
        .footer-disclaimer a {
          color: #a855f7;
          text-decoration: none;
        }
        .footer-disclaimer a:hover {
          text-decoration: underline;
        }
        .menu-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #a855f7;
          color: #d4a5ff;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          z-index: 100;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        .menu-button:hover {
          background-color: #9333ea;
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
        }
        .menu-dropdown {
          display: none;
          position: fixed;
          top: 60px;
          right: 20px;
          background-color: #0f172a;
          border: 2px solid #a855f7;
          border-radius: 5px;
          padding: 10px 0;
          min-width: 200px;
          z-index: 101;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        .menu-dropdown.active {
          display: block;
        }
        .menu-dropdown a {
          display: block;
          padding: 10px 20px;
          color: #a855f7;
          text-decoration: none;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
          transition: background-color 0.2s;
        }
        .menu-dropdown a:last-child {
          border-bottom: none;
        }
        .menu-dropdown a:hover {
          background-color: rgba(168, 85, 247, 0.1);
        }
        .fade-top {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 200px;
          background: linear-gradient(to bottom, rgba(15, 23, 42, 0.95), transparent);
          z-index: 50;
          pointer-events: none;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
          pointer-events: none;
        }
        .watermark-glow {
          position: absolute;
          inset: -40px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
          animation: glowPulse 4s ease-in-out infinite;
        }
        .watermark-img {
          position: relative;
          z-index: 1;
          max-width: 700px;
          width: 80vw;
          height: auto;
          filter: drop-shadow(0 0 30px rgba(168, 85, 247, 0.4));
          opacity: 0.15;
        }
      `}</style>

      <div className="fade-top"></div>

      <div className="watermark">
        <div className="watermark-glow"></div>
        <img src="/logo-new.png" alt="Tyler J. Beasley" className="watermark-img" />
      </div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie</a>
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Contact Hallie</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Contact Tyler</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
        <a href="/swave-social" onClick={() => setMenuOpen(false)}>Swave Social</a>      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>
        <h1>Contact Tyler</h1>

        <div className="contact-grid">
          {contacts.map((contact) => (
            <a
              key={contact.name}
              href={contact.href}
              target={contact.name !== 'Email' && contact.name !== 'Phone' && contact.name !== 'Apply to Join Swave Social' && contact.name !== 'Swave Social' ? '_blank' : undefined}
              rel={contact.name !== 'Email' && contact.name !== 'Phone' && contact.name !== 'Apply to Join Swave Social' && contact.name !== 'Swave Social' ? 'noopener noreferrer' : undefined}
              className={`contact-card ${contact.name.toLowerCase()}`}
            >
              {contact.iconSrc
                ? <img src={contact.iconSrc} alt={contact.name} className="contact-icon-img" />
                : <span className="contact-icon">{contact.icon}</span>
              }
              <span className="contact-name">{contact.name}</span>
            </a>
          ))}
        </div>

        <div className="footer">
          <p className="footer-text">Responses to Tyler's social media DMs and emails are automated by <a href="/hallie" className="hallie-link">Hallie, Tyler's AI assistant</a> and are not reviewed unless escalated by Hallie.</p>
          <p className="footer-disclaimer">This site uses Vercel Analytics. For more, see our <a href="/legal">legal guidelines</a>.</p>
          <p>© 2026 Tyler J. Beasley. All rights reserved. Hallie and the TJB Management Inc. website are the sole proprietary property of TJB Management Inc. and may not be reproduced or copied without prior written consent.</p>
          <p>Tyler J. Beasley is a Creator Manager at Swave Social Talent, a company affiliated with TikTok LIVE.</p>
        </div>
      </main>
    </>
  );
}
