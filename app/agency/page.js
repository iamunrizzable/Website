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
          background-image: linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.82)), url("/bg-main.jpeg");
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
        .section:nth-of-type(10) { border-left-color: #ec4899; }
        .section:nth-of-type(11) { border-left-color: #3b82f6; }
        .section:nth-of-type(12) { border-left-color: #06b6d4; }
        .tier-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
        .tier-card { padding: 20px; border-radius: 10px; text-align: center; }
        .tier-card.diamond { background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3)); border: 1px solid #6366f1; }
        .tier-card.growing { background: linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3)); border: 1px solid #ec4899; }
        .tier-card.community { background: linear-gradient(135deg, rgba(59,130,246,0.3), rgba(6,182,212,0.3)); border: 1px solid #3b82f6; }
        .tier-name { font-size: 16px; font-weight: 700; margin-bottom: 6px; background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .tier-req { font-size: 13px; color: #a0aec0; }
        .highlight { background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; }
        strong { background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; }
        em { color: #7dd3fc; font-style: normal; }
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
        <a href="/contact-agency" onClick={() => setMenuOpen(false)}>Contact Agency</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>

        <h1>TJB Management Inc.</h1>
        <p className="subtitle">A TikTok LIVE Creator Agency — Founded by Tyler J. Beasley</p>

        <div className="section">
          <h2>What is TJB Management?</h2>
          <p>
            TJB Management Inc. is a TikTok LIVE creator agency founded by <span className="highlight">Tyler J. Beasley</span> — a creator manager with <span className="highlight">5 years of experience</span> working through TikTok's official agency program and managing creators across several TikTok LIVE agencies. It costs you <span className="highlight">absolutely nothing to join</span>.
          </p>
        </div>

        <div className="section">
          <h2>What's in It for You?</h2>
          <ul>
            <li><strong>RTMP stream key access</strong> — The only way to stream on TikTok LIVE using OBS, Streamlabs, or Meld Studio is through an official creator network. No follower count unlocks this on its own.</li>
            <li>Access to a <strong>private network of other TikTok LIVE creators</strong> and real people in the TikTok space</li>
            <li>Personalized <strong>LIVE strategy plans</strong> built around your content and goals</li>
            <li><strong>Help with bans and rule strikes</strong> — we fight for you when TikTok flags your account</li>
            <li>Exclusive <strong>agency events, leaderboard competitions, and tournaments</strong> with cash and prizes</li>
            <li><strong>Shoutouts on our TikTok accounts and creator spotlights</strong></li>
            <li><strong>One-on-one coaching</strong> on how to grow your LIVE streams, from one of TikTok's most experienced creator managers</li>
            <li>Access to our <strong>private, creator-only Discord community</strong> — <a href="https://discord.gg/xznQZY7CeW" target="_blank" rel="noopener noreferrer" style={{color:'#a855f7'}}>join here</a></li>
            <li>Help getting <strong>more views, more diamonds, and more new fans</strong></li>
          </ul>
        </div>

        <div className="section">
          <h2>How Agencies Get Paid — Not From You</h2>
          <p><span className="highlight">TJB Management does not take any percentage of your diamonds or earnings. Ever.</span></p>
          <p>
            TikTok takes its own cut of gift revenue. When you join an official creator network, TikTok shares a portion of <em>their own cut</em> with the agency. Your earnings are not touched. If any agency asks for fees or a cut of your diamonds, that is <strong>not how official TikTok creator networks work</strong>.
          </p>
        </div>

        <div className="section">
          <h2>Exclusive Contests, Campaigns & Agency-Only Perks</h2>
          <p>TikTok makes these available to agency creators only — not solo streamers:</p>
          <ul>
            <li><strong>Agency tournaments & LIVE battles</strong> — TikTok runs exclusive competitions between agency creators where you can win cash prizes. These are not open to creators outside of official networks.</li>
            <li><strong>Diamond Incentive Programs</strong> — TikTok periodically runs bonus campaigns where agency creators can earn extra diamonds or cash rewards on top of their normal gift earnings by hitting specific streaming targets.</li>
            <li><strong>Brand campaigns</strong> — TikTok gives official creator networks access to <span className="highlight">exclusive brand deals and sponsored campaigns</span> that are not made available to solo creators outside of a network.</li>
            <li><strong>Monthly bonus programs</strong> — Some campaigns reward creators simply for streaming consistently, hitting hour targets, or growing their follower count during a campaign window.</li>
            <li><strong>TikTok HQ trips</strong> — Top-performing agency creators can be nominated for in-person visits to TikTok's offices, summits, and creator events.</li>
            <li><strong>Traffic boosts</strong> — Agencies can advocate for creators to receive additional platform exposure, helping push your LIVE to more people on the For You Page.</li>
          </ul>
          <p>TJB Management actively submits creators for every eligible campaign and contest.</p>
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
          <p><strong>TikTok LIVE Pro</strong> — TikTok awards a LIVE Pro badge to top-performing creators based on diamonds and viewership. It's one of the rarest distinctions on the platform.</p>
          <p><strong>Creator League</strong> — Part of TikTok's Scaled LIVE Rewards weekly missions. Leagues are ranked from D5 (entry level) up through C, B, and A tiers, with A1 being the highest rank. If you finish the week in the A1–A3 league without dropping below where you started, you earn +1% on your weekly rewards. If you surpass your personal best league ranking, you earn +3%. The Creator League mission is capped at $1,000/week.</p>
        </div>

        <div className="section">
          <h2>What Managers Can See</h2>
          <p>Through TikTok's official agency dashboard, your manager can see:</p>
          <ul>
            <li><strong>LIVE replays</strong></li>
            <li><strong>LIVE analytics</strong> — real-time and historical</li>
            <li><strong>Current violations and violation clips</strong> — the exact moment that triggered each one</li>
            <li><strong>Diamond count, LIVE time, follower count, like count, and videos posted</strong></li>
          </ul>
        </div>

        <div className="section">
          <h2>Ban Appeals</h2>
          <p>
            Getting banned on TikTok LIVE is stressful — but as an agency creator, you don't have to fight it alone. Here's how it works:
          </p>
          <ul>
            <li><strong>First, you appeal through TikTok directly.</strong> TikTok gives creators <span className="highlight">30 days</span> from the date of any enforcement action to submit an appeal inside the app.</li>
            <li><strong>If your appeal gets denied, we step in.</strong> Your TJB Management manager may be able to submit a second appeal on your behalf through TikTok's official agency channels — <span className="highlight">if they believe it has a real shot at being overturned</span>. This is something solo creators cannot do on their own.</li>
            <li><strong>Not every ban can be appealed twice.</strong> Some violations are final regardless of who submits the appeal. Your manager will be candid with you about whether a second appeal is worth pursuing.</li>
            <li><strong>We also watch for violations before they become bans.</strong> Because your manager can see your current warnings and strikes in real time, they can flag issues early and help you course correct before things escalate.</li>
          </ul>
        </div>

        <div className="section">
          <h2>Frequently Asked Questions</h2>
          <p><strong>Do I need a minimum follower count?</strong></p>
          <p><span className="highlight">No.</span> TJB Management has <span className="highlight">no minimum follower count</span> requirement.</p>
          <p><strong>Can I use OBS or Streamlabs?</strong></p>
          <p><span className="highlight">Yes</span> — and this is one of the main reasons to join. <span className="highlight">RTMP stream key access</span> (required for OBS, Streamlabs, and Meld Studio) is only available through an official creator network. You cannot get it any other way regardless of follower count.</p>
          <p><strong>Does TJB Management take a cut of my earnings?</strong></p>
          <p><span className="highlight">Never.</span> TikTok pays agencies separately out of their own cut. Your <span className="highlight">diamonds and payout are not touched</span>.</p>
          <p><strong>What if I cannot meet my streaming minimums one month?</strong></p>
          <p>You <span className="highlight">stay in the agency</span>. Missing the activity minimums (<span className="highlight">10 days/month, 15 hours, 10K diamonds</span>) means you won't qualify for that month's campaigns and perks — but it does not remove you.</p>
          <p><strong>What if I get banned during my trial?</strong></p>
          <p>First, note that if TikTok requires you to complete a live trial before joining the agency, you are <span className="highlight">not officially signed</span> until that trial is complete. TikTok only requires this live trial for accounts that have not completed a <span className="highlight">10-minute stream in the past 60 days</span>. If a ban happens before you finish that trial, the agency relationship has not formally started yet — however, if you are actively in the process of signing with TJB Management, your manager <span className="highlight">may still be able to submit an appeal</span> on your behalf to help get you back on track.</p>
          <p>If you are already signed and get banned during your <span className="highlight">15-day agency trial</span>: appeal through TikTok's app first. Your manager will help escalate if it gets denied. The <span className="highlight">15-day no-waiting-period rule</span> still applies — you can leave at any time during the trial for any reason, including a ban.</p>
        </div>

        <div className="section">
          <h2>How to Join TJB Management</h2>
          <ul>
            <li><strong>Step 1 — Apply.</strong> Tap the button below and log into TikTok when prompted. Hit <strong>Apply</strong> on the page.</li>
            <li><strong>Step 2 — Get approved.</strong> Tyler reviews every application personally.</li>
            <li><strong>Step 3 — Accept the invitation.</strong> Once approved, the easiest way is to tap your <strong>system notification</strong> from TikTok. You can also find it in TikTok Studio → swipe to LIVE → scroll down to <strong>Tools &amp; Resources</strong> → <strong>Creator Networks</strong>.</li>
            <li><strong>Step 4 — Your 15-day trial starts.</strong> You're in. During the first 15 days you can leave at any time with no waiting period.</li>
            <li><strong>Step 5 — Get started.</strong> Your manager will reach out to go over your goals, set up your strategy, and get you plugged into the network.</li>
          </ul>
        </div>

        <div className="section">
          <h2>Agency Eligibility & Leaving</h2>
          <p>To be eligible to join TJB Management, you must meet all of the following:</p>
          <ul>
            <li>You are <span className="highlight">18 or older</span></li>
            <li>The account you are joining with is your <span className="highlight">main TikTok account</span> — backup accounts, alt accounts, and secondary accounts are not eligible, and the account must have been your primary account for the <span className="highlight">last 6 months</span></li>
            <li>You are <span className="highlight">not currently signed to another agency</span> on any account, and you have not been solicited away from another agency</li>
            <li>You haven't averaged more than <span className="highlight">500,000 diamonds per month</span> in the last 6 months</li>
            <li>You are located in the <span className="highlight">United States or Canada</span></li>
            <li>Your account meets <span className="highlight">TikTok's current eligibility requirements</span> to join a creator network (account standing, etc.)</li>
            <li>You agree to follow <span className="highlight">TikTok's platform rules and all applicable laws</span>, including FTC disclosure guidelines for any sponsored or endorsed content</li>
          </ul>
          <ul>
            <li>When you first join, you are placed on a <span className="highlight">15-day trial period</span>. During this time, you can leave immediately with no waiting period.</li>
            <li>After the trial ends, you can still leave at any time — however, it'll take <span className="highlight">30 days</span> for you to officially leave the agency.</li>
            <li>After those 30 days, you'll need to wait an additional <span className="highlight">60 days</span> before any other agency can sign you.</li>
            <li><strong>Breaking the Rules:</strong> If you break any TJB Management rules or guidelines, TJB Management can <span className="highlight">remove you from the agency immediately, at any time, for any reason</span> — with no waiting period.</li>
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
          <p>© 2026 Tyler J. Beasley. All rights reserved. TJB Management Inc. and this website belong to TJB Management Inc. and cannot be copied or reused without written permission.</p>
          <p>TikTok and the TikTok logo are the property of TikTok US Data Security Joint Venture LLC. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
