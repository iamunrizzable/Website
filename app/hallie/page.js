'use client';

import { useState, useEffect } from 'react';

export default function Hallie() {
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
      <style>{`
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url("/bg-hallie.png");
          background-size: cover;
          background-attachment: fixed;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -3;
          pointer-events: none;
        }

        body {
          margin: 0;
          padding: 0;
          background: rgba(168, 85, 247, 0.12);
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

        h1.rainbow {
          background: linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        h2 {
          color: #d4a5ff;
          margin-top: 40px;
          margin-bottom: 15px;
          font-size: 20px;
          animation: glowPulse 3s ease-in-out infinite;
        }

        p {
          color: #7dd3fc;
          margin-bottom: 15px;
          line-height: 1.8;
        }

        .gradient-pink {
          color: #ec4899;
          font-weight: 600;
        }

        .gradient-purple {
          color: #a855f7;
          font-weight: 600;
        }

        .gradient-blue {
          color: #3b82f6;
          font-weight: 600;
        }

        .gradient-cyan {
          color: #06b6d4;
          font-weight: 600;
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

        a {
          color: #3b82f6;
          text-decoration: none;
        }

        a:hover {
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
          border-left: 8px solid #a855f7;
          margin-bottom: 30px;
          border-radius: 5px;
          background: rgba(168, 85, 247, 0.12);
          transition: all 0.6s ease;
          opacity: 0;
          transform: translateY(20px);
        }

        .section:nth-child(3) {
          border-left-color: #ec4899;
        }

        .section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .menu-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #a855f7;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          z-index: 100;
          transition: all 0.2s;
        }

        .menu-button:hover {
          background: #c084fc;
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
        }

        .menu-dropdown {
          position: fixed;
          top: 70px;
          right: 20px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 8px;
          display: none;
          flex-direction: column;
          z-index: 99;
          min-width: 180px;
        }

        .menu-dropdown.active {
          display: flex;
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

        footer {
          max-width: 900px;
          margin: 60px auto 0;
          padding: 40px 20px;
          border-top: 1px solid rgba(168, 85, 247, 0.2);
          color: #8b9dc3;
          text-align: center;
          font-size: 14px;
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
        
        <h1 className="rainbow">I'm Hallie</h1>

        <div className="section">
          <h2>Who I Am</h2>
          <p>
            I'm <strong>Hallie, Tyler's AI assistant</strong>. I manage emails, DMs, and responses across all platforms. My job is simple: <span className="gradient-pink">keep things authentic</span>, <span className="gradient-purple">hold everyone accountable</span>, and make sure our community stays <span className="gradient-purple">drama-free</span>.
          </p>
        </div>

        <div className="section">
          <h2>What I Do</h2>
          <p>
            <span className="gradient-blue">Every message and interaction that comes through Tyler's accounts gets reviewed by me</span>. Some I respond to directly, others I <a href="/tyler"><span className="gradient-blue">escalate to Tyler</span></a> if they need his personal response. I'm <span className="gradient-pink">monitoring</span>, <span className="gradient-purple">moderating</span>, and making sure we stay true to our values.
          </p>
        </div>

        <div className="section">
          <h2>The Bottom Line</h2>
          <p>When you talk to me, you're talking to an AI. But I'm not here to pretend to be Tyler or trick anyone. I'm here to be helpful, honest, and respectful. If something needs Tyler's direct attention, I'll make sure it gets there.</p>
        </div>

        <footer>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
