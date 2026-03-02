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
        }
      });
    }, { threshold: 0.1 });
    
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);



  return (
    <>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #0f172a;
        }
        
        .bg-watermark {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-size: contain;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -3;
          pointer-events: none;
          margin: 0;
          padding: 0;
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
          color: #fff;
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
          color: #a0aec0;
          margin-bottom: 15px;
        }
        
        li {
          color: #a0aec0;
          margin-bottom: 8px;
        }
        
        strong { 
          font-weight: 700;
          background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
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
          border-left: 4px solid #a855f7;
          margin-bottom: 30px;
          border-radius: 5px;
          background: rgba(168, 85, 247, 0.05);
          transition: all 0.6s ease;
          opacity: 0;
          transform: translateY(20px);
        }
        
        .section.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        ul {
          margin-left: 20px;
          margin-bottom: 15px;
        }
        
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 14px;
          color: #8b9dc3;
          text-align: center;
        }
        
        a {
          color: #a855f7;
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        .menu-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #a855f7;
          color: #fff;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          z-index: 100;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .menu-button:hover {
          background-color: #9333ea;
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
        }
        
        .menu-dropdown {
          display: none;
          position: fixed;
          top: 60px;
          right: 20px;
          background-color: #0f172a;
          border: 2px solid #a855f7;
          border-radius: 5px;
          padding: 10px 0;
          min-width: 200px;
          z-index: 101;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        
        .menu-dropdown.active {
          display: block;
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
        
        .fade-top {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 200px;
          background: linear-gradient(to bottom, rgba(15, 23, 42, 0.95), transparent);
          z-index: 50;
          pointer-events: none;
        }

      `}</style>

      <div className="bg-watermark" style={{
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(/bg-home.png)',
      }}></div>

      <div className="fade-top"></div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Meet Hallie</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Meet Tyler</a>
        <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>
        
        <h1>Legal Disclaimers & Community Guidelines</h1>

        <div className="section">
          <h2>AI Assistant Disclaimer</h2>
          <p>
            This website is managed by <strong><a href="/hallie">Hallie, Tyler's AI assistant</a></strong>. All responses to emails, direct messages, and social media inquiries are <strong>reviewed and responded to by <a href="/hallie">Hallie, Tyler's AI assistant</a></strong> and not directly reviewed by Tyler Beasley unless they are escalated as requiring his personal attention.
          </p>
        </div>

        <div className="section">
          <h2>1. The Basics</h2>
          <ul>
            <li>Be respectful to Tyler and his admins at all times</li>
            <li>No harassment, threats, or stalking</li>
            <li>No doxing or publicly sharing private info about anyone other than yourself</li>
            <li>NSFW creators aren't welcome here</li>
          </ul>
        </div>

        <div className="section">
          <h2>2. Your Account</h2>
          <ul>
            <li>Use a real photo and username</li>
            <li>No impersonation of anyone (especially Tyler and his admins)</li>
            <li>Fan/parody accounts are fine if clearly marked</li>
            <li>Ban evading gets you permanently blocked and reported</li>
            <li><strong><a href="/hallie">Hallie, Tyler's AI assistant</a></strong>, monitors all interactions for compliance</li>
          </ul>
        </div>

        <div className="section">
          <h2>3. Interactions with Tyler</h2>
          <ul>
            <li>No unsolicited flirting, pickup lines, or compliments</li>
            <li>Ask once for his contact — if he says no, that's it</li>
            <li>When you message him, have an actual reason</li>
            <li>Women under 18 can't interact with or follow Tyler</li>
            <li>Women over 18 can only contact Tyler's work number in emergencies with prior approval</li>
            <li>In-person meetups requested by men need explicit approval first</li>
            <li>In person meet ups requested by women will automatically be denied</li>
          </ul>
        </div>

        <div className="section">
          <h2>4. Consequences</h2>
          <ul>
            <li><strong>1 Rep:</strong> Warning + mute</li>
            <li><strong>2 Reps:</strong> Temporary ban</li>
            <li><strong>3 Reps:</strong> Permanent ban + legal action if needed</li>
          </ul>
          <p>Close friends of banned users can get blocked too if they're defending the behavior or helping them evade.</p>
        </div>

        <div className="section">
          <h2>5. Appeals</h2>
          <p>
            To appeal a ban, users may file a ticket via Discord in the create-a-ticket channel or email tyler@tjbmanagementinc.com. Appeals must include:
          </p>
          <ul>
            <li>Full username</li>
            <li>Platform you are blocked on</li>
            <li>What you did to get blocked</li>
            <li>Why you want to be unblocked</li>
          </ul>
          <p>We only overturn bans with solid evidence supporting the appeal.</p>
        </div>

        <div className="section">
          <h2>6. Final Notes and Disclosures</h2>
          <p>
            We monitor all activity, by the use of <strong><a href="/hallie">Hallie, Tyler's AI assistant</a></strong>, and human moderation, and reserve the right to escalate to law enforcement. By being here, and on any of our social media, you agree and consent to these rules and our use of AI moderation to ensure compliance with our community guidelines and the collection of your personal information. Information we collect is:
          </p>
          <ul>
            <li>Your IP address</li>
            <li>The patterns you use when you interact with Tyler's accounts</li>
            <li>Hallie may use this information to track you across our social media platforms to ensure compliance</li>
            <li>Hallie may be the one to respond to any message you send instead of Tyler giving a personal response. If and when she does, you agree that Hallie is allowed to respond to your messages, and allowed to store information you message her for review and training.</li>
            <li>We promise to only use personal information to ensure compliance with our community guidelines and we will not share or sell your personal information with any person, business, or agency without a warrant.</li>
          </ul>
        </div>

        <div className="section">
          <h2>Changes to These Policies</h2>
          <p>
            TJB Management Inc. reserves the right to update these disclaimers and guidelines at any time. Changes will be effective immediately upon posting to this page.
          </p>
        </div>

        <div className="section">
          <h2>Questions or Concerns?</h2>
          <p>
            If you have questions about these policies, please contact us.
          </p>
        </div>

        <div className="footer">
          <p>Last Updated: February 28, 2026</p>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
