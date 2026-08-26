'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function StreamingBasics() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcDiamonds, setCalcDiamonds] = useState('');
  const [calcRate, setCalcRate] = useState('36.5');

  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
        else entry.target.classList.remove('visible');
      });
    }, { threshold: 0.1 });
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>

      <div className="fade-top"></div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
        <a href="/contact-agency" onClick={() => setMenuOpen(false)}>Connect with Agency</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Connect with Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Connect with Hallie</a>
        <a href="/hallie/tiktok-moderation/system" onClick={() => setMenuOpen(false)}>Hallie™ TikTok Moderation System</a>
        <a href="/merch" onClick={() => setMenuOpen(false)}>Merch</a>
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/tiktok-guidelines" onClick={() => setMenuOpen(false)}>TikTok Guidelines</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>

        <h1>Streaming Basics</h1>
        <p className="subtitle">Everything you need to know about TikTok LIVE before you go live for the first time.</p>

        <div className="toc">
          <p>Jump to a section:</p>
          <div className="toc-links">
            <a href="#how-to-go-live">How to Go LIVE</a>
            <a href="#discovery">How Viewers Find You</a>
            <a href="#what-you-need">Equipment</a>
            <a href="#visuals">Visual Setup</a>
            <a href="#gifts">How Gifts Work</a>
            <a href="#diamonds">Diamond Value</a>
            <a href="#super-fan">Super Fan</a>
            <a href="#fan-club">Fan Club</a>
            <a href="#gift-goals">Gift Goals</a>
            <a href="#battles">LIVE Battles</a>
            <a href="#match">Co-Host & Match</a>
            <a href="#live-studio">LIVE Studio</a>
            <a href="#stream-tips">Stream Tips</a>
            <a href="#rules">Rules</a>
          </div>
        </div>

        <div className="section" id="how-to-go-live">
          <h2>How to Go LIVE on TikTok</h2>
          <p>Going LIVE on TikTok is straightforward once your account is eligible. Here's how to start your first stream:</p>
          <ul>
            <li><strong>Step 1 — Open the TikTok camera.</strong> Tap the <span className="highlight">+</span> button at the bottom of the screen.</li>
            <li><strong>Step 2 — Swipe to LIVE.</strong> Swipe along the bottom options until you see <span className="highlight">LIVE</span>. If you don't see it, your account may not be eligible yet — you need to be 18+ and meet TikTok's account standing requirements.</li>
            <li><strong>Step 3 — Set a title and topic.</strong> Give your stream a short title and pick a category. Both help TikTok surface your LIVE to the right viewers.</li>
            <li><strong>Step 4 — Go live.</strong> Tap <span className="highlight">Go LIVE</span>. To end, tap the <span className="highlight">X</span> in the corner and confirm.</li>
          </ul>
        </div>

        <div className="section" id="discovery">
          <h2>How Viewers Find Your LIVE</h2>
          <p>Viewers reach your LIVE through a few different pathways — each one is a possible arrival point, not a guarantee of reach:</p>
          <ul>
            <li><strong>Followers.</strong> People who already know you.</li>
            <li><strong>LIVE Feed.</strong> People actively browsing LIVE content.</li>
            <li><strong>For You.</strong> Potential new audiences TikTok surfaces you to.</li>
            <li><strong>Shares.</strong> Your community brings people in when they share your LIVE.</li>
            <li><strong>Profile + Search.</strong> Other surfaces on the app that can create entry points.</li>
          </ul>
          <p>Getting discovered is only half of it — the better question is: <strong>what happens when a new viewer arrives?</strong> A stream with nothing structured going on gives them no reason to stay. That's what Co-Host and Match (below) are for.</p>
        </div>

        <div className="section" id="what-you-need">
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

        <div className="section" id="visuals">
          <h2>Make Your LIVE Easy to Watch</h2>
          <p>TikTok doesn't publish one exact visual recipe that guarantees traffic — but it consistently rewards streams that are clear over streams that are just polished. <strong>Don't chase aesthetics. Chase viewer response.</strong></p>
          <p><strong>What the platform actually looks for:</strong></p>
          <ul>
            <li><strong>Attention</strong> — is the subject immediately clear?</li>
            <li><strong>Trust</strong> — can viewers clearly see you or the subject?</li>
            <li><strong>Friction</strong> — is the screen easy to understand quickly?</li>
            <li><strong>Interaction</strong> — can viewers see the next action to take?</li>
          </ul>
          <p>Good visual doesn't mean expensive visual — <strong>good visual means a clear viewer experience.</strong></p>
          <p><strong>The 5-second test.</strong> A new viewer scrolling in decides almost instantly whether to stay. Ask yourself three questions every time you go LIVE:</p>
          <ul>
            <li><strong>Who am I watching?</strong> Make the creator or subject easy to recognize.</li>
            <li><strong>What are they doing?</strong> Make the activity or moment immediately visible.</li>
            <li><strong>Why should I stay?</strong> Give viewers a clear reason to keep watching or join in.</li>
          </ul>
          <p>A <strong>strong</strong> visual is creator + activity + context, all visible at once. A <strong>weak</strong> visual is a dark screen, a tiny creator in frame, and unclear activity.</p>
          <p><strong>Quick clarity checklist:</strong></p>
          <ul>
            <li><strong>Lighting.</strong> Even light on your face or subject — not too dark, not backlit.</li>
            <li><strong>Camera.</strong> Positioned near eye level when appropriate, not sitting too low.</li>
            <li><strong>Background.</strong> Tidy or intentionally styled, with a clear focal point instead of clutter.</li>
            <li><strong>Framing.</strong> The main subject is easy to pick out at a glance.</li>
            <li><strong>Interaction.</strong> Look at the camera and respond — a screen that reacts feels active, not static.</li>
          </ul>
        </div>

        <div className="section" id="gifts">
          <h2>How TikTok LIVE Gifts Work</h2>
          <p>When you go LIVE, your viewers can send you virtual gifts as a way to show support. Here's exactly how it works:</p>
          <ul>
            <li><strong>Step 1 — Viewers buy TikTok Coins.</strong> Coins are TikTok's in-app currency. Buying through the app (via Apple or Google) costs roughly <span className="highlight">65 coins per $1</span>. Buying at <a href="https://www.tiktok.com/coin/" target="_blank" rel="noopener noreferrer" className="coin-link">tiktok.com/coin</a> gets around <span className="highlight">95 coins per $1</span> — about 30% cheaper since it skips app store fees.</li>
            <li><strong>Step 2 — They spend coins on gifts.</strong> Gifts range from a Rose (<span className="highlight">1 coin</span>) all the way up to the Universe (<span className="highlight">44,999 coins</span> — the most expensive gift on the platform). Every gift has a coin cost the viewer pays upfront.</li>
            <li><strong>Step 3 — Gifts become Diamonds for you.</strong> TikTok converts each gift into Diamonds at roughly half the coin value — so a 1,000 coin Galaxy gives you ~500 diamonds. Each diamond is worth <span className="highlight">$0.01</span>, multiplied by your <span className="highlight">Scaled LIVE Rewards percentage</span> (up to 53%). See <em>How Much Are Your Diamonds Worth</em> below for the full breakdown.</li>
            <li><strong>Step 4 — You get paid.</strong> Before your first payout, you need to submit your tax information and link a PayPal account to TikTok — this is a one-time setup. After that, TikTok automatically sends your diamond earnings every <span className="highlight">Wednesday</span>. The minimum payout is <span className="highlight">$1 USD</span>. You must be <span className="highlight">18 or older</span> to receive earnings.</li>
          </ul>
          <p>
            The most common gifts you'll see in streams: <strong>Rose</strong> (1 coin), <strong>Finger Heart</strong> (5 coins), <strong>Sunglasses</strong> (199 coins), <strong>Galaxy</strong> (1,000 coins), <strong>Lion</strong> (29,999 coins), and <strong>Universe</strong> (44,999 coins — the most expensive gift on the platform).
          </p>
        </div>

        <div className="section" id="diamonds">
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
          <div className="calculator">
            <div className="calc-row">
              <label>Your diamond count</label>
              <input
                type="number"
                value={calcDiamonds}
                onChange={e => setCalcDiamonds(e.target.value)}
                placeholder="e.g. 41200"
                min="0"
              />
            </div>
            <div className="calc-row">
              <label>Rewards rate (%)</label>
              <input
                type="number"
                value={calcRate}
                onChange={e => setCalcRate(e.target.value)}
                placeholder="e.g. 36.5"
                step="0.5"
                min="0"
                max="53"
              />
            </div>
            {calcDiamonds && calcRate && (
              <div className="calc-result">
                Estimated payout: <span>${(parseFloat(calcDiamonds) * 0.01 * (parseFloat(calcRate) / 100)).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="section" id="super-fan">
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

        <div className="section" id="fan-club">
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

        <div className="section" id="gift-goals">
          <h2>Gift Goals</h2>
          <p>
            Gift Goals let you set visible on-screen targets during your LIVE that viewers work together to hit. You can run up to <span className="highlight">4 goals at once</span> — 3 standard gift goals plus 1 gallery gift goal. When a goal is reached, TikTok plays a celebration animation and shows your top 3 contributors. You can reset and repeat goals as many times as you want in a single stream.
          </p>
          <p><strong>Standard Goals — up to 3 at once</strong></p>
          <ul>
            <li><strong>Pick any gift, set any quantity.</strong> For example: 100 Roses, 1,000 Corns, 50 Galaxies. Use low-cost gifts so more viewers can participate — goals built around expensive gifts like Lions cut out most of your audience.</li>
            <li><strong>Write a description.</strong> Tell viewers what you'll do when the goal is hit — a challenge, a game, a shoutout. Give them a reason to contribute.</li>
            <li><strong>Top 3 contributors are shown on screen</strong> when the goal completes. Viewers compete for that recognition, which drives more gifting.</li>
            <li><strong>Reset and repeat.</strong> Once a goal is hit, reset it and run it again. Many creators cycle through goals multiple times per stream to keep the energy going.</li>
          </ul>
          <p><strong>Gallery Gift Goal — 1 at a time</strong></p>
          <ul>
            <li>Your <strong>Gift Gallery</strong> has <span className="highlight">15 slots</span> on your profile, each tied to a specific gift. Setting a gallery gift goal targets filling one of those slots.</li>
            <li>Viewers who light up a slot earn <strong>Title Gifter</strong> status for that gift and earn <span className="highlight">1.5× points</span> toward your LIVE Fest ranking.</li>
            <li>Filling your gallery regularly is worth doing — TikTok reportedly pushes streams with active gallery gifting to more viewers on the For You Page.</li>
          </ul>
        </div>

        <div className="section" id="battles">
          <h2>LIVE Battles (PK Battles)</h2>
          <p>
            LIVE Battles — also called PK Battles — are one of the <strong>highest-earning formats</strong> on TikTok LIVE. Two creators go head-to-head in a split-screen battle while their audiences compete by sending gifts.
          </p>
          <p><strong>How it works.</strong> Send a <span className="highlight">co-host request</span> to another creator while you're both live. Once they accept and you're in a co-host together, you can then send a battle request. If they accept, the battle starts — viewers pick a side by sending gifts, and a <span className="highlight">5-minute timer</span> counts down. Whoever has more gifts at the end wins.</p>
          <p><strong>Why it works.</strong> The competitive format makes viewers send more gifts than they normally would, and it pulls both creators' audiences into one stream — growing both accounts at the same time.</p>
          <p><strong>Agency advantages.</strong> Being in a creator network gives you a built-in pool of other creators to battle. TJB Management can connect you with agency partners for battles, and TikTok runs exclusive agency-versus-agency battle events with <span className="highlight">cash prizes on top of normal gift earnings</span>.</p>
          <p><strong>Losing a battle.</strong> Some creators agree beforehand that the loser completes a challenge — a game, a dare, etc. Entirely optional, but it adds entertainment value and gives viewers a reason to stay tuned.</p>
        </div>

        <div className="section" id="match">
          <h2>Co-Host & Match</h2>
          <p>
            <strong>Co-Host</strong> lets multiple creators share the same LIVE moment at the same time — going LIVE together instead of alone. A <strong>Match</strong> is a Co-Host mode that turns that shared LIVE into a structured challenge: <strong>Match = Co-Host + Competition</strong>. Formats and features may vary by availability.
          </p>
          <p><strong>What Co-Host gives you:</strong></p>
          <ul>
            <li><strong>Connect.</strong> Build creator relationships and interact in real time.</li>
            <li><strong>Expand.</strong> Introduce different communities to each other.</li>
            <li><strong>Create.</strong> Add perspectives, personalities, and interaction your solo stream doesn't have.</li>
          </ul>
          <p><strong>How to start a Co-Host.</strong> While you're LIVE, tap <span className="highlight">+Hosts</span> and send an invite.</p>
          <p><strong>Give viewers a reason to watch.</strong> Co-Host isn't just "split screen" — <em>"We are both LIVE"</em> is a weak pitch, <em>"We are doing something together"</em> is a better one. Structure the time together instead of just sitting side by side:</p>
          <ul>
            <li><strong>Chat</strong> — Q&A, opinions, stories.</li>
            <li><strong>Challenge</strong> — who can do it better?</li>
            <li><strong>Collab</strong> — make something together.</li>
            <li><strong>Match</strong> — structured competition in real time.</li>
          </ul>
          <p><strong>Picking a co-host partner.</strong> Follower count isn't what makes a co-host work. What matters is <span className="highlight">content fit, energy fit, audience compatibility, and interaction</span> — invite someone who makes your LIVE more interesting, not just someone who's available or has the biggest following.</p>
          <p><strong>How a Match builds engagement:</strong></p>
          <ul>
            <li><strong>Co-Host</strong> creates the shared LIVE moment.</li>
            <li><strong>Match</strong> selects the challenge format.</li>
            <li><strong>Viewers</strong> like, comment, share, or gift where eligible.</li>
            <li><strong>Points</strong> — those actions can become visible game progress.</li>
            <li><strong>Compete</strong> — the LIVE moment gains stakes.</li>
            <li><strong>Engage</strong> — viewers get more reasons to watch and react.</li>
          </ul>
          <p>Without a Match, the pitch to a viewer is "watch me." With a Match, it becomes "<strong>watch us compete</strong>" — giving them a reason to watch in real time, like to show support for a side, comment to react, gift where eligible, and share to bring more people into the moment. Better content can support a stronger viewer response, but it doesn't guarantee traffic or ranking — a Match isn't a shortcut to reach on its own.</p>
          <p><strong>The 4P model for planning a good Match:</strong></p>
          <ul>
            <li><strong>Promotion.</strong> Build anticipation before the Match — a short teaser video, a scheduled LIVE Event, clear timing. Post the teaser <span className="highlight">48–24 hours out</span> so viewers have a reason to show up.</li>
            <li><strong>Pairing.</strong> Opponent selection drives the narrative. An aesthetic match (like DJ vs. DJ) raises the stakes, and niche crossovers create curiosity — similarity between the two creators creates energy.</li>
            <li><strong>Plot.</strong> A structured game or story arc keeps viewers invested for the full match — think elimination formats, themed challenges, or dares. Give viewers a narrative to follow, not just a scoreboard.</li>
            <li><strong>Post-Game.</strong> The victory lap isn't optional. Punishments, rewards, and callbacks in the minutes right after the Match are peak viewer retention — use them instead of ending cold.</li>
          </ul>
          <p><strong>Make the Match watchable.</strong> A good Match has a story — every phase should give viewers a reason to stay, react, and follow what happens next.</p>
          <ul>
            <li><strong>Set stakes.</strong> Ask viewers directly: <em>"Who do you think will win?"</em></li>
            <li><strong>Keep the energy moving.</strong> React, challenge, celebrate, and read comments out loud.</li>
            <li><strong>Make it a moment.</strong> Acknowledge support as it changes the live moment — something like <em>"Thank you, [name] — that just pushed us ahead!"</em></li>
            <li><strong>Close the loop.</strong> Celebrate the result, thank both communities, and invite viewers to stay.</li>
          </ul>
          <p>Invite participation — never pressure viewers to send gifts.</p>
          <p><strong>The revenue loop.</strong> Think in terms of building a loop, not asking for gifts: <span className="highlight">discovery</span> (new viewers enter the LIVE) → <span className="highlight">engagement</span> (they watch, like, comment, and react) → <span className="highlight">competition</span> (they have a reason to participate) → <span className="highlight">gifting</span> (supporters may send gifts where eligible) → <span className="highlight">diamonds</span> (eligible creators collect diamonds). Keep asking: how do I create more moments that make viewers want to participate? LIVE Gifts and Diamonds availability and eligibility requirements apply.</p>
        </div>

        <div className="section" id="live-studio">
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

        <div className="section" id="stream-tips">
          <h2>Stream Tips</h2>
          <ul>
            <li><strong>Hit 25 minutes minimum.</strong> For a session to count as a valid LIVE day toward your weekly mission, you must stream at least <span className="highlight">25 minutes</span>. Don't cut it short.</li>
            <li><strong>Consistency beats length.</strong> Streaming 5 days a week for an hour beats one 5-hour stream. Your audience learns when to find you, and you stack more valid LIVE days for your weekly rewards.</li>
            <li><strong>Set your goals before you go live.</strong> Adding gift goals mid-stream on mobile can be buggy. Set all 3 goal slots and your gallery goal before tapping Go LIVE.</li>
            <li><strong>Use all 3 goal slots at different price points.</strong> One cheap goal (Roses), one mid-tier, one high-end. Viewers who can't afford Lions can still participate, and every gift counts toward your rewards.</li>
            <li><strong>Say names out loud.</strong> Acknowledge gifts by calling out the viewer's name. People gift more when they feel seen — it's the single easiest way to increase gifting without changing anything else.</li>
            <li><strong>Build relationships before PK Battles.</strong> Cold-requesting a battle from a stranger rarely works. Connect with other creators in the community first, then coordinate battles in advance.</li>
            <li><strong>Pick a specific category.</strong> TikTok uses your title and category to surface your LIVE to the right audience. "Other" gets you less reach than a category that actually matches your content.</li>
            <li><strong>Work your gift gallery.</strong> Actively fill your gallery slots during streams. TikTok reportedly pushes streams with gallery activity to more viewers on the For You Page.</li>
          </ul>
        </div>

        <div className="section" id="rules">
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
          <p><a href="/tiktok-guidelines" style={{ color: '#a855f7', textDecoration: 'none' }}>See the full breakdown of TikTok's Community Guidelines →</a></p>
        </div>

        <a href="/agency" className="cta-btn">Learn About Joining TJB Management →</a>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, and website are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>TikTok and the TikTok logo are trademarks of TikTok US Data Security Joint Venture LLC. All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
