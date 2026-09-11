'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function C2Guidelines() {
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
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/agencies/c2" className="back-link">← Back to C2</a>
        <h1>C2 Community Guidelines</h1>
        <p className="page-subtitle">Know the rules before you go LIVE on C2. Violations can result in content removal, account termination, loss of access, legal action, or a report to law enforcement. Summarized from C2&apos;s User Content and Conduct Policy (effective March 13, 2025) — the official policy at c2live.co/conduct governs.</p>

        {/* Overview */}
        <div className="overview">
          <p className="overview-title">C2 lists these as the most common reasons for termination or content removal:</p>
          <ul className="overview-list">
            <li><span className="overview-num">01</span> Sexual Content</li>
            <li><span className="overview-num">02</span> Hate Speech / Harassment / Violence</li>
            <li><span className="overview-num">03</span> Alcohol / Drugs</li>
            <li><span className="overview-num">04</span> Minors (under the age of 18)</li>
            <li><span className="overview-num">05</span> Spam / Malicious Behaviour</li>
            <li><span className="overview-num">06</span> Driving</li>
          </ul>
        </div>

        {/* Section 1 */}
        <div className="section">
          <h2 className="section-title">1. <span className="pink">Sexual</span> and Adult Content</h2>
          <p className="policy-text">
            No lewd, obscene, or pornographic content. <span className="white">C2 considers adult content to be any media that is pornographic in nature — including in drawings, cartoons, hentai, or anime.</span>
          </p>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li>Nudity, and hinting at nudity — nude but covering with your hands or emojis, nude but private parts off screen, nude but only showing your back, etc.</li>
            <li>Full or partial nudity, including close-ups (whether clothed or not) of genitals, buttocks, or breasts.</li>
            <li>Sexual gestures or positions, even if clothed, and obscene or dirty gestures.</li>
            <li>Sexual touching or pretended touching, simulating a sexual act, or simulated/real climax.</li>
            <li>Live streaming from the shower or bathtub, even if private parts are not visible.</li>
            <li>Promoting pornographic websites or any other delivery of nude/pornographic content.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="section">
          <h2 className="section-title">2. Hate Speech, Harassment and Violence</h2>
          <p className="policy-text">
            No abusive behaviour — any attempt to harass, threaten, intimidate, or silence someone else&apos;s voice — and no hateful conduct on the basis of race, religion, ethnicity, national origin, sexual orientation, gender, gender identity, age, disability, serious disease, veteran status, or any other characteristic associated with systemic discrimination or marginalization. <span className="white">Violent threats are zero-tolerance: those deemed to be making them face immediate and permanent termination.</span>
          </p>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li>Hate speech or other forms of harassment, and bashing groups of people in broad terms.</li>
            <li>Hoping for or wishing death, disease, or serious harm on anyone — e.g. &quot;I hope you get cancer and die&quot; or &quot;I hope you get hit by a bus.&quot;</li>
            <li>Violent threats against an identifiable target, threatening or promoting terrorism, or threatening poses with firearms or other weapons.</li>
            <li>Repeated or non-consensual slurs, epithets, racist or sexist tropes, or targeted misgendering or deadnaming.</li>
            <li>Hateful imagery — symbols historically associated with hate groups, or images altered to dehumanize people or reference a mass murder — including in profile photos, usernames, display names, or bios.</li>
            <li>Sending unwanted sexual content, sexually objectifying someone, or other sexual misconduct.</li>
            <li>Exploiting others (extortion, blackmail, etc.), publicly humiliating someone, or harassing victims of a tragic event or their friends and families.</li>
            <li>Sharing images of a person in a private space — bathroom, bedroom, locker room, or medical facility — without their knowledge and consent.</li>
            <li>Sharing another person&apos;s private information without consent or to harass them (&quot;doxxing&quot;), threatening to, or encouraging others to.</li>
            <li>Predatory or stalking behaviour — physically following someone or saying you are, or trespassing or loitering near their home, workplace, place of worship, or school.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="section">
          <h2 className="section-title">3. Alcohol, Drugs and Regulated Goods</h2>
          <p className="policy-text">
            No content depicting, or giving instructions on how to make, illegal or regulated goods and services. <span className="white">Gambling — soliciting or engaging in it, or anything similar — is not allowed.</span>
          </p>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li><span className="highlight">Drugs:</span> Illegal drugs and drug paraphernalia, references to drug-related transactions, or appearing overly intoxicated while live streaming.</li>
            <li><span className="highlight">Alcohol:</span> Consuming alcohol or drugs in exchange for gifts or followers.</li>
            <li><span className="highlight">Weapons:</span> Firearms, ammunition, explosives, and instructions on making weapons (bombs, 3D printed guns, etc.).</li>
            <li><span className="highlight">Other regulated goods:</span> Counterfeit goods, financial instruments or services, stolen goods, products made from endangered or protected species, human trafficking, and prostitution or sexual services — including &quot;sugar&quot; relationships or arrangements.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="section">
          <h2 className="section-title">4. <span className="pink">Minors</span> (under the age of 18)</h2>
          <p className="policy-text">
            You must be at least 18 to use C2. <span className="white">Minors may not appear in your live stream for any period of time — even if they are your children or you otherwise have permission.</span>
          </p>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li>Minors creating a C2 account or using the C2 Services.</li>
            <li>Showing minors in your live stream for any period of time, or posting photos of minors on your C2 profile.</li>
            <li>Any content that sexualizes minors or promotes or glorifies child sexual exploitation, including illustrated or computer-generated depictions and links to sites hosting such material.</li>
            <li>Engaging a minor in a sexually explicit conversation, or identifying alleged victims of childhood sexual exploitation by name or photo.</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="section">
          <h2 className="section-title">5. Spam, Solicitation and Malicious Behaviour</h2>
          <p className="policy-text">
            No unsolicited or unauthorized advertising, fundraising, promotion, or solicitation of any kind, and no commercial use of C2. <span className="white">Adult content platforms (including OnlyFans), political platforms, religions, cults, or sects may not be promoted anywhere — on stream, in chat, verbally, or in your profile.</span>
          </p>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li>Requesting payments or promoting payment methods such as PayPal, Cashapp, Venmo, OnlyFans, or gift cards.</li>
            <li>Promising financial rewards to viewers for contests or giveaways, or running any unauthorized contest, giveaway, lottery, or sweepstakes.</li>
            <li>Advertising or promoting products or services of any kind, or redirecting or encouraging users to visit other sites.</li>
            <li>Awarding access to adult content platforms in exchange for Mod Status, Gifts, Hearts, Love Bombs, or any other virtual good or currency.</li>
            <li>Creating multiple accounts to bypass restrictions or penalties, or using malicious proxies or ISP services to access C2.</li>
            <li>Impersonating any person, group, or organization, or misrepresenting your age, identity, or affiliation.</li>
            <li>Letting another person access or use your C2 account.</li>
            <li>Spamming, phishing, trolling, automated posting or account creation, data mining, or anything that disrupts C2&apos;s services or another user&apos;s device.</li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className="section">
          <h2 className="section-title">6. <span className="pink">Driving,</span> Dangerous Activities and Graphic Violence</h2>
          <p className="policy-text">
            No live streaming while driving or operating a vehicle or heavy machinery. <span className="white">No content depicting dangerous activities or products, and no graphically violent or gratuitously gory content.</span>
          </p>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li>Operating heavy machinery or a motor vehicle, or trespassing on construction sites.</li>
            <li>Cutting or self-harm of any kind, or promoting self-harm, suicide, eating disorders, or other acts where serious injury or death may result.</li>
            <li>Dangerous &quot;dares,&quot; games, battles or contests, and dangerous controlled substances.</li>
            <li>Gruesome crime or accident scenes, physical altercations, bodily fluids, exposed internal organs or bones, or serious bodily harm such as visible wounds or broken bones.</li>
            <li>Animal torture or killing, or severely injured, mutilated, or dead animals.</li>
            <li>Content that promotes mass murder or violent events, such as depictions of Holocaust victims or lynching.</li>
          </ul>
        </div>

        {/* Section 7 */}
        <div className="section">
          <h2 className="section-title">7. Intellectual Property, Privacy and Unlawful Use</h2>
          <span className="badge badge-red">Some examples of what is <span className="not">NOT</span> allowed</span>
          <ul className="rule-list">
            <li>Content you don&apos;t have the right to make available, or that infringes anyone&apos;s patent, trademark, trade secret, privacy, copyright, or other proprietary right — including others&apos; photos, images, music, movies, or videos without permission.</li>
            <li>Recordings or images of another person produced or distributed without their permission, or anything that violates their right of privacy, publicity, or data rights.</li>
            <li>Harvesting other users&apos; contact information, or collecting or sharing their personal information for commercial or unlawful purposes.</li>
            <li>Using C2 for any unlawful purpose, to further illegal activities, or to defraud, swindle, or deceive other users.</li>
            <li>Accessing any part of C2 you aren&apos;t authorized to access.</li>
          </ul>
        </div>

        {/* Profile Photo */}
        <div className="section">
          <h2 className="section-title">Lastly, your <span className="pink">Profile Photo</span></h2>
          <p className="policy-text">
            Your primary profile photo must be of you. <span className="white">No cartoons, animals, promotions, or streaming goals as your primary profile photo, and no excessive text within it.</span>
          </p>
        </div>

        {/* Consequences */}
        <div className="gift-box section">
          <h2 className="gift-title">Consequences of Violation</h2>
          <ul className="rule-list">
            <li>User content removal.</li>
            <li>Account termination.</li>
            <li>Restricting or terminating your access to the C2 Services.</li>
            <li>Legal action against you.</li>
            <li>Notifying appropriate law enforcement agencies.</li>
          </ul>
          <p className="policy-text">
            C2 may take action at any time, with or without notice, in its sole discretion — and its guidelines are not exhaustive; C2 applies them in letter or in spirit. <span className="white">To report a violation, email support@c2live.co or use the report button in the C2 app.</span>
          </p>
        </div>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
