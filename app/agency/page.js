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
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
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
            <li><strong>RTMP stream key access</strong> — As of 2025, the only way to stream on TikTok LIVE using professional software like OBS, Streamlabs, or Meld Studio is through an official creator network. There is no longer a follower count that unlocks this on its own. This alone is a reason many serious creators join an agency.</li>
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
          <h2>LIVE Battles (PK Battles)</h2>
          <p>
            LIVE Battles — also called PK Battles — are one of the highest-earning formats on TikTok LIVE. Two creators go head-to-head in a <span className="highlight">split-screen battle</span>, and their audiences compete by sending gifts. The creator with more gifts at the end wins. Here's what to know:
          </p>
          <ul>
            <li><strong>How it works.</strong> First, send a co-host request to another creator while you're both live. Once they accept and you're in a co-host together, you can then send a battle request. If they accept, the battle starts — viewers pick a side by sending gifts, and a <span className="highlight">5-minute</span> timer counts down. Whoever has more gifts at the end wins.</li>
            <li><strong>Why it works.</strong> Battles drive massive viewer engagement. The competitive format makes viewers send more gifts than they normally would, and it pulls both creators' audiences into one stream — growing both accounts at the same time.</li>
            <li><strong>Agency advantages.</strong> Being in a creator network gives you a built-in pool of other creators to battle. TJB Management can connect you with agency partners for battles, and TikTok runs exclusive agency-versus-agency battle events with cash prizes on top of normal gift earnings.</li>
            <li><strong>Losing a battle.</strong> The losing creator often has to complete a challenge set by the winner (a game, a dare, etc.). This is part of what makes battles entertaining — keep it fun and your audience will come back for more.</li>
          </ul>
        </div>

        <div className="section">
          <h2>Gift Goals</h2>
          <p>
            Gift Goals let you set visible targets on your LIVE screen that your audience can help you hit. You can run up to <span className="highlight">3 goals at once</span>, and when a goal is reached, it triggers a celebration effect on stream. Here's how creators use them:
          </p>
          <ul>
            <li><strong>Set a target.</strong> You choose a gift (like Roses) and a quantity (like "100 Roses"). The goal bar shows up on screen and updates in real time as viewers send that gift.</li>
            <li><strong>Offer a reward.</strong> You can promise something when the goal is hit — play a game, do a challenge, shout out the top 3 contributors. This gives viewers a reason to participate beyond just supporting you.</li>
            <li><strong>Top contributors.</strong> TikTok shows the top 3 gift contributors on screen when a goal is reached, which motivates viewers to compete for recognition.</li>
            <li><strong>Works alongside your normal LIVE.</strong> Gift Goals don't replace regular gifting — they stack on top of it. Viewers can still send any gift at any time.</li>
          </ul>
          <p>
            Gift Goals are one of the simplest tools for increasing your gift earnings per LIVE. Your manager can help you set goals that are realistic for your audience size and actually drive engagement.
          </p>
        </div>

        <div className="section">
          <h2>How TikTok LIVE Gifts Work</h2>
          <p>
            When you go LIVE on TikTok, your viewers can send you virtual gifts as a way to show support. Here's exactly how it works from start to finish:
          </p>
          <ul>
            <li><strong>Step 1 — Viewers buy TikTok Coins.</strong> Coins are TikTok's in-app currency. Roughly <span className="highlight">65–70 coins</span> costs viewers about <span className="highlight">$1 USD</span>, purchased directly through the TikTok app.</li>
            <li><strong>Step 2 — They spend coins on gifts.</strong> Gifts range from a Rose (<span className="highlight">1 coin</span>, about $0.01) all the way up to the Universe (<span className="highlight">44,999 coins</span>, worth over <span className="highlight">$560</span> to the sender). Every gift has a coin cost that the viewer pays.</li>
            <li><strong>Step 3 — Gifts become Diamonds for you.</strong> When a viewer sends a gift, TikTok converts that gift into Diamonds deposited into your account. The number of diamonds you get is roughly <span className="highlight">half the coin value</span> of the gift.</li>
            <li><strong>Step 4 — You get paid.</strong> TikTok automatically sends your diamond earnings every <span className="highlight">Wednesday</span>. The minimum payout is <span className="highlight">$1 USD</span>.</li>
          </ul>
          <p>
            The most common gifts you'll see in streams: <strong>Rose</strong> (1 coin), <strong>Finger Heart</strong> (5 coins), <strong>Sunglasses</strong> (199 coins), <strong>Galaxy</strong> (1,000 coins), <strong>Lion</strong> (29,999 coins), and <strong>Universe</strong> (44,999 coins — the biggest gift on the platform).
          </p>
        </div>

        <div className="section">
          <h2>How Much Are Your Diamonds Worth?</h2>
          <p>
            Each diamond has a base value of <span className="highlight">$0.01 USD</span>, but that doesn't mean you get $0.01 for every diamond — your actual payout depends on your rewards percentage. The formula is: <span className="highlight">diamonds × $0.01 × your rewards %</span>. For example, at a <span className="highlight">36.5% rewards rate</span>, 41,200 diamonds pays out <span className="highlight">$150.38</span>. The old flat rate was 50%, which is where the "$0.005 per diamond" figure came from — but that rate no longer applies for most creators under Scaled LIVE Rewards. The diamond count shown in your account is <strong>not</strong> your cash payout — you have to factor in your current rewards percentage.
          </p>
          <ul>
            <li><strong>TikTok sends your earnings automatically every Wednesday.</strong> You don't manually request anything — TikTok processes and sends your diamond earnings to you on Wednesdays. The minimum payout is <span className="highlight">$1 USD</span>.</li>
            <li><strong>You must be 18 or older to go LIVE and receive earnings.</strong> TikTok requires creators to be at least 18 to host a LIVE stream and to receive any gift payouts.</li>
          </ul>
          <p>
            <strong>Scaled LIVE Rewards:</strong> TikTok replaced the old flat 50% payout rate with a mission-based system. Your total payout is now: <span className="highlight">diamonds collected × your rewards percentage</span>. The rewards percentage is determined by how well you complete missions each LIVE and each week — and the maximum you can earn is <span className="highlight">53%</span> (up from the old 50% flat rate).
          </p>
          <p><strong>Per-LIVE Missions — up to 40% of that LIVE's diamonds:</strong></p>
          <ul>
            <li><strong>LIVE duration</strong> — the longer your stream, the higher your percentage for that LIVE</li>
            <li><strong>New followers</strong> — gaining new followers during your LIVE increases your rate</li>
            <li><strong>Content quality</strong> — TikTok evaluates the quality of your stream in real time</li>
          </ul>
          <p><strong>Weekly Missions — up to 13% of your weekly diamonds:</strong></p>
          <ul>
            <li><strong>Valid go LIVE days</strong> — you must stream at least <span className="highlight">25 minutes</span> total for a day to count. 1 valid day = <span className="highlight">6%</span>, 2 or more valid days = <span className="highlight">8%</span></li>
            <li><strong>Content engagement</strong> — measured by your active fans that week. 10+ active fans = <span className="highlight">1%</span>, 100+ = <span className="highlight">1.5%</span>, 2,000+ = <span className="highlight">2%</span></li>
            <li><strong>Creator League</strong> — earn <span className="highlight">+1%</span> if you're in the A1–A3 leagues and don't drop below where you started the week, or <span className="highlight">+3%</span> if you surpass your personal best league ranking. Capped at <span className="highlight">$1,000/week</span>.</li>
          </ul>
          <p>
            The more consistently you stream and hit targets, the closer you get to that 53% rate. Creators who don't complete missions earn less than the old flat 50% rate — which is why having a manager coach you on mission strategy makes a real difference to your actual take-home pay.
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
            <li><strong>Brand campaigns</strong> — TikTok gives official creator networks access to <span className="highlight">exclusive brand deals and sponsored campaigns</span> that are not made available to solo creators outside of a network.</li>
            <li><strong>Monthly bonus programs</strong> — Some campaigns reward creators simply for streaming consistently, hitting hour targets, or growing their follower count during a campaign window.</li>
            <li><strong>TikTok HQ trips</strong> — Top-performing agency creators can be nominated for in-person visits to TikTok's offices, summits, and creator events. This is an opportunity almost no solo creator ever gets access to.</li>
            <li><strong>Traffic boosts</strong> — Agencies can advocate for creators to receive additional platform exposure, helping push your LIVE to more people on the For You Page.</li>
          </ul>
          <p>
            TJB Management actively submits creators for every eligible campaign and contest. The more consistently you stream and grow, the more opportunities we can put you in front of.
          </p>
        </div>

        <div className="section">
          <h2>TikTok Super Fan & Subscriptions</h2>
          <p>
            In September 2025, TikTok split what used to be called "LIVE Subscription" into two separate products. Here's what each one is:
          </p>
          <p><strong>Super Fan (<span className="highlight">$9.99/month</span>) — LIVE focused</strong></p>
          <ul>
            <li>Your most dedicated fans pay <span className="highlight">$9.99/month</span> to become a Super Fan</li>
            <li>They get a <strong>Super Fan badge</strong> next to their name in your LIVE chat</li>
            <li>Special <strong>entrance effects</strong> when they join your stream</li>
            <li>Access to <strong>Super Fan-only LIVEs</strong> and <strong>Super Fan-only chat</strong></li>
            <li>Automatic Fan Club membership and faster Fan Club level-up</li>
            <li>As a US creator, you keep up to <strong>90% of Super Fan revenue</strong> (70% base + up to 20% performance bonus)</li>
          </ul>
          <p><strong>Subscriptions (<span className="highlight">$2.99–$99.99/month</span>) — content focused</strong></p>
          <ul>
            <li>You set your own monthly price anywhere from <span className="highlight">$2.99 to $99.99</span> (default is <span className="highlight">$5.99</span>)</li>
            <li>Subscribers get access to <strong>subscriber-only posts, videos, and notes</strong> you create</li>
            <li>Exclusive badges, stickers, and custom emotes in your streams</li>
            <li>Subscriber-only chat access</li>
            <li>US creators keep up to <strong>90% of subscription revenue</strong> if you meet the eligibility thresholds</li>
            <li>To unlock: you need to be 18+, have at least 1,000 followers, and have been active on LIVE in the past 28 days</li>
          </ul>
          <p>
            Both of these are separate income streams on top of your gift earnings. Together, they give you three ways to earn: one-time gifts, Super Fan monthly support, and subscriptions.
          </p>
        </div>

        <div className="section">
          <h2>Fan Club</h2>
          <p>
            Fan Club is <strong>separate from Super Fan</strong> and completely free for viewers to join. Viewers earn Fan Club membership by sending you gifts — no paid subscription required. Here's how it works:
          </p>
          <ul>
            <li><strong>Gift-based, not paid.</strong> Viewers accumulate Fan Club points by gifting you on LIVE. The more they gift, the higher their Fan Club level.</li>
            <li><strong>Fan Club levels.</strong> Levels go from 1 upward. Higher-level Fan Club members get a more prominent badge next to their name in your chat, which motivates them to keep gifting to maintain or grow their rank.</li>
            <li><strong>Super Fan shortcut.</strong> Viewers who subscribe as a Super Fan <span className="highlight">automatically join your Fan Club</span> and start at a higher level than regular gifters — giving Super Fans extra recognition on top of their badge.</li>
            <li><strong>Why it matters.</strong> Fan Club creates a visible loyalty ranking in your chat. Viewers can see who your top supporters are, which drives friendly competition and repeat gifting without you having to say a word.</li>
          </ul>
        </div>

        <div className="section">
          <h2>TikTok LIVE Studio</h2>
          <p>
            TikTok LIVE Studio is TikTok's <strong>free desktop streaming app for Windows</strong>. It's an alternative to OBS and Streamlabs built specifically for TikTok LIVE, with features designed around the platform's format:
          </p>
          <ul>
            <li><strong>Multi-camera layouts.</strong> Switch between multiple camera angles, add screen capture, picture-in-picture overlays, and custom scenes — all without third-party software.</li>
            <li><strong>Built-in LIVE analytics.</strong> See your viewer count, gift activity, and engagement data in real time while you stream, without switching to another app.</li>
            <li><strong>Co-Host and Multi-Guest.</strong> LIVE Studio is where Co-Host (up to 3 other creators on split screen with camera and audio) and Multi-Guest (up to 5 viewers joining by audio only) work best.</li>
            <li><strong>Access requirement.</strong> Non-gaming creators need <span className="highlight">10,000 followers</span> to access LIVE Studio. Gaming creators have a separate pathway.</li>
            <li><strong>RTMP is different.</strong> LIVE Studio is TikTok's own app and doesn't require a stream key. If you want to use OBS or Streamlabs, that's the RTMP route — which requires being in an official creator network.</li>
          </ul>
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
            * To qualify for agency perks, you need to: stream at least <span className="highlight">10 days a month</span> (1+ hour each time), hit <span className="highlight">15 total LIVE hours a month</span>, and earn at least <span className="highlight">10,000 diamonds a month</span>. Which perks you get depends on your tier.
          </p>
          <p><strong>TikTok LIVE Pro</strong> — Separate from agency tiers, TikTok has its own official creator status called <strong>LIVE Pro</strong>. TikTok awards it to top-performing LIVE creators based on factors like diamonds earned and viewership. When you earn it, TikTok gives you a LIVE Pro badge that shows on your profile and during your streams. It is one of the rarest distinctions TikTok awards to LIVE creators.</p>
          <p><strong>Creator League</strong> — Part of TikTok's Scaled LIVE Rewards weekly missions. Leagues are ranked from D5 (entry level) up through C, B, and A tiers, with A1 being the highest rank. If you finish the week in the A1–A3 league without dropping below where you started, you earn +1% on your weekly rewards. If you surpass your personal best league ranking, you earn +3%. The Creator League mission is capped at $1,000/week.</p>
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
          <h2>Creator Health Rating</h2>
          <p>
            In January 2026, TikTok replaced its old violation-points system with the <strong>Creator Health Rating</strong> — a score from <span className="highlight">0 to 1,000</span> that reflects how well your account follows TikTok's guidelines. Every creator starts at <span className="highlight">200</span>. Here's what you need to know:
          </p>
          <ul>
            <li><strong>Points drop for violations.</strong> Every policy violation reduces your score. How much depends on severity — minor infractions take fewer points than serious ones.</li>
            <li><strong>Points recover over time.</strong> TikTok rewards consistent, compliant behavior. You can also complete in-app policy quizzes to speed up recovery.</li>
            <li><strong>Below 150 triggers enforcement.</strong> If your score drops below <span className="highlight">150</span>, TikTok begins taking action against your account — starting with restrictions and escalating from there.</li>
            <li><strong>Agencies have their own score too.</strong> Creator networks maintain a compliance score from 0–100 based on their creators' collective behavior. Your conduct reflects on the agency, and the agency's standing affects what TikTok makes available to all creators in the network.</li>
            <li><strong>Why this matters for you.</strong> This is one more reason your manager watches for violations in real time. Catching a potential violation early protects your score — and by extension, your access to monetization and agency programs.</li>
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
            <li><strong>Not every ban can be appealed twice.</strong> Some violations are final regardless of who submits the appeal. Your manager will be straight with you about whether a second appeal is worth pursuing.</li>
            <li><strong>We also watch for violations before they become bans.</strong> Because your manager can see your current warnings and strikes in real time, they can flag issues early and help you course correct before things escalate.</li>
          </ul>
        </div>

        <div className="section">
          <h2>What You're Not Allowed to Do on LIVE</h2>
          <p>
            TikTok enforces its LIVE rules strictly, and breaking them can get your monetization paused or your account banned. Your manager will help you stay clean, but here's what to know upfront:
          </p>
          <ul>
            <li><strong>No asking for gifts.</strong> Telling your viewers to send you roses, diamonds, or any gift is against TikTok's rules. You can acknowledge gifts after they're sent — you just can't ask for them.</li>
            <li><strong>No copyrighted music.</strong> Playing music from the radio, TV, Spotify, or any source other than TikTok's own Commercial Music Library in the background of your stream can get you flagged. This includes music playing in the room behind you.</li>
            <li><strong>No sending people off TikTok.</strong> Sharing your personal phone number, email, Instagram, Snapchat, or any other contact info or outside link during a LIVE is prohibited.</li>
            <li><strong>No pre-recorded or looping videos.</strong> Your LIVE must be genuinely live. Playing a recorded video or looping content while pretending to be live will result in action taken against your account.</li>
            <li><strong>No inactive streams.</strong> Going live and just sitting there with no real engagement — or setting up a camera and walking away — violates TikTok's LIVE content standards.</li>
            <li><strong>No smoking, vaping, or drug use on stream.</strong></li>
            <li><strong>No NSFW content.</strong> Nudity, sexually suggestive content, or anything that would be inappropriate for a general audience is not allowed on TikTok LIVE.</li>
            <li><strong>No hate speech or harassment.</strong> This includes targeting people based on race, gender, religion, or any other protected characteristic.</li>
          </ul>
          <p>
            Violations result in warnings first, then temporary bans from LIVE, then permanent removal from the platform for repeat or severe offenses.
          </p>
        </div>

        <div className="section">
          <h2>How to Join TJB Management</h2>
          <p>Here's exactly how the process works once you apply and get accepted:</p>
          <ul>
            <li><strong>Step 1 — Apply.</strong> Tap the button below and fill out the application. Tyler reviews every application personally.</li>
            <li><strong>Step 2 — Get your invite code.</strong> If you're accepted, Tyler or Hallie will reach out with your invite code via TikTok DM. Make sure your DMs are open.</li>
            <li><strong>Step 3 — Enter the code in TikTok.</strong> Open TikTok → Profile → Settings → TikTok Studio → LIVE Center → Creator Network Center → More Details. Enter your code there and accept the invitation.</li>
            <li><strong>Step 4 — Your 15-day trial starts.</strong> You're officially in. During the first 15 days, you can leave at any time with no waiting period if it's not for you.</li>
            <li><strong>Step 5 — Get to work.</strong> Your manager will reach out to go over your goals, set up your strategy, and get you plugged into the network.</li>
          </ul>
        </div>

        <div className="section">
          <h2>Agency Eligibility & Leaving</h2>
          <p>To be eligible to join TJB Management, you must meet all of the following:</p>
          <ul>
            <li>You are <span className="highlight">not currently signed to another agency</span> on this account or any account</li>
            <li>You haven't averaged more than <span className="highlight">500,000 diamonds per month</span> in recent months — TJB Management focuses on growth-stage creators who will benefit most from the agency's support</li>
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
