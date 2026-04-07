'use client';

import { useState, useEffect } from 'react';

export default function SwaveSocialInfo() {
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
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.82)), url("/bg-swave.jpeg") center/cover no-repeat;
          z-index: -2;
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
            text-shadow: 0 0 40px rgba(168, 85, 247, 1), 0 0 60px rgba(236, 72, 153, 0.8), 0 0 80px rgba(59, 130, 246, 0.5);
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
          margin-bottom: 10px;
          font-size: 36px;
          animation: glowPulse 3s ease-in-out infinite;
        }
        .subtitle {
          color: #a0aec0;
          font-size: 16px;
          margin-bottom: 40px;
        }
        h2 {
          color: #a855f7;
          font-size: 20px;
          margin-bottom: 15px;
          animation: glowPulse 3s ease-in-out infinite;
        }
        p {
          color: #a0aec0;
          line-height: 1.8;
          margin-bottom: 15px;
        }
        li {
          color: #a0aec0;
          line-height: 1.8;
          margin-bottom: 8px;
        }
        .section {
          padding: 25px;
          border-left: 8px solid #a855f7;
          margin-bottom: 30px;
          border-radius: 5px;
          background: rgba(255,255,255,0.03);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .section.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .section:nth-of-type(2) { border-left-color: #ec4899; }
        .section:nth-of-type(3) { border-left-color: #3b82f6; }
        .section:nth-of-type(4) { border-left-color: #06b6d4; }
        .section:nth-of-type(5) { border-left-color: #a855f7; }
        .section:nth-of-type(6) { border-left-color: #ec4899; }
        .tier-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .tier-card {
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }
        .tier-card.diamond {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
          border: 1px solid #6366f1;
        }
        .tier-card.growing {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3));
          border: 1px solid #ec4899;
        }
        .tier-card.community {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.3));
          border: 1px solid #3b82f6;
        }
        .tier-name {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 6px;
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tier-req {
          font-size: 13px;
          color: #a0aec0;
        }
        .highlight {
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        .cta-btn {
          display: block;
          text-align: center;
          margin: 10px auto 40px;
          padding: 18px 40px;
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          text-decoration: none;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border-radius: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
        }
        .cta-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.7);
          text-decoration: none;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 30px;
          color: #a855f7;
          text-decoration: none;
          font-weight: 500;
        }
        .back-link:hover { text-decoration: underline; }
        .disclaimer {
          font-size: 12px;
          color: #6b7280;
          margin-top: 10px;
          line-height: 1.6;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          text-align: center;
          font-size: 12px;
          color: #8b9dc3;
          line-height: 1.8;
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
        .menu-dropdown.active { display: block; }
        .menu-dropdown a {
          display: block;
          padding: 10px 20px;
          color: #a855f7;
          text-decoration: none;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
          transition: background-color 0.2s;
        }
        .menu-dropdown a:last-child { border-bottom: none; }
        .menu-dropdown a:hover { background-color: rgba(168, 85, 247, 0.1); }
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
        <a href="/contact-swave-social" onClick={() => setMenuOpen(false)}>Join Swave Social</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>

        <h1>Swave Social</h1>
        <p className="subtitle">A TikTok LIVE Creator Network — Est. 2021</p>

        <div className="section">
          <h2>What is Swave Social?</h2>
          <p>
            Swave Social is one of <span className="highlight">only 5 TikTok agencies in the USA</span> that has a real, dedicated point of contact at TikTok. Since 2021, Swave has built a creator network focused on one thing: helping LIVE streamers grow, get protected, and get paid.
          </p>
          <p>
            Whether you're just getting started or already pulling serious numbers, Swave gives you the infrastructure, support, and opportunities to take your stream to the next level — and it costs you <span className="highlight">absolutely nothing to join</span>.
          </p>
        </div>

        <div className="section">
          <h2>What's in It for You?</h2>
          <ul>
            <li>Access to an <strong>exclusive Creator Network</strong> with real industry connections</li>
            <li>Personalized <strong>LIVE strategy plans</strong> built around your content and goals</li>
            <li>Full <strong>ban assistance and violation protection</strong> — we go to bat for you</li>
            <li>Exclusive <strong>agency campaigns, leaderboards, and tournaments</strong> with prizes ranging from diamonds to trips to TikTok HQ to being featured on the <span className="highlight">@tiktoklive_us</span> page</li>
            <li><strong>Account takeovers, creator spotlights, and in-person meetups</strong> across the US</li>
            <li>Elite-level <strong>live streaming education</strong> from some of the top creators in the industry</li>
            <li>Access to our <strong>private, creator-only Discord server</strong></li>
            <li>Help getting <strong>more views, more diamonds, and more exposure</strong> — with zero cost to you</li>
          </ul>
        </div>

        <div className="section">
          <h2>Creator Tiers</h2>
          <p>Perks and services scale with your performance. Here's how it breaks down:</p>
          <div className="tier-grid">
            <div className="tier-card diamond">
              <div className="tier-name">💎 Diamond Tier</div>
              <div className="tier-req">1M+ diamonds per month</div>
            </div>
            <div className="tier-card growing">
              <div className="tier-name">📈 Growing Creator</div>
              <div className="tier-req">250K – 1M diamonds per month</div>
            </div>
            <div className="tier-card community">
              <div className="tier-name">🌐 Community Tier</div>
              <div className="tier-req">100K+ diamonds per month</div>
            </div>
          </div>
          <p className="disclaimer">
            * To qualify for creator services, Swave creators are expected to complete a minimum of 10 streamed days per month (at least 1 hour per session), accumulate 15 streamed hours per month, and earn a minimum of 10,000 diamonds per month. Creator perks are determined by tier level.
          </p>
        </div>

        <div className="section">
          <h2>Why Swave Over Everyone Else?</h2>
          <p>
            Most agencies throw you in a Lark group and call it support. Swave is different. As one of only 5 agencies in the USA with a direct point of contact at TikTok, our managers can go straight to TikTok on your behalf when you need help. <span className="highlight">Creators don't have access to this contact — only Swave managers do.</span> That means when something goes wrong — a ban, a violation, a campaign issue — we handle it at the source.
          </p>
          <p>
            Swave has been in the game since <span className="highlight">2021</span>. That's years of relationships, data, and platform experience working in your favor from day one.
          </p>
        </div>

        <div className="section">
          <h2>It Costs You Nothing</h2>
          <p>
            Joining Swave Social is completely free. There are no fees, no contracts, and no catches. It can only help you. The only thing we ask is that you show up and stream consistently.
          </p>
        </div>

        <a href="/contact-swave-social" className="cta-btn">Apply to Join Swave Social →</a>

        <div className="footer">
          <p>© 2026 Tyler J. Beasley. All rights reserved. Hallie and the TJB Management Inc. website are the sole proprietary property of TJB Management Inc. and may not be reproduced or copied without prior written consent.</p>
          <p>Tyler J. Beasley is a Creator Manager at Swave Social Talent, a company affiliated with TikTok LIVE.</p>
          <p>Swave Social and the Swave Social logo are the property of Swave Social. All rights reserved. TikTok and the TikTok logo are the property of TikTok US Data Security Joint Venture LLC. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
