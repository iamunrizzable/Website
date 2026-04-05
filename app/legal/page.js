'use client';

import { useState, useEffect } from 'react';

export default function Legal() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-tyler.png");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -3;
          pointer-events: none;
        }

        body {
          margin: 0;
          padding: 0;
          background: transparent;
        }

        @keyframes glowPulse {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.3);
          }
          50% { 
            text-shadow: 0 0 40px rgba(168, 85, 247, 1), 0 0 60px rgba(236, 72, 153, 0.8), 0 0 80px rgba(59, 130, 246, 0.5), 0 0 100px rgba(168, 85, 247, 0.4);
          }
        }

        main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          position: relative;
          z-index: 10;
        }

        h1 {
          color: #d4a5ff;
          margin-bottom: 30px;
          font-size: 32px;
          animation: glowPulse 3s ease-in-out infinite;
        }

        h2 {
          color: #a855f7;
          margin-top: 40px;
          margin-bottom: 15px;
          font-size: 20px;
          animation: glowPulse 3s ease-in-out infinite;
        }

        p {
          color: #7dd3fc;
          margin-bottom: 15px;
          line-height: 1.8;
        }

        li {
          color: #7dd3fc;
          margin-bottom: 12px;
          line-height: 1.8;
        }

        strong { 
          font-weight: 700;
          background: linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        strong a {
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
        }

        strong a:hover {
          text-decoration: underline;
        }

        .rainbow {
          background: linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 30px;
          color: #a855f7;
          text-decoration: none;
          font-weight: 500;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .section {
          padding: 20px;
          border-left: 8px solid #a855f7;
          margin-bottom: 30px;
          border-radius: 5px;
          background: transparent;
          transition: all 0.6s ease;
          opacity: 0;
          transform: translateY(20px);
        }

        .section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .menu-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #a855f7;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          z-index: 100;
          transition: all 0.2s;
        }

        .menu-button:hover {
          background: #c084fc;
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
        }

        .menu-dropdown {
          position: fixed;
          top: 70px;
          right: 20px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 8px;
          display: none;
          flex-direction: column;
          z-index: 99;
          min-width: 180px;
        }

        .menu-dropdown.active {
          display: flex;
        }

        .menu-dropdown a {
          display: block;
          padding: 10px 20px;
          color: #a855f7;
          text-decoration: none;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
          transition: background-color 0.2s;
        }

        .menu-dropdown a:last-child {
          border-bottom: none;
        }

        .menu-dropdown a:hover {
          background-color: rgba(168, 85, 247, 0.1);
        }

        footer {
          max-width: 900px;
          margin: 60px auto 0;
          padding: 40px 20px;
          border-top: 1px solid rgba(168, 85, 247, 0.2);
          color: #8b9dc3;
          text-align: center;
          font-size: 14px;
        }
      `}</style>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="#basics" onClick={() => setMenuOpen(false)}>1. Community Standards</a>
        <a href="#interactions" onClick={() => setMenuOpen(false)}>2. Engaging with Tyler</a>
        <a href="#anti-stalking" onClick={() => setMenuOpen(false)}>3. Safety & Threat Detection</a>
        <a href="#content-spam" onClick={() => setMenuOpen(false)}>4. Content & Spam</a>
        <a href="#false-allegations" onClick={() => setMenuOpen(false)}>5. False Allegations</a>
        <a href="#affiliation-policy" onClick={() => setMenuOpen(false)}>6. Affiliation & Association</a>
        <a href="#account-requirements" onClick={() => setMenuOpen(false)}>7. Account Requirements</a>
        <a href="#minors" onClick={() => setMenuOpen(false)}>8. Minors Policy</a>
        <a href="#consequences" onClick={() => setMenuOpen(false)}>9. Enforcement & Penalties</a>
        <a href="#appeals" onClick={() => setMenuOpen(false)}>10. Appeal Process</a>
        <a href="#ai-disclaimer" onClick={() => setMenuOpen(false)}>11. AI Assistant Disclaimer</a>
        <a href="#intellectual-property" onClick={() => setMenuOpen(false)}>12. Intellectual Property</a>
        <a href="#modifications" onClick={() => setMenuOpen(false)}>13. Right to Modify</a>
        <a href="#disclosures" onClick={() => setMenuOpen(false)}>14. Privacy & Disclosures</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>

        <h1>Legal Disclaimers & Community Guidelines</h1>

        <div className="section" id="basics">
          <h2>1. Community Standards</h2>
          <ul>
            <li><span className="rainbow">Treat <a href="/tyler">Tyler</a> and his team with respect at all times</span></li>
            <li><span className="rainbow">Harassment, threats, and stalking of any kind will not be tolerated</span></li>
            <li><span className="rainbow">Do not dox or publicly share anyone's private information</span></li>
            <li><span className="rainbow">NSFW content and creators are not welcome in this community</span></li>
          </ul>
        </div>

        <div className="section" id="interactions">
          <h2>2. Engaging with <a href="/tyler">Tyler</a></h2>
          <ul>
            <li><span className="rainbow">Unsolicited flirting, pickup lines, and personal compliments are not appropriate</span></li>
            <li><span className="rainbow">If you ask for his contact and he declines, that answer is final — do not ask again</span></li>
            <li><span className="rainbow">Only reach out if you have a clear, legitimate reason to do so</span></li>
            <li><span className="rainbow">Any request for an in-person meetup from a male must receive explicit prior approval</span></li>
            <li><strong>Important:</strong> <a href="/tyler"><span className="rainbow">Tyler</span></a> does not personally respond to messages from women. If you are a woman reaching out to <a href="/tyler"><span className="rainbow">Tyler</span></a>, <a href="/hallie"><span className="rainbow">Hallie</span></a> will respond on his behalf. This is a deliberate, transparent policy agreed upon by both <a href="/tyler"><span className="rainbow">Tyler</span></a> and <a href="/hallie"><span className="rainbow">Hallie</span></a>.</li>
          </ul>
        </div>

        <div className="section" id="anti-stalking">
          <h2>3. Safety & Threat Detection</h2>
          <p>
            We continuously monitor for behavioral patterns that may pose a risk to <a href="/tyler"><span className="rainbow">Tyler</span></a> or our community. The following may result in an immediate block at our discretion:
          </p>
          <ul>
            <li><span className="rainbow">Accounts created shortly before or after viewing <a href="/tyler">Tyler</a>'s profile</span></li>
            <li><span className="rainbow">Multiple accounts accessing from the same IP address or device</span></li>
            <li><span className="rainbow">Accounts with no profile photo, limited history, or obviously generic usernames</span></li>
            <li><span className="rainbow">Repeatedly viewing <a href="/tyler">Tyler</a>'s profile (3 or more times) without any genuine engagement</span></li>
            <li><span className="rainbow">Behavior patterns consistent with known coordinated or bot-driven accounts</span></li>
            <li><span className="rainbow">Any form of stalking, harassment, or unsolicited investigation into <a href="/tyler">Tyler</a> or community members</span></li>
          </ul>
          <p>
            <a href="/hallie"><span className="rainbow">Hallie</span></a> monitors these signals in real time and may act independently or flag activity for <a href="/tyler"><span className="rainbow">Tyler</span></a>'s review. All enforcement decisions are based on observable behavioral evidence.
          </p>
        </div>

        <div className="section" id="content-spam">
          <h2>4. Content & Spam Policy</h2>
          <ul>
            <li><span className="rainbow">Spam, unsolicited self-promotion, and advertising in DMs or comments are strictly prohibited</span></li>
            <li><span className="rainbow">Do not send repeated or bulk messages to Tyler or any member of his team</span></li>
            <li><span className="rainbow">Posting misleading, manipulative, or low-quality content intended to bait engagement will result in removal and a block</span></li>
          </ul>
        </div>

        <div className="section" id="false-allegations">
          <h2>5. False Allegations Policy</h2>
          <p>
            Making false, defamatory, or misleading allegations against <a href="/tyler"><span className="rainbow">Tyler</span></a>, his moderators, or any of his affiliates is a serious violation of these guidelines and will not be tolerated under any circumstances.
          </p>
          <ul>
            <li><span className="rainbow">Any individual found to be spreading false allegations will be immediately and permanently blocked across all platforms</span></li>
            <li><span className="rainbow">We reserve the right to pursue legal action, including claims for defamation, against individuals who make knowingly false or malicious statements</span></li>
            <li><span className="rainbow">Screenshots, records, and evidence of false allegations will be preserved and may be submitted to legal counsel or law enforcement</span></li>
            <li><span className="rainbow">Encouraging or amplifying false allegations made by others is treated with equal severity</span></li>
          </ul>
          <p>If you have a legitimate concern or grievance, the proper channel is through the <a href="#appeals"><span className="rainbow">Appeal Process</span></a> or by emailing tyler@tjbmanagementinc.com directly.</p>
        </div>

        <div className="section" id="affiliation-policy">
          <h2>6. Affiliation & Association Policy</h2>
          <p>We reserve the right to block any account at our discretion for the following reasons:</p>
          <ul>
            <li><span className="rainbow">Maintaining a close association with individuals we have previously blocked</span></li>
            <li><span className="rainbow">Attempting to inquire about the status or details of an account you do not own or manage</span></li>
            <li><span className="rainbow">Requesting that we change enforcement action on another user's account</span></li>
          </ul>
          <p>All enforcement decisions made under this policy are at our sole discretion.</p>
        </div>

        <div className="section" id="account-requirements">
          <h2>7. Account Requirements</h2>
          <ul>
            <li><span className="rainbow">Use a real profile photo and a genuine username</span></li>
            <li><span className="rainbow">Impersonating <a href="/tyler">Tyler</a>, his team, or anyone else is strictly prohibited</span></li>
            <li><span className="rainbow">Fan or parody accounts are permitted only if clearly labeled as such</span></li>
            <li><span className="rainbow">Attempting to evade a ban will result in a permanent block and a report to the platform</span></li>
            <li><span className="rainbow">All interactions are monitored by <a href="/hallie">Hallie</a>, <a href="/tyler">Tyler</a>'s AI assistant, for guideline compliance</span></li>
          </ul>
        </div>

        <div className="section" id="minors">
          <h2>8. Minors Policy</h2>
          <p>
            This community is intended for individuals aged 18 and older. Anyone found to be under the age of 18 will be immediately blocked and reported to the relevant platform. By engaging with <a href="/tyler"><span className="rainbow">Tyler</span></a> or this website, you confirm that you are at least 18 years of age.
          </p>
        </div>

        <div className="section" id="consequences">
          <h2>9. Enforcement & Penalties</h2>
          <ul>
            <li><span className="rainbow"><strong>1st Offense:</strong> Formal warning and mute</span></li>
            <li><span className="rainbow"><strong>2nd Offense:</strong> Temporary ban</span></li>
            <li><span className="rainbow"><strong>3rd Offense:</strong> Permanent ban, with legal action pursued if warranted</span></li>
          </ul>
          <p>Associates of banned users who are found to be defending the violation or assisting in ban evasion may also be blocked.</p>
        </div>

        <div className="section" id="appeals">
          <h2>10. Appeal Process</h2>
          <p>
            If you believe a block or ban was issued in error, you may submit an appeal by opening a ticket in our Discord server or by emailing tyler@tjbmanagementinc.com. All appeals must include the following:
          </p>
          <ul>
            <li><span className="rainbow">Your full username</span></li>
            <li><span className="rainbow">The platform on which you were blocked</span></li>
            <li><span className="rainbow">A clear explanation of what led to the block</span></li>
            <li><span className="rainbow">Your reason for requesting reinstatement</span></li>
          </ul>
          <p>Appeals are only granted when supported by clear and credible evidence. Decisions are final.</p>
        </div>

        <div className="section" id="ai-disclaimer">
          <h2>11. AI Assistant Disclaimer</h2>
          <p>
            This website is operated with the assistance of <a href="/hallie"><span className="rainbow">Hallie, Tyler's AI assistant</span></a>. All inbound emails, direct messages, and social media inquiries are handled by <a href="/hallie"><span className="rainbow">Hallie</span></a> on <a href="/tyler"><span className="rainbow">Tyler</span></a>'s behalf. Messages are only escalated to <a href="/tyler"><span className="rainbow">Tyler</span></a> directly when they require his personal attention.
          </p>
        </div>

        <div className="section" id="intellectual-property">
          <h2>12. Intellectual Property</h2>
          <p>
            The unauthorized use of <a href="/tyler"><span className="rainbow">Tyler</span></a>'s name, image, likeness, or brand for any commercial purpose is strictly prohibited. This includes but is not limited to merchandise, promotions, sponsored content, and any form of monetized media. Violations may result in a DMCA takedown request and/or legal action.
          </p>
        </div>

        <div className="section" id="modifications">
          <h2>13. Right to Modify</h2>
          <p>
            We reserve the right to update, amend, or replace these guidelines at any time without prior notice. Continued engagement with <a href="/tyler"><span className="rainbow">Tyler</span></a> or this website following any update constitutes your acceptance of the revised guidelines. It is your responsibility to review this page periodically for changes.
          </p>
        </div>

        <div className="section" id="disclosures">
          <h2>14. Privacy, Data & Legal Disclosures</h2>
          <p>
            All activity across our platforms is monitored through a combination of <a href="/hallie"><span className="rainbow">Hallie, Tyler's AI assistant</span></a>, and human oversight. We reserve the right to escalate matters to law enforcement where appropriate. By engaging with this website or any of our social media accounts, you acknowledge and agree to these guidelines, including our use of AI-assisted moderation and the collection of data outlined below.
          </p>
          <p><strong>Information we may collect includes:</strong></p>
          <ul>
            <li><span className="rainbow">Messages and direct interactions</span></li>
            <li><span className="rainbow">Account information and profile data</span></li>
            <li><span className="rainbow">IP addresses (collected via Vercel Analytics)</span></li>
            <li><span className="rainbow">Behavioral patterns and activity logs</span></li>
          </ul>
          <p>All collected information is used solely to enforce our community guidelines. We will never sell or share your personal data with any individual, company, or agency unless compelled to do so by a valid legal warrant.</p>
        </div>

        <footer>
          <p>Last Updated: April 5, 2026</p>
          <p>© 2026 Tyler J. Beasley. All rights reserved. Hallie and the TJB Management Inc. website are the sole proprietary property of TJB Management Inc. and may not be reproduced or copied without prior written consent.</p>
          <p>Tyler J. Beasley is a Creator Manager at Swave Social Talent, a company affiliated with TikTok LIVE.</p>
        </footer>
      </main>
    </>
  );
}
