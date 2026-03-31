'use client';

import { useState } from 'react';

export default function ContactHallie() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-hallie.png");
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
          color: #fff;
          border: 2px solid rgba(255,255,255,0.15);
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
          animation: fadeInCard 0.6s ease forwards;
        }
        @keyframes fadeInCard {
          to { opacity: 1; transform: translateY(0); }
        }
        .contact-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          background: linear-gradient(135deg, #2563eb, #60a5fa);
        }
        .contact-card:hover {
          transform: translateY(-12px) scale(1.02);
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 12px 24px rgba(0,0,0,0.5);
          filter: brightness(1.1);
        }
        .contact-icon {
          font-size: 64px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
          transition: all 0.3s ease;
        }
        .contact-card:hover .contact-icon {
          transform: scale(1.3) rotate(5deg);
        }
        .contact-name {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 1px 4px rgba(0,0,0,0.6);
        }
        .footer {
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 30px;
          font-size: 14px;
          color: #8b9dc3;
        }
        .menu-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #a855f7;
          color: #fff;
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
      `}</style>

      <div className="fade-top"></div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie</a>
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Contact Hallie</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Contact Tyler</a>
        <a href="/swave-social" onClick={() => setMenuOpen(false)}>Swave Social</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/hallie" className="back-link">← Back to Hallie</a>
        <h1>Contact Hallie</h1>

        <div className="contact-grid">
          <a href="mailto:hallie@tjbmanagementinc.com" className="contact-card">
            <span className="contact-icon">✉️</span>
            <span className="contact-name">Email Hallie</span>
          </a>
        </div>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
