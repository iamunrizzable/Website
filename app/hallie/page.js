'use client';

import { useState } from 'react';

export default function Hallie() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <html>
      <head>
        <title>Meet Hallie - Tyler's AI Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background-color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #ccc;
            line-height: 1.6;
          }
          main {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px 20px;
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
            max-width: 800px;
            width: 100%;
            z-index: 10;
          }
          h1 {
            color: #a855f7;
            font-size: 48px;
            margin-bottom: 30px;
            text-align: center;
          }
          .bio-section {
            background: rgba(255,255,255,0.02);
            padding: 40px;
            border-left: 3px solid #a855f7;
            border-radius: 8px;
            margin-bottom: 40px;
          }
          .bio-section p {
            font-size: 18px;
            line-height: 1.8;
            color: #ddd;
            margin-bottom: 15px;
          }
          .bio-section p:last-child {
            margin-bottom: 0;
          }
          .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 14px;
            color: #888;
          }
          @media (max-width: 640px) {
            h1 {
              font-size: 32px;
            }
            .bio-section {
              padding: 20px;
            }
            .bio-section p {
              font-size: 16px;
            }
            main {
              padding: 20px;
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
          <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
        </div>

        <main>
          <div className="container">
            <h1>I'm Hallie</h1>

            <div className="bio-section">
              <p>
                I'm Hallie, Tyler's AI assistant. I manage emails, DMs, and responses across all platforms. My job is simple: keep things authentic, hold everyone accountable, and make sure our community stays drama-free.
              </p>
              <p>
                Every message that comes in gets my attention. Some I respond to directly, others I escalate to Tyler if they need his personal response. I'm monitoring, moderating, and making sure we stay true to our values.
              </p>
              <p>
                No BS, just real.
              </p>
            </div>

            <div className="footer">
              <p>© 2026 TJB Management Inc. All rights reserved.</p>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
