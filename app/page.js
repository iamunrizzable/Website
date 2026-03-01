'use client';

import { useState } from 'react';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <html>
      <head>
        <title>Tyler J. Beasley - TJB Management Inc.</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('/bg-home.png') center/cover fixed;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow-x: hidden;
          }
          main {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            background-color: #0f172a;
          }
          .bg-orbs {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
          }
          .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            animation: float 8s ease-in-out infinite;
          }
          .orb1 {
            width: 300px;
            height: 300px;
            background: rgba(168, 85, 247, 0.15);
            top: 20%;
            left: 10%;
          }
          .orb2 {
            width: 400px;
            height: 400px;
            background: rgba(59, 130, 246, 0.1);
            top: 40%;
            right: 5%;
            animation-delay: 1s;
          }
          .orb3 {
            width: 350px;
            height: 350px;
            background: rgba(236, 72, 153, 0.08);
            bottom: 10%;
            left: 30%;
            animation-delay: 2s;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
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
          }
          .menu-button:hover {
            background-color: #9333ea;
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
          .container {
            max-width: 900px;
            width: 100%;
            z-index: 10;
            text-align: center;
          }
          .logo-section {
            margin-bottom: 60px;
          }
          .logo-wrapper {
            position: relative;
            display: inline-block;
          }
          .logo-glow {
            position: absolute;
            inset: -15px;
            background: linear-gradient(135deg, #a855f7, #ec4899, #3b82f6);
            border-radius: 30px;
            filter: blur(20px);
            opacity: 0.4;
            z-index: -1;
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
            margin-bottom: 40px;
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
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 14px;
          }
          .footer p {
            background: linear-gradient(90deg, #06b6d4, #3b82f6, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 500;
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
      </head>
      <body>
        <div className="bg-orbs">
          <div className="orb orb1"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
        </div>

        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
        <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/hallie" onClick={() => setMenuOpen(false)}>Meet Hallie</a>
          <a href="/tyler" onClick={() => setMenuOpen(false)}>Meet Tyler</a>
          <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
        </div>

        <main>
          <div className="container">
            <div className="logo-section">
              <div className="logo-wrapper">
                <div className="logo-glow"></div>
                <img src="/logo-new.png" alt="Tyler J. Beasley" className="logo-img" />
              </div>
            </div>

            <div className="nav-buttons">
              <a href="/hallie" className="nav-button">Meet Hallie</a>
              <a href="/tyler" className="nav-button">Meet Tyler</a>
              <a href="/contact" className="nav-button">Contact</a>
              <a href="/legal" className="nav-button">Legal & Guidelines</a>
            </div>

            <div className="footer">
              <p>© 2026 TJB Management Inc.</p>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
