'use client';

import { useState, useEffect } from 'react';

export default function StreamingBasics() {
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

        <h1>Streaming Basics</h1>
        <p className="subtitle">Everything you need to know about TikTok LIVE before you go live for the first time.</p>

        <div className="section">
          <h2>How to Go LIVE on TikTok</h2>
          <p>Going LIVE on TikTok is straightforward once your account is eligible. Here's how to start your first stream:</p>
          <ul>
            <li><strong>Step 1 — Open the TikTok camera.</strong> Tap the <span className="highlight">+</span> button at the bottom of the screen.</li>
            <li><strong>Step 2 — Swipe to LIVE.</strong> Swipe along the bottom options until you see <span className="highlight">LIVE</span>. If you don't see it, your account may not be eligible yet — you need to be 18+ and meet TikTok's account standing requirements.</li>
            <li><strong>Step 3 — Set a title and topic.</strong> Give your stream a short title and pick a category. Both help TikTok surface your LIVE to the right viewers.</li>
            <li><strong>Step 4 — Go live.</strong> Tap <span className="highlight">Go LIVE</span>. To end, tap the <span className="highlight">X</span> in the corner and confirm.</li>
          </ul>
        </div>

        <div className="section">
          <h2>What You Need to Stream</h2>
          <p>You don't need expensive equipment to start. Here's what actually matters:</p>
          <ul>
            <li><strong>Good lighting.</strong> A ring light or a window facing you makes the biggest difference. Avoid bright light behind you.</li>
            <li><strong>A stable internet connection.</strong> Use Wi-Fi — not mobile data.</li>
            <li><strong>A phone with a decent front camera.</strong> Most modern phones are fine. No separate camera needed to start.</li>
            <li><strong>A quiet environment.</strong> Clear audio keeps viewers around.</li>
            <li><strong>A phone stand or tripod.</strong> A $10 stand beats holding your phone the whole time.</li>
          </ul>
        </div>

        <div className="section">
          <h2>How TikTok LIVE Gifts Work</h2>
          <p>When you go LIVE, your viewers can send you virtual gifts as a way to show support. Here's exactly how it works:</p>
          <ul>
            <li><strong>Step 1 — Viewers buy TikTok Coins.</strong> Coins are TikTok's in-app currency. Buying through the app (via Apple or Google) costs roughly <span className="highlight">65 coins per $1</span>. Buying at <a href="https://www.tiktok.com/coin/" target="_blank" rel="noopener noreferrer" style={{color:'#a855f7'}}>tiktok.com/coin</a> gets around <span className="highlight">95 coins per $1</span> — about 30% cheaper since it skips app store fees.</li>
            <li><strong>Step 2 — They spend coins on gifts.</strong> Gifts range from a Rose (<span className="highlight">1 coin</span>) all the way up to the Universe (<span className="highlight">44,999 coins</span> — the most expensive gift on the platform). Every gift has a coin cost the viewer pays upfront.</li>
            <li><strong>Step 3 — Gifts become Diamonds for you.</strong> TikTok converts each gift into Diamonds at roughly half the coin value — so a 1,000 coin Galaxy gives you ~500 diamonds. Each diamond is worth <span className="highlight">$0.01</span>, multiplied by your <span className="highlight">Scaled LIVE Rewards percentage</span> (up to 53%). See <em>How Much Are Your Diamonds Worth</em> below for the full breakdown.</li>
            <li><strong>Step 4 — You get paid.</strong> Before your first payout, you need to submit your tax information and link a PayPal account to TikTok — this is a one-time setup. After that, TikTok automatically sends your diamond earnings every <span className="highlight">Wednesday</span>. The minimum payout is <span className="highlight">$1 USD</span>. You must be <span className="highlight">18 or older</span> to receive earnings.</li>
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
          <h2>TikTok Super Fan & Subscriptions</h2>
          <p>
            In September 2025, TikTok split what used to be called "LIVE Subscription" into two separate products:
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
            <li>You set your own monthly price from <span className="highlight">$2.99 to $99.99</span> (default <span className="highlight">$5.99</span>)</li>
            <li>Subscribers get access to <strong>subscriber-only posts, videos, and notes</strong></li>
            <li>Exclusive badges, stickers, and custom emotes in your streams</li>
            <li>Subscriber-only chat access</li>
            <li>US creators keep up to <strong>90% of subscription revenue</strong> if you meet eligibility thresholds</li>
            <li>To unlock: 18+, at least <span className="highlight">1,000 followers</span>, active on LIVE in the past 28 days</li>
          </ul>
        </div>

        <div className="section">
          <h2>Fan Club</h2>
          <p>
            Fan Club is <strong>free for viewers</strong> and separate from the paid Super Fan subscription. Viewers earn Fan Club membership by gifting you on LIVE — no subscription required.
          </p>
          <ul>
            <li><strong>Gift-based, not paid.</strong> Viewers accumulate Fan Club points every time they send you a gift. The more they gift, the higher their level.</li>
            <li><strong>Fan Club levels</strong> go from 1 upward. Higher-level members get a more prominent badge next to their name in your chat, which motivates them to keep gifting to grow their rank.</li>
            <li><strong>Super Fan shortcut.</strong> Viewers who pay for a Super Fan subscription <span className="highlight">automatically join your Fan Club</span> at a higher starting level than regular gifters.</li>
            <li><strong>Why it matters.</strong> Fan Club creates visible loyalty rankings in your chat. Viewers compete for top supporter status on their own.</li>
          </ul>
        </div>

        <div className="section">
          <h2>Gift Goals</h2>
          <p>
            Gift Goals let you set visible on-screen targets during your LIVE that your viewers work together to hit. When a goal is reached, TikTok plays a celebration animation on stream and shows the top 3 contributors. You can then reset the goal and run it again as many times as you want within the same stream.
          </p>
          <p>
            There are two types of goals you can set, and you can run up to <span className="highlight">4 at once</span> — 3 standard gift goals plus 1 gallery gift goal.
          </p>
          <p><strong>Standard Gift Goals — up to 3 at once</strong></p>
          <ul>
            <li><strong>Pick any gift from TikTok's catalog</strong> and set a quantity target. For example: 100 Roses, 1,000 Corns, 50 Galaxies. There are no fixed categories — you choose the gift and the number.</li>
            <li><strong>Write a description.</strong> Tell your viewers what you'll do when the goal is hit — a challenge, a game, a shoutout. This gives them a reason to participate.</li>
            <li><strong>Top 3 contributors are shown on screen</strong> when the goal completes. Viewers compete for that recognition, which drives more gifting.</li>
            <li><strong>Reset and repeat.</strong> Once a goal is hit, you can reset it and run it again in the same LIVE. Many creators cycle through goals multiple times per stream to keep the energy going.</li>
          </ul>
          <p><strong>Gallery Gift Goal — 1 at a time</strong></p>
          <ul>
            <li>Your <strong>Gift Gallery</strong> is a section of your profile with <span className="highlight">15 slots</span>, each representing a specific gift. Viewers can light up gallery slots by sending enough of that gift.</li>
            <li>You can set one of your gallery gifts as a LIVE Goal. The target is the quantity needed to <span className="highlight">light up that slot</span> on your gallery.</li>
            <li>When a viewer lights up a gallery slot, they earn <strong>Title Gifter</strong> status for that gift — a recognition badge — and earn <span className="highlight">1.5× points</span> toward your LIVE Fest ranking.</li>
            <li>Filling your gallery regularly is worth doing — TikTok reportedly pushes streams with active gallery gifting to more viewers.</li>
          </ul>
          <p><strong>Strategy tips:</strong></p>
          <ul>
            <li><strong>Use low-cost, high-quantity goals.</strong> A goal of 100 Roses (1 coin each) lets almost any viewer participate. Goals built around expensive gifts like Lions cut out most of your audience.</li>
            <li><strong>Use all 3 standard goal slots</strong> with different gifts so viewers can choose what to contribute.</li>
            <li><strong>Set goals before you go live</strong> — adding goals mid-stream on mobile can be tricky depending on your device.</li>
          </ul>
        </div>

        <div className="section">
          <h2>LIVE Battles (PK Battles)</h2>
          <p>
            LIVE Battles — also called PK Battles — are one of the <strong>highest-earning formats</strong> on TikTok LIVE. Two creators compete head-to-head in a split screen while their audiences battle it out by sending gifts.
          </p>
          <ul>
            <li><strong>How to start one.</strong> First, send a <span className="highlight">co-host request</span> to another creator while you're both live. Once they accept and you're in a co-host, you can then send a battle request. The battle lasts exactly <span className="highlight">5 minutes</span>.</li>
            <li><strong>How viewers participate.</strong> Viewers pick a side by sending gifts to their creator. The gift totals are visible on screen the whole time, creating a live competition your audience can influence in real time.</li>
            <li><strong>Whoever has more gifts at the end wins.</strong> Both creators keep their gift earnings regardless of the outcome.</li>
            <li><strong>Optional challenge.</strong> Some creators agree beforehand that the loser completes a challenge — a game, a dare, etc. This is optional, but it adds entertainment and gives viewers a reason to tune in.</li>
            <li><strong>Why battles earn more.</strong> The competitive format pushes viewers to gift more, and pulls both creators' audiences into one stream.</li>
          </ul>
        </div>

        <div className="section">
          <h2>TikTok LIVE Studio</h2>
          <p>
            TikTok LIVE Studio is TikTok's <strong>free desktop streaming app for Windows</strong>. It gives you OBS-style control over your stream without needing a third-party tool or a stream key.
          </p>
          <ul>
            <li><strong>Multi-camera and scenes.</strong> Switch between camera angles, add screen capture, overlays, and custom scenes — all without leaving TikTok's own software.</li>
            <li><strong>Built-in analytics.</strong> See viewer count, gift activity, and engagement data in real time while you stream.</li>
            <li><strong>Co-Host and Multi-Guest.</strong> LIVE Studio is the best environment for Co-Host (up to <span className="highlight">3 creators</span> on split screen with camera and audio) and Multi-Guest (up to <span className="highlight">5 viewers</span> joining by audio only).</li>
            <li><strong>Access requirement.</strong> Non-gaming creators need <span className="highlight">10,000 followers</span> to access LIVE Studio. Gaming creators have a separate pathway.</li>
          </ul>
        </div>

        <div className="section">
          <h2>What You're Not Allowed to Do on LIVE</h2>
          <p>Breaking TikTok's LIVE rules can pause your monetization or get your account banned. Here's what to avoid:</p>
          <ul>
            <li><strong>No aggressive gift begging.</strong> You can ask viewers to contribute to a gift goal or acknowledge gifts as they come in — what TikTok prohibits is constant, aggressive panhandling for gifts with no other content happening.</li>
            <li><strong>No sending people off TikTok.</strong> Sharing your phone number, email, Instagram, Snapchat, or any outside link during a LIVE is prohibited.</li>
            <li><strong>No pre-recorded or looping content.</strong> Your LIVE must be genuinely live. Playing recorded video while pretending to be live will get your account flagged.</li>
            <li><strong>No inactive streams.</strong> Going live and sitting there with no engagement — or walking away from the camera — violates TikTok's content standards.</li>
            <li><strong>No smoking, vaping, or drug use on stream.</strong></li>
            <li><strong>No NSFW content.</strong> Nudity, sexually suggestive content, or anything inappropriate for a general audience is not allowed.</li>
            <li><strong>No hate speech or harassment.</strong> This includes targeting people based on race, gender, religion, or any protected characteristic.</li>
          </ul>
          <p>Violations result in warnings first, then temporary bans from LIVE, then permanent removal for repeat or severe offenses.</p>
        </div>

        <a href="/agency" className="cta-btn">Learn About Joining TJB Management →</a>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
