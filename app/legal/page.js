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
          background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-home.png");
          background-size: contain;
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
        <a href="#basics" onClick={() => setMenuOpen(false)}>The Basics</a>
        <a href="#interactions" onClick={() => setMenuOpen(false)}>Interactions with Tyler</a>
        <a href="#anti-stalking" onClick={() => setMenuOpen(false)}>Anti-Stalking & Suspicious Behavior</a>
        <a href="#consequences" onClick={() => setMenuOpen(false)}>Consequences</a>
        <a href="#appeals" onClick={() => setMenuOpen(false)}>Appeals</a>
        <a href="#disclosures" onClick={() => setMenuOpen(false)}>Final Notes and Disclosures</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>
        
        <h1>Legal Disclaimers & Community Guidelines</h1>

        <div className="section">
          <h2>AI Assistant Disclaimer</h2>
          <p>
            This website is managed by <a href="/hallie">Hallie, Tyler's AI assistant</a>. All responses to emails, direct messages, and social media inquiries are reviewed and responded to by <a href="/hallie">Hallie, Tyler's AI assistant</a> and not directly reviewed by Tyler Beasley unless they are escalated as requiring his personal attention.
          </p>
        </div>

        <div className="section" id="basics">
          <h2>1. The Basics</h2>
          <ul>
            <li><span className="rainbow">Be respectful to Tyler and his admins at all times</span></li>
            <li><span className="rainbow">No harassment, threats, or stalking</span></li>
            <li><span className="rainbow">No doxing or publicly sharing private info about anyone other than yourself</span></li>
            <li><span className="rainbow">NSFW creators aren't welcome here</span></li>
          </ul>
        </div>

        <div className="section">
          <h2>2. Your Account</h2>
          <ul>
            <li><span className="rainbow">Use a real photo and username</span></li>
            <li><span className="rainbow">No impersonation of anyone (especially Tyler and his admins)</span></li>
            <li><span className="rainbow">Fan/parody accounts are fine if clearly marked</span></li>
            <li><span className="rainbow">Ban evading gets you permanently blocked and reported</span></li>
            <li><span className="rainbow"><a href="/hallie">Hallie, Tyler's AI assistant</a>, monitors all interactions for compliance</span></li>
          </ul>
        </div>

        <div className="section" id="interactions">
          <h2>3. Interactions with Tyler</h2>
          <ul>
            <li><span className="rainbow">No unsolicited flirting, pickup lines, or compliments</span></li>
            <li><span className="rainbow">Ask once for his contact — if he says no, that's it</span></li>
            <li><span className="rainbow">When you message him, have an actual reason</span></li>
            <li><span className="rainbow">In-person meetups requested by men need explicit approval first</span></li>
            <li><span className="rainbow"><strong>Important:</strong> Tyler does not respond directly to messages from women. If you are a woman and contact Tyler, <a href="/hallie">Hallie, Tyler's AI assistant</a>, will respond on his behalf. This filtering decision is made by both Tyler and Hallie, is transparent, and by design.</span></li>
          </ul>
        </div>

        <div className="section" id="anti-stalking">
          <h2>4. Anti-Stalking & Suspicious Behavior</h2>
          <p>
            We actively monitor for suspicious account behavior patterns to protect Tyler and our community. Accounts exhibiting the following behavior may be blocked at our discretion:
          </p>
          <ul>
            <li><span className="rainbow">New accounts created immediately before or after viewing Tyler's profile</span></li>
            <li><span className="rainbow">Multiple accounts viewing from the same IP address or device</span></li>
            <li><span className="rainbow">Accounts with no profile picture, minimal account history, or generic usernames</span></li>
            <li><span className="rainbow">Repeated viewing of Tyler's profile (3+ times) with zero interaction or engagement</span></li>
            <li><span className="rainbow">Account behavior patterns matching known coordinated attack accounts</span></li>
            <li><span className="rainbow">Any form of stalking, harassment, or investigation of Tyler or community members</span></li>
          </ul>
          <p>
            <a href="/hallie">Hallie, Tyler's AI assistant</a>, monitors these patterns continuously and may block accounts directly or alert Tyler for review. Blocking decisions are made by both Hallie and Tyler based on behavioral evidence.
          </p>
        </div>

        <div className="section" id="consequences">
          <h2>5. Consequences</h2>
          <ul>
            <li><span className="rainbow"><strong>1 Rep:</strong> Warning + mute</span></li>
            <li><span className="rainbow"><strong>2 Reps:</strong> Temporary ban</span></li>
            <li><span className="rainbow"><strong>3 Reps:</strong> Permanent ban + legal action if needed</span></li>
          </ul>
          <p>Close friends of banned users can get blocked too if they're defending the behavior or helping them evade.</p>
        </div>

        <div className="section" id="appeals">
          <h2>6. Appeals</h2>
          <p>
            To appeal a ban, users may file a ticket via Discord in the create-a-ticket channel or email tyler@tjbmanagementinc.com. Appeals must include:
          </p>
          <ul>
            <li><span className="rainbow">Full username</span></li>
            <li><span className="rainbow">Platform you are blocked on</span></li>
            <li><span className="rainbow">What you did to get blocked</span></li>
            <li><span className="rainbow">Why you want to be unblocked</span></li>
          </ul>
          <p>We only overturn bans with solid evidence supporting the appeal.</p>
        </div>

        <div className="section" id="disclosures">
          <h2>7. Final Notes and Disclosures</h2>
          <p>
            We monitor all activity, by the use of <a href="/hallie">Hallie, Tyler's AI assistant</a>, and human moderation, and reserve the right to escalate to law enforcement. By being here, and on any of our social media, you agree and warrant to these rules and our use of AI moderation to ensure compliance with our community guidelines and the collection of information.
          </p>
          <p><strong>Information we collect is:</strong></p>
          <ul>
            <li><span className="rainbow">Messages and direct interactions</span></li>
            <li><span className="rainbow">Account information and profile data</span></li>
            <li><span className="rainbow">IP addresses (via Vercel Analytics)</span></li>
            <li><span className="rainbow">Interaction patterns and activity logs</span></li>
          </ul>
          <p>We promise to only use personal information to ensure compliance with our community guidelines and will not share or sell your personal information with any person, business, or agency without a warrant.</p>
        </div>

        <footer>
          <p>Last Updated: March 4, 2026</p>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
