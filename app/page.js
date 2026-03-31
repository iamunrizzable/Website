'use client';

import { useState, useEffect } from 'react';

export default function Home() {
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
          background-image: linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url("/bg-tyler.png");
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

        main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          position: relative;
          z-index: 10;
        }

        .logo-section {
          margin-bottom: 60px;
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .logo-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .logo-img {
          width: 500px;
          max-width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.5));
        }

        .nav-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          width: 100%;
          margin-bottom: 60px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .nav-buttons.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .nav-button {
          padding: 20px 30px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          color: #fff;
          border: none;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
        }

        .nav-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(168, 85, 247, 0.4);
        }

        .footer {
          margin-top: 60px;
          padding-top: 30px;
          text-align: center;
          font-size: 14px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .footer.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .footer p {
          background: linear-gradient(90deg, #06b6d4, #3b82f6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 500;
        }

        .menu-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #a855f7;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          z-index: 100;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .menu-button:hover {
          background-color: #c084fc;
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
        }

        .menu-dropdown {
          display: none;
          position: fixed;
          top: 70px;
          right: 20px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 8px;
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

        @media (max-width: 640px) {
          .logo-img {
            width: 100%;
          }
          .nav-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Meet Hallie</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Meet Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Contact</a>
        <a href="/swave-social" onClick={() => setMenuOpen(false)}>Swave Social</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <div className="logo-section section">
          <img src="/logo-new.png" alt="Tyler J. Beasley" className="logo-img" />
        </div>

        <div className="nav-buttons section">
          <a href="/hallie" className="nav-button">Meet Hallie</a>
          <a href="/tyler" className="nav-button">Meet Tyler</a>
          <a href="/contact-tyler" className="nav-button">Contact Tyler</a>
          <a href="/legal" className="nav-button">Legal & Guidelines</a>
          <a href="/swave-social" className="nav-button">Swave Social</a>
        </div>

        <div className="footer section">
          <p>© 2026 TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
