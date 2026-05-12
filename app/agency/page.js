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
            <li>Access to our <strong>private, creator-only Discord community</strong></li>
            <li>Help getting <strong>more views, more diamonds, and more new fans</strong></li>
          </ul>
        </div>

        <div className="section">
          <h2>LIVE Battles (PK Battles)</h2>
          <p>
            LIVE Battles — also called PK Battles — are one of the highest-earning formats on TikTok LIVE. Two creators go head-to-head in a <span className="highlight">split-screen battle</span> while their audiences compete by sending gifts. Here's what to know:
          </p>
          <ul>
            <li><strong>How it works.</strong> First, send a co-host request to another creator while you're both live. Once they accept and you're in a co-host together, you can then send a battle request. If they accept, the battle starts — viewers pick a side by sending gifts, and a <span className="highlight">5-minute</span> timer counts down. Whoever has more gifts at the end wins.</li>
            <li><strong>Why it works.</strong> Battles drive massive viewer engagement. The competitive format makes viewers send more gifts than they normally would, and it pulls both creators' audiences into one stream — growing both accounts at the same time.</li>
            <li><strong>Agency advantages.</strong> Being in a creator network gives you a built-in pool of other creators to battle. TJB Management can connect you with agency partners for battles, and TikTok runs exclusive agency-versus-agency battle events with cash prizes on top of normal gift earnings.</li>
            <li><strong>Losing a battle.</strong> Some creators agree beforehand that the loser completes a challenge — a game, a dare, etc. Entirely optional.</li>
          </ul>
        </div>

        <div className="section">
          <h2>Gift Goals</h2>
          <p>
            Gift Goals let you set visible on-screen targets during your LIVE that viewers work together to hit. You can run up to <span className="highlight">4 goals at once</span> — 3 standard gift goals plus 1 gallery gift goal. When a goal is reached, TikTok plays a celebration animation and shows your top 3 contributors. You can reset and repeat goals as many times as you want in a single stream.
          </p>
          <ul>
            <li><strong>Standard goals — pick any gift, set any quantity.</strong> For example: 100 Roses, 1,000 Corns, 50 Galaxies. Use low-cost gifts so more viewers can participate. You can write a description of what you'll do when the goal is hit to give viewers a reason to contribute.</li>
            <li><strong>Gallery Gift Goal — lights up your Gift Gallery.</strong> Your Gift Gallery has <span className="highlight">15 slots</span> on your profile, each tied to a specific gift. Setting a gallery gift goal targets filling one of those slots. Viewers who light up a slot earn <strong>Title Gifter</strong> status and <span className="highlight">1.5× points</span> toward your LIVE Fest ranking.</li>
          </ul>
          <p>For a full breakdown, see the <a href="/streaming-basics" style={{color: '#a855f7'}}>Streaming Basics</a> page.</p>
        </div>

        <div className="section">
          <h2>How TikTok LIVE Gifts Work</h2>
          <p>Here's how gifts work from start to finish:</p>
          <ul>
            <li><strong>Step 1 — Viewers buy TikTok Coins.</strong> Coins are TikTok's in-app currency. Buying through the app (via Apple or Google) costs roughly <span className="highlight">65 coins per $1</span>. Buying at <a href="https://www.tiktok.com/coin/" target="_blank" rel="noopener noreferrer" style={{color:'#a855f7'}}>tiktok.com/coin</a> gets around <span className="highlight">95 coins per $1</span> — about 30% cheaper since it skips app store fees.</li>
            <li><strong>Step 2 — They spend coins on gifts.</strong> Gifts range from a Rose (<span className="highlight">1 coin</span>) all the way up to the Universe (<span className="highlight">44,999 coins</span> — the most expensive gift on the platform). Every gift has a coin cost the viewer pays upfront.</li>
            <li><strong>Step 3 — Gifts become Diamonds for you.</strong> When a viewer sends a gift, TikTok converts that gift into Diamonds deposited into your account. The number of diamonds you get is roughly <span className="highlight">half the coin value</span> of the gift.</li>
            <li><strong>Step 4 — You get paid.</strong> Before your first payout, you need to submit your tax information and link a PayPal account to TikTok — this is a one-time setup. After that, TikTok automatically sends your diamond earnings every <span className="highlight">Wednesday</span>. The minimum payout is <span className="highlight">$1 USD</span>.</li>
          </ul>
          <p>
            The most common gifts you'll see in streams: <strong>Rose</strong> (1 coin), <strong>Finger Heart</strong> (5 coins), <strong>Sunglasses</strong> (199 coins), <strong>Galaxy</strong> (1,000 coins), <strong>Lion</strong> (29,999 coins), and <strong>Universe</strong> (44,999 coins — the most expensive gift on the platform).
          </p>
        </div>

        <div className="section">
          <h2>How Much Are Your Diamonds Worth?</h2>
          <p>
            Each diamond has a base value of <span className="highlight">$0.01 USD</span>, but your actual payout depends on your rewards percentage. The formula is: <span className="highlight">diamonds × $0.01 × your rewards %</span>. For example, at a <span className="highlight">36.5% rewards rate</span>, 41,200 diamonds pays out <span className="highlight">$150.38</span>. The diamond count shown in your account is <strong>not</strong> your cash payout.
          </p>
          <p>
            <strong>Scaled LIVE Rewards</strong> is TikTok's mission-based payout system. Complete missions each LIVE and each week to raise your rewards percentage — the maximum is <span className="highlight">53%</span>.
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
          <h2>TikTok Super Fan & Subscriptions</h2>
          <p>
            In September 2025, TikTok split what used to be called "LIVE Subscription" into two separate products. Here's what each one is:
          </p>
          <p><strong>Super Fan (<span className="highlight">$9.99/month</span>) — LIVE focused</strong></p>
          <ul>
            <li><strong>Super Fan badge</strong> next to their name in your LIVE chat</li>
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
        </div>

        <div className="section">
          <h2>Fan Club</h2>
          <p>
            Fan Club is <strong>free for viewers</strong> and separate from the paid Super Fan subscription. Viewers earn membership and level up by gifting you on LIVE — no subscription required.
          </p>
          <ul>
            <li><strong>Fan Club levels.</strong> Levels go from 1 upward. Higher-level members get a more prominent badge in your chat, which motivates them to keep gifting to grow their rank.</li>
            <li><strong>Super Fan shortcut.</strong> Viewers who subscribe as a Super Fan <span className="highlight">automatically join your Fan Club</span> and start at a higher level than regular gifters — giving Super Fans extra recognition on top of their badge.</li>
            <li><strong>Why it matters.</strong> Fan Club creates a visible loyalty ranking in your chat that drives friendly competition and repeat gifting on its own.</li>
          </ul>
        </div>

        <div className="section">
          <h2>TikTok LIVE Studio</h2>
          <p>
            TikTok LIVE Studio is TikTok's <strong>free desktop streaming app for Windows</strong> — an alternative to OBS and Streamlabs built specifically for TikTok LIVE:
          </p>
          <ul>
            <li><strong>Multi-camera layouts.</strong> Switch between camera angles, add screen capture, picture-in-picture overlays, and custom scenes.</li>
            <li><strong>Built-in LIVE analytics.</strong> Viewer count, gift activity, and engagement data in real time.</li>
            <li><strong>Co-Host and Multi-Guest.</strong> LIVE Studio is where Co-Host (up to 3 other creators on split screen with camera and audio) and Multi-Guest (up to 5 viewers joining by audio only) work best.</li>
            <li><strong>Access requirement.</strong> Non-gaming creators need <span className="highlight">10,000 followers</span> to access LIVE Studio. Gaming creators have a separate pathway.</li>
            <li><strong>RTMP is different.</strong> Using OBS or Streamlabs requires the RTMP route — which requires being in an official creator network. LIVE Studio does not.</li>
          </ul>
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
            <li><strong>Not every ban can be appealed twice.</strong> Some violations are final regardless of who submits the appeal. Your manager will be straight with you about whether a second appeal is worth pursuing.</li>
            <li><strong>We also watch for violations before they become bans.</strong> Because your manager can see your current warnings and strikes in real time, they can flag issues early and help you course correct before things escalate.</li>
          </ul>
        </div>

        <div className="section">
          <h2>What You're Not Allowed to Do on LIVE</h2>
          <p>Breaking these rules can pause your monetization or get your account banned:</p>
          <ul>
            <li><strong>No aggressive gift begging.</strong> You can ask viewers to contribute to a gift goal or acknowledge gifts as they come in — what TikTok prohibits is constant, aggressive panhandling for gifts with no other content happening.</li>
            <li><strong>No copyrighted music.</strong> Playing music from the radio, TV, Spotify, or any source other than TikTok's own Commercial Music Library in the background of your stream can get you flagged. This includes music playing in the room behind you.</li>
            <li><strong>No sending people off TikTok.</strong> Sharing your personal phone number, email, Instagram, Snapchat, or any other contact info or outside link during a LIVE is prohibited.</li>
            <li><strong>No pre-recorded or looping videos.</strong> Your LIVE must be genuinely live. Playing a recorded video or looping content while pretending to be live will result in action taken against your account.</li>
            <li><strong>No inactive or unattended streams.</strong></li>
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
          <p>Here's how it works once you're accepted:</p>
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
            <li>You haven't averaged more than <span className="highlight">500,000 diamonds per month</span> in recent months</li>
            <li>You are located in the <span className="highlight">United States or Canada</span></li>
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
          <p>© 2026 Tyler J. Beasley. All rights reserved. TJB Management Inc. and this website belong to TJB Management Inc. and can't be copied or reused without written permission.</p>
          <p>TikTok and the TikTok logo are the property of TikTok US Data Security Joint Venture LLC. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
