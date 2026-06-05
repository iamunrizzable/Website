'use client';

import { useState, useEffect } from 'react';

export default function TikTokGuidelines() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
        else entry.target.classList.remove('visible');
      });
    }, { threshold: 0.08 });
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
          background-image: linear-gradient(rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.92)), url("/bg-main.jpeg");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -3;
          pointer-events: none;
        }
        body { margin: 0; padding: 0; background: transparent; }

        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.3); }
          50% { text-shadow: 0 0 40px rgba(168,85,247,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(59,130,246,0.5); }
        }

        main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px 60px;
          position: relative;
          z-index: 10;
        }

        h1 {
          color: #d4a5ff;
          font-size: 32px;
          margin-bottom: 8px;
          animation: glowPulse 3s ease-in-out infinite;
        }

        .page-subtitle {
          color: #a0aec0;
          font-size: 15px;
          margin-bottom: 40px;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 30px;
          color: #a855f7;
          text-decoration: none;
          font-weight: 500;
        }
        .back-link:hover { text-decoration: underline; }

        /* Overview */
        .overview {
          background: rgba(15,23,42,0.6);
          border: 2px solid rgba(168,85,247,0.25);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 40px;
        }
        .overview-title {
          color: #fff;
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        .overview-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .overview-list li {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          color: #e2e8f0;
          font-size: 15px;
          font-weight: 500;
        }
        .overview-list li:last-child { border-bottom: none; }
        .overview-num {
          font-size: 13px;
          font-weight: 800;
          color: #ec4899;
          min-width: 28px;
        }

        /* Section cards */
        .section {
          background: rgba(15,23,42,0.55);
          border: 2px solid rgba(168,85,247,0.2);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .section.visible { opacity: 1; transform: translateY(0); }

        .section-title {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 14px;
        }
        .section-title .pink { color: #ec4899; }
        .section-title .cyan { color: #06b6d4; }

        .policy-text {
          color: #06b6d4;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.7;
          margin-bottom: 22px;
        }
        .policy-text .white { color: #fff; }

        /* Badges */
        .badge {
          display: inline-block;
          padding: 7px 18px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .badge-red { background: #ec4899; color: #fff; }
        .badge-cyan { background: transparent; border: 2px solid #06b6d4; color: #06b6d4; }
        .badge-pink { background: #ec4899; color: #fff; }
        .badge .not { color: #fff; font-weight: 900; text-decoration: underline; }

        /* Lists */
        .rule-list {
          list-style: none;
          padding: 0;
          margin: 0 0 20px;
        }
        .rule-list li {
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.7;
          padding: 8px 0 8px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: relative;
        }
        .rule-list li:last-child { border-bottom: none; }
        .rule-list li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #a855f7;
          font-weight: 900;
        }
        .rule-list .highlight { color: #ec4899; font-weight: 700; }
        .rule-list .highlight-cyan { color: #06b6d4; font-weight: 700; }

        /* Best practices grid */
        .practices-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        .practice-card {
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(168,85,247,0.2);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .practice-icon { font-size: 36px; margin-bottom: 12px; }
        .practice-text {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.6;
        }
        .practice-text .cyan { color: #06b6d4; font-weight: 700; }
        .practice-text .pink { color: #ec4899; font-weight: 700; }
        .practice-text .purple { color: #a855f7; font-weight: 700; }

        /* Quiz boxes */
        .quiz-box {
          background: rgba(236,72,153,0.08);
          border: 2px solid rgba(236,72,153,0.3);
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
        }
        .quiz-label {
          display: inline-block;
          background: #ec4899;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 999px;
          margin-bottom: 14px;
        }
        .quiz-question {
          color: #fff;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .quiz-options {
          list-style: none;
          padding: 0;
          margin: 0 0 14px;
        }
        .quiz-options li {
          color: #cbd5e1;
          font-size: 15px;
          padding: 6px 0;
          line-height: 1.6;
        }
        .quiz-options li.correct { color: #06b6d4; font-weight: 700; }
        .quiz-answer {
          font-size: 18px;
          font-weight: 800;
          color: #ec4899;
          margin-top: 10px;
        }

        /* Gift baiting */
        .gift-box {
          background: rgba(6,182,212,0.08);
          border: 2px solid rgba(6,182,212,0.3);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .gift-box.visible { opacity: 1; transform: translateY(0); }
        .gift-title {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 20px;
        }
        .gift-title .not { color: #ec4899; }

        /* Footer */
        .footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.1);
          text-align: center;
          font-size: 14px;
        }
        .footer p {
          margin-bottom: 1.5em;
          margin-top: 0;
          line-height: 1.6;
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Menu */
        .menu-button {
          position: fixed; top: 20px; right: 20px;
          background-color: #a855f7; color: #fff;
          border: none; padding: 10px 15px; border-radius: 5px;
          cursor: pointer; font-weight: bold; z-index: 100; font-size: 16px;
          transition: all 0.3s ease;
        }
        .menu-button:hover { background-color: #9333ea; transform: scale(1.05); box-shadow: 0 0 20px rgba(168,85,247,0.6); }
        .menu-dropdown {
          display: none; position: fixed; top: 60px; right: 20px;
          background-color: #0f172a; border: 2px solid #a855f7;
          border-radius: 5px; padding: 10px 0; min-width: 200px;
          z-index: 101; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
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
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Connect with Hallie</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Connect with Tyler</a>
        <a href="/contact-agency" onClick={() => setMenuOpen(false)}>Connect with Agency</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
        <a href="/merch" onClick={() => setMenuOpen(false)}>Merch</a>
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/tiktok-guidelines" onClick={() => setMenuOpen(false)}>TikTok Guidelines</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/streaming-basics" className="back-link">← Back to Streaming Basics</a>
        <h1>TikTok Community Guidelines</h1>
        <p className="page-subtitle">Know the rules before you go LIVE. Violations can result in content removal, account restrictions, or permanent bans.</p>

        {/* Overview */}
        <div className="overview">
          <p className="overview-title">Common violations tend to fall within the following 6 main policies within the Community Guidelines:</p>
          <ul className="overview-list">
            <li><span className="overview-num">01</span> Hate Speech and Hateful Behaviors</li>
            <li><span className="overview-num">02</span> Harassment and Bullying</li>
            <li><span className="overview-num">03</span> Nudity, Body Exposure and Sexual Activity</li>
            <li><span className="overview-num">04</span> Regulated Goods and Commercial Activity</li>
            <li><span className="overview-num">05</span> Suicide, Self-Harm and Dangerous Activities</li>
            <li><span className="overview-num">06</span> Minor/Youth Safety</li>
          </ul>
        </div>

        {/* Section 1 */}
        <div className="section">
          <h2 className="section-title">1. Hate Speech and Hateful Behavior</h2>
          <p className="policy-text">
            We do not allow any hateful behavior, hate speech, or promotion of hateful ideologies. <span className="white">This includes content that attacks a person or group because of protected attributes.</span>
          </p>
          <span className="badge badge-pink">Best Practices</span>
          <div className="practices-grid">
            <div className="practice-card">
              <div className="practice-icon">💬</div>
              <p className="practice-text"><span className="cyan">Be conscientious</span> when speaking about but not limited to: ethnicity, race, religion, gender, sexual orientation and disability.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">⚠️</div>
              <p className="practice-text"><span className="pink">Be aware</span> of the language being used by yourself and any <span className="pink">co-hosts/guests</span> on your LIVE.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">✊</div>
              <p className="practice-text"><span className="purple">Educate your moderators</span> to help <span className="purple">promote positivity and zero-tolerance policy</span> against hate speech and hateful behaviors throughout your LIVE.</p>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="section">
          <h2 className="section-title">2. Harassment and Bullying</h2>
          <p className="policy-text">We do not allow language or behavior that harasses, humiliates, or threatens anyone.</p>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li>Degrading someone or expressing disgust on the basis of their personal characteristics or circumstances.</li>
            <li>Showing someone being physically bullied by another person or group.</li>
            <li>Expressing a desire for a person to experience severe physical harm or degrading someone with profanity or obscene language.</li>
            <li>Threatening or encouraging sharing account information, blackmail, or hacking someone's account.</li>
            <li>Promoting coordinated harassment of a person or attempting to create conflict between people, such as calling for others to flood comments with abusive language.</li>
          </ul>
          <div className="quiz-box">
            <span className="quiz-label">True / False</span>
            <p className="quiz-question">It is ok to sarcastically make fun of your friend during a LIVE.</p>
            <p className="quiz-answer">False</p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="section">
          <h2 className="section-title">3. <span className="pink">Nudity, Body Exposure</span> and Sexual Activity</h2>
          <p className="policy-text">
            We do not allow nudity, including uncovered genitals and buttocks, as well as nipples and areolas of women and girls. <span className="white">Sheer and partially see-through clothing is not considered covered.</span>
          </p>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li>Nudity of adults, including photography and digitally created images such as manga and anime.</li>
            <li>Nudity of young people, including visual fine art, objects, photography, and digitally created images such as manga and anime.</li>
            <li>Semi-nudity or significant body exposure of young people.</li>
          </ul>
          <span className="badge badge-cyan">FYP Ineligible</span>
          <ul className="rule-list">
            <li>Semi nudity or significant body exposure of adults.</li>
            <li>Moderate body exposure of young people or showing of young people engaging in sexually suggestive behaviors.</li>
          </ul>
          <div className="quiz-box">
            <span className="quiz-label">Single Choice</span>
            <p className="quiz-question">Which behavior is likely to be considered as sexually suggestive content?</p>
            <ul className="quiz-options">
              <li>A. Taking off shirts to show off abs per viewers' request</li>
              <li>B. Describing a sexual encounter in details</li>
              <li>C. Singing sexually explicit lyrics</li>
              <li className="correct">D. All of the above ✓</li>
            </ul>
          </div>
        </div>

        {/* Section 4 */}
        <div className="section">
          <h2 className="section-title">4. Regulated Goods and Commercial Activity</h2>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li><span className="highlight">Alcohol, Tobacco & Drugs:</span> Showing or promoting both young people and adults possessing or consuming alcohol, tobacco products, drugs, or other regulated substances. Even for recreational purposes.</li>
            <li><span className="highlight">Gambling:</span> Facilitating gambling, marketing of gambling, or gambling-like activities, such as providing a link to a gambling service.</li>
            <li><span className="highlight">Dangerous Weapons:</span> Showing or promoting firearms or explosive weapons that are not used in a safe or appropriate setting.</li>
          </ul>
          <div className="quiz-box">
            <span className="quiz-label">True / False</span>
            <p className="quiz-question">Going LIVE while drinking at a bar with friends is FYP eligible.</p>
            <p className="quiz-answer">False</p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="section">
          <h2 className="section-title">5. <span className="pink">Suicide, Self-Harm</span> and Dangerous Activities</h2>
          <p className="policy-text">
            We want TikTok to be a place where people can discuss emotionally complex topics in a supportive way without increasing the risk of harm. <span className="white">We do not allow showing, promoting, or sharing plans for suicide or self-harm.</span>
          </p>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li>Showing, promoting, or providing instructions on suicide and self-harm, and related challenges, dares, games, and pacts.</li>
            <li>Showing or promoting suicide and self-harm hoaxes.</li>
            <li>Sharing plans for suicide and self-harm.</li>
          </ul>
          <div className="quiz-box">
            <span className="quiz-label">Multiple Choice</span>
            <p className="quiz-question">Showing your audience how you are able to jump from one building to another is likely to not be FYP eligible because:</p>
            <ul className="quiz-options">
              <li>A. I will make too much money</li>
              <li className="correct">B. Everyone will try and copy me ✓</li>
              <li className="correct">C. The self harm CG guidelines does not allow it ✓</li>
              <li>D. All of the above</li>
            </ul>
          </div>
        </div>

        {/* Section 6 */}
        <div className="section">
          <h2 className="section-title">6. <span className="pink">Minor/Youth</span> Safety</h2>
          <p className="policy-text">
            Youth safety is our priority. <span className="white">We do not allow content that may put young people at risk of exploitation, or psychological, physical, or developmental harm.</span>
          </p>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li>Sexual exploitation of young people, including child sexual abuse material (CSAM), grooming, solicitation, and pedophilia.</li>
            <li>Physical abuse, neglect, endangerment, and psychological abuse of young people.</li>
            <li>Trafficking of young people, promotion or facilitation of underage marriage, and recruitment of child soldiers.</li>
            <li>Revictimizing young people who have experienced abuse or exploitation, including through third party reshares.</li>
          </ul>
        </div>

        {/* Low Quality Content */}
        <div className="section">
          <h2 className="section-title">Lastly, <span className="pink">Low Quality</span> Content</h2>
          <p className="policy-text">
            Low quality content will likely not be eligible on the FYP. <span className="white">Low quality content includes but is not limited to manipulating others to increase engagement metrics, reproducing content from other platforms, LIVE recorded content, etc.</span>
          </p>
          <span className="badge badge-pink">Best Practices</span>
          <ul className="rule-list">
            <li>Minimize low interaction content which can include silent content, going off the screen for a long time without pausing the LIVE or low engagement with audience.</li>
            <li>Do not go LIVE with reproduced content, looped content, TV displays or other devices playing TV or movie content.</li>
            <li>Minimize low visual or viewing quality such as dark or noisy backgrounds, random filmings and moving around/shaky filming.</li>
            <li>Minimize excessive yelling, cursing, screaming or crying on screen.</li>
          </ul>
        </div>

        {/* Gift Baiting */}
        <div className="gift-box section">
          <h2 className="gift-title">Gift Baiting and Fake Engagement is <span className="not">NOT</span> Allowed</h2>
          <ul className="rule-list">
            <li>"Follow-for-follow" schemes.</li>
            <li>Reverse psychology baiting.</li>
            <li>Begging (e.g., exploiting hardships).</li>
            <li>Low-interaction Gift baiting.</li>
            <li>Matches that are based on external topics or agenda.</li>
          </ul>
        </div>

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
