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
            TJB Management Inc. is a TikTok LIVE creator agency founded by <span className="highlight">Tyler J. Beasley</span> — a creator manager with <span className="highlight">5 years of experience</span> working through TikTok's official agency program and managing creators across several TikTok LIVE agencies. Tyler built TJB Management to give creators the direct, personalized support that most agencies simply don't deliver.
          </p>
          <p>
            Whether you're just getting started or already pulling serious numbers, TJB Management gives you the tools, strategy, and protection to take your stream to the next level — and it costs you <span className="highlight">absolutely nothing to join</span>.
          </p>
        </div>

        <div className="section">
          <h2>What's in It for You?</h2>
          <ul>
            <li>Access to a <strong>private network of other TikTok LIVE creators</strong> and real people in the TikTok space</li>
            <li>Personalized <strong>LIVE strategy plans</strong> built around your content and goals</li>
            <li><strong>Help with bans and rule strikes</strong> — we fight for you when TikTok flags your account</li>
            <li>Exclusive <strong>agency events, leaderboard competitions, and tournaments</strong> with cash and prizes</li>
            <li><strong>Shoutouts on our TikTok accounts, creator spotlights, and in-person meetups</strong> across the US</li>
            <li><strong>One-on-one coaching</strong> on how to grow your LIVE streams, from one of TikTok's most experienced creator managers</li>
            <li>Access to our <strong>private, creator-only Discord community</strong></li>
            <li>Help getting <strong>more views, more diamonds, and more new fans</strong> — with zero cost to you</li>
          </ul>
        </div>

        <div className="section">
          <h2>How TikTok LIVE Gifts Work</h2>
          <p>
            When you go LIVE on TikTok, your viewers can send you virtual gifts as a way to show support. Here's exactly how it works from start to finish:
          </p>
          <ul>
            <li><strong>Step 1 — Viewers buy TikTok Coins.</strong> Coins are TikTok's in-app currency. Roughly 65–70 coins costs viewers about $1 USD, purchased directly through the TikTok app.</li>
            <li><strong>Step 2 — They spend coins on gifts.</strong> Gifts range from a Rose (1 coin, about $0.01) all the way up to the Universe (44,999 coins, worth over $560 to the sender). Every gift has a coin cost that the viewer pays.</li>
            <li><strong>Step 3 — Gifts become Diamonds for you.</strong> When a viewer sends a gift, TikTok converts that gift into Diamonds deposited into your account. The number of diamonds you get is roughly half the coin value of the gift.</li>
            <li><strong>Step 4 — You cash out your Diamonds.</strong> Once you hit the $100 minimum, you can withdraw your diamonds as real money through PayPal or other supported methods.</li>
          </ul>
          <p>
            The most common gifts you'll see in streams: <strong>Rose</strong> (1 coin), <strong>TikTok</strong> (1 coin), <strong>Sunglasses</strong> (5 coins), <strong>Heart Me</strong> (10 coins), <strong>Finger Heart</strong> (5 coins), <strong>Galaxy</strong> (1,000 coins), <strong>Lion</strong> (29,999 coins), and <strong>Universe</strong> (44,999 coins — the biggest gift on the platform).
          </p>
        </div>

        <div className="section">
          <h2>How Much Are Your Diamonds Worth?</h2>
          <p>
            Each diamond is worth <span className="highlight">$0.005 USD</span> — so 1,000 diamonds = $5, and 10,000 diamonds = $50. But TikTok takes a cut before you see a dollar, so here's the real math:
          </p>
          <ul>
            <li><strong>TikTok's base cut is 50%.</strong> For every gift sent, TikTok keeps roughly half of the value before converting it to your diamonds.</li>
            <li><strong>Scaled rewards system.</strong> Since 2025, TikTok uses a mission-based payout system. By completing per-LIVE missions (up to 40% bonus) and weekly missions (up to 13% bonus), you can earn up to 53% of the total gift value — but this requires consistent streaming and hitting targets.</li>
            <li><strong>Real take-home range.</strong> Most creators actually take home about 25–35% of what their viewers originally paid for coins, depending on which device viewers used to buy coins and any withdrawal fees.</li>
            <li><strong>Minimum withdrawal is $100.</strong> You need to accumulate at least $100 in diamonds before you can cash out.</li>
          </ul>
          <p>
            Example: If your viewers send you 100,000 diamonds in a month, that's $500 in diamond value — and you'd take home roughly $125–$175 after TikTok's cut, depending on your mission completion.
          </p>
        </div>

        <div className="section">
          <h2>How Agencies Get Paid — Not From You</h2>
          <p>
            This is one of the biggest questions creators have, and the answer is important: <span className="highlight">TJB Management does not take any percentage of your diamonds or earnings. Ever.</span>
          </p>
          <p>
            Here's how it actually works: TikTok has its own cut of the platform's gift revenue. When a creator joins an official TikTok creator network (agency), TikTok shares a portion of <em>their own cut</em> with the agency as compensation for growing and supporting creators on the platform. Your diamond payout is not reduced. Your earnings are not touched. The agency earns from TikTok directly — not from you.
          </p>
          <p>
            This is why joining a legitimate TikTok creator network is completely free and should never cost you a single dollar. If any agency asks you to pay fees or give up a percentage of your diamonds, that is <strong>not how official TikTok creator networks work</strong>.
          </p>
        </div>

        <div className="section">
          <h2>Exclusive Contests, Campaigns & Agency-Only Perks</h2>
          <p>
            One of the biggest advantages of being in an official TikTok creator network is access to programs and opportunities that TikTok only makes available to agency creators — not solo streamers. Here's what that looks like:
          </p>
          <ul>
            <li><strong>Agency tournaments & LIVE battles</strong> — TikTok runs exclusive competitions between agency creators where you can win cash prizes. These are not open to creators outside of official networks.</li>
            <li><strong>Diamond Incentive Programs</strong> — TikTok periodically runs bonus campaigns where agency creators can earn extra diamonds or cash rewards on top of their normal gift earnings by hitting specific streaming targets.</li>
            <li><strong>Brand campaigns</strong> — Because official creator networks are recognized TikTok partners, they get access to brand deals and sponsored campaigns that TikTok facilitates. Solo creators cannot be invited to these directly.</li>
            <li><strong>Monthly bonus programs</strong> — Some campaigns reward creators simply for streaming consistently, hitting hour targets, or growing their follower count during a campaign window.</li>
            <li><strong>Weekly challenges with cash prizes</strong> — Agency-run weekly contests where creators compete on diamonds earned, hours streamed, or viewer growth — with real money on the line.</li>
            <li><strong>TikTok HQ trips</strong> — Top-performing agency creators can be nominated for in-person visits to TikTok's offices, summits, and creator events. This is an opportunity almost no solo creator ever gets access to.</li>
            <li><strong>Traffic boosts</strong> — Agencies can advocate for creators to receive additional platform exposure, helping push your LIVE to more people on the For You Page.</li>
          </ul>
          <p>
            TJB Management actively submits creators for every eligible campaign and contest. The more consistently you stream and grow, the more opportunities we can put you in front of.
          </p>
        </div>

        <div className="section">
          <h2>TikTok LIVE Subscriptions</h2>
          <p>
            Beyond one-time gifts, TikTok has a monthly subscription feature that lets your most loyal fans support you on a recurring basis. Here's what it includes:
          </p>
          <ul>
            <li><strong>Monthly support payments</strong> — fans pay a set monthly fee to subscribe to your LIVE</li>
            <li><strong>Subscriber badges</strong> — your subscribers get a badge next to their name in your LIVE chat so you can recognize them</li>
            <li><strong>Custom emotes</strong> — subscribers get access to exclusive emotes only they can use in your stream</li>
            <li><strong>Subscriber-only content</strong> — you can post subscriber-only videos and offer exclusive LIVE access to subscribers</li>
            <li><strong>Priority in chat</strong> — subscribers stand out so you never miss them in a busy LIVE</li>
          </ul>
          <p>
            LIVE subscriptions give you a more stable, predictable income on top of your gift earnings. As an agency creator, your manager can help you build a subscription strategy to turn one-time viewers into long-term fans.
          </p>
        </div>

        <div className="section">
          <h2>Creator Tiers</h2>
          <p>The more you stream and grow, the more perks you unlock. Here's how the tiers work:</p>
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
            * To qualify for agency perks, you need to: stream at least 10 days a month (1+ hour each time), hit 15 total LIVE hours a month, and earn at least 10,000 diamonds a month. Which perks you get depends on your tier.
          </p>
        </div>

        <div className="section">
          <h2>What Managers Can See</h2>
          <p>
            When you join TJB Management, your managers will be able to see some of your TikTok LIVE stats through TikTok's official agency dashboard. This is what lets us coach you, protect your account, and fight for you when something goes wrong. Here's what your manager can see:
          </p>
          <ul>
            <li><strong>LIVE replays</strong> — managers can review past streams</li>
            <li><strong>LIVE analytics</strong> — how your streams are doing right now and how they've done in the past</li>
            <li><strong>Current violations</strong> — any warnings or strikes currently on your account</li>
            <li><strong>Violation clips</strong> — the exact moment from your stream that caused each violation</li>
            <li><strong>Diamond count</strong> — your total diamonds earned</li>
            <li><strong>LIVE time</strong> — your total hours streamed</li>
            <li><strong>Follower count</strong></li>
            <li><strong>Like count</strong></li>
            <li><strong>Number of videos posted</strong></li>
          </ul>
          <p>
            We only use this info to help you grow, catch violations we can fix for you, and get you into agency events and opportunities.
          </p>
        </div>

        <div className="section">
          <h2>Ban Appeals</h2>
          <p>
            Getting banned on TikTok LIVE is stressful — but as an agency creator, you don't have to fight it alone. Here's how it works:
          </p>
          <ul>
            <li><strong>First, you appeal through TikTok directly.</strong> TikTok gives creators 30 days from the date of any enforcement action to submit an appeal inside the app.</li>
            <li><strong>If your appeal gets denied, we step in.</strong> Your TJB Management manager may be able to submit a second appeal on your behalf through TikTok's official agency channels — <span className="highlight">if they believe it has a real shot at being overturned</span>. This is something solo creators cannot do on their own.</li>
            <li><strong>Not every ban can be appealed twice.</strong> Some violations are final regardless of who submits the appeal. Your manager will be straight with you about whether a second appeal is worth pursuing.</li>
            <li><strong>We also watch for violations before they become bans.</strong> Because your manager can see your current warnings and strikes in real time, they can flag issues early and help you course correct before things escalate.</li>
          </ul>
        </div>

        <div className="section">
          <h2>Agency Eligibility & Leaving</h2>
          <p>To be eligible to join TJB Management, you must meet all of the following:</p>
          <ul>
            <li>You are <span className="highlight">not currently signed to another agency</span> on this account or any account</li>
            <li>You haven't earned more than <span className="highlight">500,000 diamonds</span> this month, or in any of the last 5 months</li>
            <li>You are located in the <span className="highlight">United States or Canada</span></li>
          </ul>
          <ul>
            <li>When you first join, you are placed on a <span className="highlight">15-day trial period</span>. During this time, you can leave immediately with no waiting period.</li>
            <li>After the trial ends, you can still leave at any time — however, it'll take <span className="highlight">30 days</span> for you to officially leave the agency.</li>
            <li>If you leave after the 15-day trial, after those 30 days are up, you'll need to wait an additional <span className="highlight">60 days</span> before any other agency can sign you (as long as you still meet their requirements).</li>
            <li><strong>Breaking the Rules:</strong> If you break any TJB Management rules or guidelines, TJB Management can <span className="highlight">remove you from the agency immediately, at any time, for any reason</span> — with no waiting period.</li>
          </ul>
        </div>

        <div className="section">
          <h2>It Costs You Nothing</h2>
          <p>
            Joining TJB Management is completely free — no fees, no contracts, no catches. There's nothing to lose and everything to gain. All we ask is that you show up and stream consistently.
          </p>
        </div>

        <a href="https://www.tiktok.com/t/ZTkgQvTCb/" target="_blank" rel="noopener noreferrer" className="cta-btn">Apply to Join TJB Management →</a>

        <div className="footer">
          <p>© 2026 Tyler J. Beasley. All rights reserved. TJB Management Inc. and this website belong to TJB Management Inc. and can't be copied or reused without written permission.</p>
          <p>TikTok and the TikTok logo are the property of TikTok US Data Security Joint Venture LLC. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
