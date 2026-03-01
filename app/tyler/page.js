'use client';

import { useState, useEffect } from 'react';

export default function Tyler() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        html {
          background: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('/bg-tyler.jpg?t=v2') center/cover fixed !important;
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
        }
        h1 {
          color: #fff;
          margin-bottom: 30px;
          font-size: 32px;
          animation: glowPulse 3s ease-in-out infinite;
        }
        h2 {
          color: #a855f7;
          margin-top: 40px;
          margin-bottom: 15px;
          font-size: 20px;
          animation: glowPulse 3s ease-in-out infinite;
        }
        h2:nth-of-type(2) { color: #ec4899; }
        h2:nth-of-type(3) { color: #3b82f6; }
        p {
          color: #a0aec0;
          margin-bottom: 15px;
        }
        li {
          color: #a0aec0;
          margin-bottom: 8px;
        }
        strong { 
          font-weight: 700;
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        strong a {
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
        }
        strong a:hover {
          text-decoration: underline;
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
        .section {
          padding: 20px;
          border-left: 4px solid #a855f7;
          margin-bottom: 30px;
          border-radius: 5px;
          background: rgba(168, 85, 247, 0.05);
          transition: all 0.6s ease;
          opacity: 0;
          transform: translateY(20px);
        }
        .section.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .section:nth-of-type(2) { border-left-color: #ec4899; background: rgba(236, 72, 153, 0.05); }
        .section:nth-of-type(3) { border-left-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 14px;
          color: #8b9dc3;
          text-align: center;
        }
        a {
          color: #a855f7;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
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
      `}</style>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Meet Hallie</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Meet Tyler</a>
        <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>
        
        <h1>Meet Tyler</h1>
        
        <div className="section">
          <h2>Who I Am</h2>
          <p>
            I'm <strong>Tyler J. Beasley</strong>. Straight to the point. I build things, manage communities, and keep everything real.
          </p>
        </div>

        <div className="section">
          <h2>What I Do</h2>
          <p>
            I run <strong>TJB Management Inc.</strong> and manage everything from business operations to community standards. I work with <strong><a href="/hallie">Hallie, Tyler's AI assistant</a></strong> to ensure everything stays authentic, professional, and drama-free.
          </p>
        </div>

        <div className="section">
          <h2>The Bottom Line</h2>
          <p>
            No BS. Just real work, real standards, and real accountability. I believe in building communities where people respect each other and themselves.
          </p>
        </div>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
