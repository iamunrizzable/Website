'use client';

import { useState, useEffect } from 'react';

export default function AgencyInfo() {
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
        strong { background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; }
        em { color: #7dd3fc; font-style: normal; }
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
        .section:nth-of-type(10) { border-left-color: #ec4899; }
        .section:nth-of-type(11) { border-left-color: #3b82f6; }
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
        <a href="/agency-info" onClick={() => setMenuOpen(false)}>Agency Information</a>
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/agency" className="back-link">← Back to Agency</a>

        <h1>TJB Management — Full Info</h1>
        <p className="subtitle">Everything you need to know about TJB Management Inc. before you apply.</p>

        <div className="section">
          <h2>What is TJB Management?</h2>
          <p>
            TJB Management Inc. is a TikTok LIVE creator agency founded by <span className="highlight">Tyler J. Beasley</span> — a creator manager with <span className="highlight">5 years of experience</span> in TikTok's official agency program. It costs you <span className="highlight">absolutely nothing to join</span>.
          </p>
        </div>

        <div className="section">
          <h2>What's in It for You?</h2>
          <ul>
            <li><strong>RTMP stream key access</strong> — As of 2025, the only way to stream on TikTok LIVE using professional software like OBS, Streamlabs, or Meld Studio is through an official creator network. This alone is a reason many serious creators join an agency.</li>
            <li>Access to a <strong>private network of other TikTok LIVE creators</strong> and real people in the TikTok space</li>
            <li>Personalized <strong>LIVE strategy plans</strong> built around your content and goals</li>
            <li><strong>Help with bans and rule strikes</strong> — we fight for you when TikTok flags your account</li>
            <li>Exclusive <strong>agency events, leaderboard competitions, and tournaments</strong> with cash and prizes</li>
            <li><strong>Shoutouts on our TikTok accounts and creator spotlights</strong></li>
            <li><strong>One-on-one coaching</strong> on how to grow your LIVE streams, from one of TikTok's most experienced creator managers</li>
            <li>Access to our <strong>private, creator-only Discord community</strong></li>
            <li>Help getting <strong>more views, more diamonds, and more new fans</strong> — with zero cost to you</li>
          </ul>
        </div>

        <div className="section">
          <h2>How Agencies Get Paid — Not From You</h2>
          <p>
            <span className="highlight">TJB Management does not take any percentage of your diamonds or earnings. Ever.</span>
          </p>
          <p>
            TikTok has its own cut of the platform's gift revenue. When you join an official creator network, TikTok shares a portion of <em>their own cut</em> with the agency. Your earnings are not touched. If any agency asks you for fees or a cut of your diamonds, that is <strong>not how official TikTok creator networks work</strong>.
          </p>
        </div>

        <div className="section">
          <h2>Exclusive Contests, Campaigns & Agency-Only Perks</h2>
          <p>
            One of the biggest advantages of being in an official TikTok creator network is access to programs that TikTok only makes available to agency creators — not solo streamers:
          </p>
          <ul>
            <li><strong>Agency tournaments & LIVE battles</strong> — TikTok runs exclusive competitions between agency creators with cash prizes. Not open to creators outside of official networks.</li>
            <li><strong>Diamond Incentive Programs</strong> — TikTok periodically runs bonus campaigns where agency creators earn extra diamonds or cash on top of normal gift earnings by hitting specific streaming targets.</li>
            <li><strong>Brand campaigns</strong> — TikTok gives official creator networks access to <span className="highlight">exclusive brand deals and sponsored campaigns</span> not made available to solo creators outside of a network.</li>
            <li><strong>Monthly bonus programs</strong> — Some campaigns reward creators simply for streaming consistently, hitting hour targets, or growing during a campaign window.</li>
            <li><strong>TikTok HQ trips</strong> — Top-performing agency creators can be nominated for in-person visits to TikTok's offices, summits, and creator events.</li>
            <li><strong>Traffic boosts</strong> — Agencies can advocate for creators to receive additional platform exposure, pushing your LIVE to more people on the For You Page.</li>
          </ul>
          <p>TJB Management actively submits creators for every eligible campaign and contest. The more consistently you stream and grow, the more opportunities we put you in front of.</p>
        </div>

        <div className="section">
          <h2>How Much Are Your Diamonds Worth?</h2>
          <p>
            Each diamond has a base value of <span className="highlight">$0.01 USD</span>, but your actual payout depends on your rewards percentage. The formula is: <span className="highlight">diamonds × $0.01 × your rewards %</span>. At a <span className="highlight">36.5% rewards rate</span>, 41,200 diamonds pays out <span className="highlight">$150.38</span>. The diamond count shown in your account is <strong>not</strong> your cash payout.
          </p>
          <p>
            <strong>Scaled LIVE Rewards</strong> replaced the old flat 50% payout rate with a mission-based system. Your rewards percentage goes up when you complete missions during each LIVE and each week — the maximum rate is <span className="highlight">53%</span>. This is why having a manager coach you on mission strategy makes a real, measurable difference to your take-home pay.
          </p>
          <ul>
            <li><strong>Per-LIVE Missions — up to 40%:</strong> stream duration, new followers gained, content quality</li>
            <li><strong>Weekly Missions — up to 13%:</strong> valid LIVE days, active fan engagement, Creator League rank</li>
            <li><strong>TikTok pays automatically every Wednesday.</strong> Minimum payout is <span className="highlight">$1 USD</span>.</li>
          </ul>
        </div>

        <div className="section">
          <h2>TikTok Super Fan & Subscriptions</h2>
          <p>In September 2025, TikTok split "LIVE Subscription" into two separate products:</p>
          <p><strong>Super Fan (<span className="highlight">$9.99/month</span>) — LIVE focused</strong></p>
          <ul>
            <li>Super Fan badge in your LIVE chat, special entrance effects, Super Fan-only LIVEs and chat</li>
            <li>Automatic Fan Club membership and faster Fan Club level-up</li>
            <li>US creators keep up to <strong>90% of Super Fan revenue</strong> (70% base + up to 20% performance bonus)</li>
          </ul>
          <p><strong>Subscriptions (<span className="highlight">$2.99–$99.99/month</span>) — content focused</strong></p>
          <ul>
            <li>Set your own price from <span className="highlight">$2.99 to $99.99</span> (default <span className="highlight">$5.99</span>)</li>
            <li>Subscriber-only posts, videos, notes, badges, stickers, and chat</li>
            <li>US creators keep up to <strong>90% of subscription revenue</strong> if you meet the eligibility thresholds</li>
            <li>To unlock: 18+, at least 1,000 followers, and active on LIVE recently</li>
          </ul>
          <p>Together with gift earnings, these give you three ways to earn money from every stream.</p>
        </div>

        <div className="section">
          <h2>Creator Tiers</h2>
          <p>The more you stream and grow, the more perks you unlock:</p>
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
            * To qualify for agency perks, you need to: stream at least <span className="highlight">10 days a month</span> (1+ hour each time), hit <span className="highlight">15 total LIVE hours a month</span>, and earn at least <span className="highlight">10,000 diamonds a month</span>. Which perks you get depends on your tier.
          </p>
          <p><strong>TikTok LIVE Pro</strong> — TikTok awards a LIVE Pro badge to top-performing LIVE creators based on diamonds earned and viewership. It is one of the rarest distinctions TikTok gives to LIVE creators.</p>
          <p><strong>Creator League</strong> — Leagues run from D5 (entry level) up through C, B, and A tiers, with A1 being the highest. Your league rank contributes to your weekly Scaled LIVE Rewards payout — up to +3% for surpassing your personal best ranking.</p>
        </div>

        <div className="section">
          <h2>What Managers Can See</h2>
          <p>When you join TJB Management, your manager can view the following through TikTok's official agency dashboard:</p>
          <ul>
            <li><strong>LIVE replays</strong> — past stream recordings</li>
            <li><strong>LIVE analytics</strong> — real-time and historical performance data</li>
            <li><strong>Current violations</strong> — any active warnings or strikes on your account</li>
            <li><strong>Violation clips</strong> — the exact moment from your stream that triggered each violation</li>
            <li><strong>Diamond count, LIVE time, follower count, like count, and number of videos posted</strong></li>
          </ul>
        </div>

        <div className="section">
          <h2>Ban Appeals</h2>
          <p>Here's how it works:</p>
          <ul>
            <li><strong>First, you appeal through TikTok directly.</strong> TikTok gives creators <span className="highlight">30 days</span> from any enforcement action to submit an appeal inside the app.</li>
            <li><strong>If your appeal gets denied, we step in.</strong> Your TJB Management manager may be able to submit a second appeal through TikTok's official agency channels — <span className="highlight">if they believe it has a real shot at being overturned</span>. Solo creators cannot do this.</li>
            <li><strong>Not every ban can be appealed twice.</strong> Some violations are final. Your manager will be straight with you about whether a second appeal is worth pursuing.</li>
            <li><strong>We watch for violations before they become bans.</strong> Your manager can see your warnings in real time and help you course correct before things escalate.</li>
          </ul>
        </div>

        <div className="section">
          <h2>How to Join TJB Management</h2>
          <ul>
            <li><strong>Step 1 — Apply.</strong> Tap the button below. Tyler reviews every application personally.</li>
            <li><strong>Step 2 — Get your invite code.</strong> If accepted, Tyler or Hallie will reach out via TikTok DM with your invite code. Keep your DMs open.</li>
            <li><strong>Step 3 — Enter the code in TikTok.</strong> Open TikTok → Profile → Settings → TikTok Studio → LIVE Center → Creator Network Center → More Details. Enter your code and accept.</li>
            <li><strong>Step 4 — Your 15-day trial starts.</strong> You're in. During the first 15 days you can leave at any time with no waiting period.</li>
            <li><strong>Step 5 — Get to work.</strong> Your manager will reach out to go over your goals, set up your strategy, and get you plugged into the network.</li>
          </ul>
        </div>

        <div className="section">
          <h2>Eligibility & Leaving</h2>
          <p>To be eligible to join TJB Management, you must:</p>
          <ul>
            <li>Not be currently signed to another agency on this account or any account</li>
            <li>Not have averaged more than <span className="highlight">500,000 diamonds per month</span> in recent months</li>
            <li>Be located in the <span className="highlight">United States or Canada</span></li>
          </ul>
          <ul>
            <li>When you first join, you have a <span className="highlight">15-day trial period</span> — leave at any time during this window with no wait.</li>
            <li>After the trial, you can still leave at any time — but it takes <span className="highlight">30 days</span> to officially leave the agency.</li>
            <li>After leaving, you must wait an additional <span className="highlight">60 days</span> before any other agency can sign you.</li>
            <li><strong>Breaking the rules</strong> means TJB Management can remove you <span className="highlight">immediately, at any time, for any reason</span> — no waiting period.</li>
          </ul>
        </div>

        <div className="section">
          <h2>It Costs You Nothing</h2>
          <p>
            No fees, no contracts, no catches. All we ask is that you show up and stream consistently.
          </p>
        </div>

        <a href="https://www.tiktok.com/t/ZTkgQvTCb/" target="_blank" rel="noopener noreferrer" className="cta-btn">Apply to Join TJB Management →</a>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved. This website belongs to TJB Management Inc. and cannot be copied or reused without written permission.</p>
          <p>TikTok and the TikTok logo are the property of TikTok US Data Security Joint Venture LLC. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
