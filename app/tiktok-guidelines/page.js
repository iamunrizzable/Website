'use client';

import './page.css';

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

      <div className="fade-top"></div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>Agency Hub</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler Hub</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™ Hub</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal Hub</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
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
            Neither of us allows any hateful behavior, hate speech, or promotion of hateful ideologies. <span className="white">This includes content that attacks a person or group because of protected attributes.</span>
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
          <p className="policy-text">Neither of us allows language or behavior that harasses, humiliates, or threatens anyone.</p>
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
            Neither of us allows nudity, including uncovered genitals and buttocks, as well as nipples and areolas of women and girls. <span className="white">Sheer and partially see-through clothing is not considered covered.</span>
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
            TikTok and TJB Management both want this to be a place where people can discuss emotionally complex topics in a supportive way without increasing the risk of harm. <span className="white">Neither of us allows showing, promoting, or sharing plans for suicide or self-harm.</span>
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
            Youth safety is a priority for both of us. <span className="white">Neither of us allows content that may put young people at risk of exploitation, or psychological, physical, or developmental harm.</span>
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
