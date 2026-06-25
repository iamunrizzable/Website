'use client';

import { useState, useEffect } from 'react';

export default function AgencyPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        body::before {
          content: "";
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.82)), url("/bg-tyler.png");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -2;
          pointer-events: none;
        }
        body { margin: 0; padding: 0; background: transparent; }
        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.3); }
          50% { text-shadow: 0 0 40px rgba(168,85,247,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(59,130,246,0.5); }
        }
        main { max-width: 900px; margin: 0 auto; padding: 40px 20px; position: relative; z-index: 10; }
        h1 { color: #d4a5ff; margin-bottom: 10px; font-size: 36px; animation: glowPulse 3s ease-in-out infinite; }
        .subtitle { color: #a0aec0; font-size: 16px; margin-bottom: 40px; }
        h2 { color: #a855f7; font-size: 20px; margin-bottom: 15px; animation: glowPulse 3s ease-in-out infinite; }
        p { color: #a0aec0; line-height: 1.8; margin-bottom: 15px; }
        li { color: #a0aec0; line-height: 1.8; margin-bottom: 8px; }
        .section {
          padding: 25px; border-left: 8px solid #a855f7; margin-bottom: 30px;
          border-radius: 5px; background: rgba(255,255,255,0.03);
          opacity: 0; transform: translateY(20px); transition: all 0.6s ease;
        }
        .section.visible { opacity: 1; transform: translateY(0); }
        .section:nth-of-type(2) { border-left-color: #ec4899; }
        .section:nth-of-type(3) { border-left-color: #3b82f6; }
        .section:nth-of-type(4) { border-left-color: #06b6d4; }
        .section:nth-of-type(5) { border-left-color: #a855f7; }
        .section:nth-of-type(6) { border-left-color: #ec4899; }
        .section:nth-of-type(7) { border-left-color: #3b82f6; }
        .section:nth-of-type(8) { border-left-color: #06b6d4; }
        .section:nth-of-type(9) { border-left-color: #a855f7; }
        .tier-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
        .tier-card { padding: 20px; border-radius: 10px; text-align: center; }
        .tier-card.diamond { background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3)); border: 1px solid #6366f1; }
        .tier-card.growing { background: linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3)); border: 1px solid #ec4899; }
        .tier-card.community { background: linear-gradient(135deg, rgba(59,130,246,0.3), rgba(6,182,212,0.3)); border: 1px solid #3b82f6; }
        .tier-name { font-size: 16px; font-weight: 700; margin-bottom: 6px; background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .tier-req { font-size: 13px; color: #a0aec0; }
        .highlight { background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; }
        .cta-btn {
          display: block; text-align: center; margin: 10px auto 20px;
          padding: 18px 40px; color: #fff; font-size: 20px; font-weight: 700;
          text-decoration: none; background: linear-gradient(135deg, #a855f7, #ec4899);
          border-radius: 12px; transition: all 0.3s ease; box-shadow: 0 0 20px rgba(168,85,247,0.4);
        }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 0 40px rgba(168,85,247,0.7); text-decoration: none; }
        .back-link { display: inline-block; margin-bottom: 30px; color: #a855f7; text-decoration: none; font-weight: 500; }
        .back-link:hover { text-decoration: underline; }
        .disclaimer { font-size: 12px; color: #6b7280; margin-top: 10px; line-height: 1.6; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 12px; color: #8b9dc3; line-height: 1.8; }
        .menu-button { position: fixed; top: 20px; right: 20px; background-color: #a855f7; color: #fff; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; z-index: 100; font-size: 16px; transition: all 0.3s ease; }
        .menu-button:hover { background-color: #9333ea; transform: scale(1.05); box-shadow: 0 0 20px rgba(168,85,247,0.6); }
        .menu-dropdown { display: none; position: fixed; top: 60px; right: 20px; background-color: #0f172a; border: 2px solid #a855f7; border-radius: 5px; padding: 10px 0; min-width: 200px; z-index: 101; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
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
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Contact Hallie</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Contact Tyler</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
        <a href="/join-agency" onClick={() => setMenuOpen(false)}>Join the Agency</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>

        <h1>TJB Management Inc.</h1>
        <p className="subtitle">A TikTok LIVE Creator Agency — Founded by Tyler J. Beasley</p>

        <div className="section">
          <h2>What is TJB Management?</h2>
          <p>
            TJB Management Inc. is a TikTok LIVE creator agency founded by <span className="highlight">Tyler J. Beasley</span> — a creator manager with <span className="highlight">5 years of experience</span> working inside TikTok Backstage and managing creators across multiple TikTok agencies. Tyler built TJB Management to give creators the direct, personalized support that most agencies simply don't deliver.
          </p>
          <p>
            Whether you're just getting started or already pulling serious numbers, TJB Management gives you the infrastructure, strategy, and protection to take your stream to the next level — and it costs you <span className="highlight">absolutely nothing to join</span>.
          </p>
        </div>

        <div className="section">
          <h2>What's in It for You?</h2>
          <ul>
            <li>Access to an <strong>exclusive Creator Network</strong> with real industry connections</li>
            <li>Personalized <strong>LIVE strategy plans</strong> built around your content and goals</li>
            <li>Full <strong>ban assistance and violation protection</strong> — we go to bat for you</li>
            <li>Exclusive <strong>agency campaigns, leaderboards, and tournaments</strong> with prizes</li>
            <li><strong>Account takeovers, creator spotlights, and in-person meetups</strong> across the US</li>
            <li>Elite-level <strong>live streaming education</strong> from one of the top creator managers in the industry</li>
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
            * To qualify for creator services, creators are expected to complete a minimum of 10 streamed days per month (at least 1 hour per session), accumulate 15 streamed hours per month, and earn a minimum of 10,000 diamonds per month. Creator perks are determined by tier level.
          </p>
        </div>

        <div className="section">
          <h2>What Managers Can See</h2>
          <p>
            When you join TJB Management, your creator network managers are given access to certain account data through TikTok's agency dashboard. This is what allows us to support, protect, and advocate for you effectively. Managers have visibility into:
          </p>
          <ul>
            <li><strong>LIVE replays</strong> — managers can review past streams</li>
            <li><strong>LIVE analytics</strong> — real-time and historical performance data from your streams</li>
            <li><strong>Current violations</strong> — any active strikes or policy flags on your account</li>
            <li><strong>Violation clips</strong> — the specific clip flagged for each violation</li>
            <li><strong>Diamond count</strong> — your total diamonds earned</li>
            <li><strong>LIVE time</strong> — your total hours streamed</li>
            <li><strong>Follower count</strong></li>
            <li><strong>Like count</strong></li>
            <li><strong>Number of videos posted</strong></li>
          </ul>
          <p>
            This data is used solely to support your growth, monitor for violations we can help resolve, and qualify you for campaigns and opportunities within the network.
          </p>
        </div>

        <div className="section">
          <h2>Ban Appeals</h2>
          <p>
            If your in-app ban appeal gets denied, your TJB Management creator network manager may appeal the ban on your behalf — <span className="highlight">at their discretion</span>. Not every ban is eligible for escalation, but when it is, we go to bat for you.
          </p>
        </div>

        <div className="section">
          <h2>Agency Eligibility & Leaving</h2>
          <p>To be eligible to join TJB Management, you must meet all of the following:</p>
          <ul>
            <li>You are <span className="highlight">not currently signed to another agency</span> on this account or any account</li>
            <li>You have <span className="highlight">not exceeded 500,000 diamonds</span> in the current calendar month or any of the 5 prior calendar months</li>
            <li>You are located in the <span className="highlight">United States or Canada</span></li>
          </ul>
          <ul>
            <li>When you first join, you are placed on a <span className="highlight">15-day trial period</span>. During this time, you can leave immediately with no waiting period.</li>
            <li>After the trial ends, you can still leave at any time — however, your departure will take <span className="highlight">30 days</span> to process.</li>
            <li>If you leave after the 15-day trial, there is an additional <span className="highlight">60-day waiting period</span> after the 30-day quit process before another agency can sign you, provided you still meet eligibility requirements.</li>
            <li><strong>Rule Violations & Termination:</strong> If you violate TJB Management's rules or guidelines at any point, the creator network reserves the right to <span className="highlight">immediately terminate your relationship at any time, for any reason</span>, with no waiting period and no further obligation to you.</li>
          </ul>
        </div>

        <div className="section">
          <h2>It Costs You Nothing</h2>
          <p>
            Joining TJB Management is completely free — no fees, no contracts, no catches. There's nothing to lose and everything to gain. All we ask is that you show up and stream consistently.
          </p>
        </div>

        <a href="/join-agency" className="cta-btn">Apply to Join TJB Management →</a>

        <div className="footer">
          <p>© 2026 Tyler J. Beasley. All rights reserved. TJB Management Inc. and the TJB Management Inc. website are the sole proprietary property of TJB Management Inc. and may not be reproduced or copied without prior written consent.</p>
          <p>TikTok and the TikTok logo are the property of TikTok US Data Security Joint Venture LLC. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
