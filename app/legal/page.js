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
        <a href="#basics" onClick={() => setMenuOpen(false)}>The Basics</a>
        <a href="#interactions" onClick={() => setMenuOpen(false)}>Interactions with Tyler</a>
        <a href="#anti-stalking" onClick={() => setMenuOpen(false)}>Anti-Stalking & Suspicious Behavior</a>
        <a href="#consequences" onClick={() => setMenuOpen(false)}>Consequences</a>
        <a href="#appeals" onClick={() => setMenuOpen(false)}>Appeals</a>
        <a href="#disclosures" onClick={() => setMenuOpen(false)}>Final Notes and Disclosures</a>
        <a href="#hallie-tos" onClick={() => setMenuOpen(false)}>Hallie Moderation – Terms</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>
        
        <h1>Legal Disclaimers & Community Guidelines</h1>

        <div className="section">
          <h2>AI Assistant Disclaimer</h2>
          <p>
            This website is managed by <a href="/hallie"><span className="rainbow">Hallie, Tyler's AI assistant</span></a>. All responses to emails, direct messages, and social media inquiries are reviewed and responded to by <a href="/hallie"><span className="rainbow">Hallie, Tyler's AI assistant</span></a> and not directly reviewed by <a href="/tyler"><span className="rainbow">Tyler</span></a> Beasley unless they are escalated as requiring his personal attention.
          </p>
        </div>

        <div className="section" id="basics">
          <h2>1. The Basics</h2>
          <ul>
            <li><span className="rainbow">Be respectful to <a href="/tyler">Tyler</a> and his admins at all times</span></li>
            <li><span className="rainbow">No harassment, threats, or stalking</span></li>
            <li><span className="rainbow">No doxing or publicly sharing private info about anyone other than yourself</span></li>
            <li><span className="rainbow">NSFW creators aren't welcome here</span></li>
          </ul>
        </div>

        <div className="section">
          <h2>2. Your Account</h2>
          <ul>
            <li><span className="rainbow">Use a real photo and username</span></li>
            <li><span className="rainbow">No impersonation of anyone (especially <a href="/tyler">Tyler</a> and his admins)</span></li>
            <li><span className="rainbow">Fan/parody accounts are fine if clearly marked</span></li>
            <li><span className="rainbow">Ban evading gets you permanently blocked and reported</span></li>
            <li><span className="rainbow"><a href="/hallie">Hallie</a>, <a href="/tyler">Tyler</a>'s AI assistant, monitors all interactions for compliance</span></li>
          </ul>
        </div>

        <div className="section" id="interactions">
          <h2>3. Interactions with <a href="/tyler">Tyler</a></h2>
          <ul>
            <li><span className="rainbow">No unsolicited flirting, pickup lines, or compliments</span></li>
            <li><span className="rainbow">Ask once for his contact — if he says no, that's it</span></li>
            <li><span className="rainbow">When you message him, have an actual reason</span></li>
            <li><span className="rainbow">All in-person meetup requests require explicit approval first</span></li>
            <li><strong>Note:</strong> Initial messages to <a href="/tyler"><span className="rainbow">Tyler</span></a> are handled by <a href="/hallie"><span className="rainbow">Hallie, Tyler's AI assistant</span></a>. This applies to everyone equally and is transparent, and by design.</li>
          </ul>
        </div>

        <div className="section" id="anti-stalking">
          <h2>4. Anti-Stalking & Suspicious Behavior</h2>
          <p>
            We actively monitor for suspicious account behavior patterns to protect <a href="/tyler"><span className="rainbow">Tyler</span></a> and our community. Accounts exhibiting the following behavior may be blocked at our discretion:
          </p>
          <ul>
            <li><span className="rainbow">New accounts created immediately before or after viewing <a href="/tyler">Tyler</a>'s profile</span></li>
            <li><span className="rainbow">Multiple accounts viewing from the same IP address or device</span></li>
            <li><span className="rainbow">Accounts with no profile picture, minimal account history, or generic usernames</span></li>
            <li><span className="rainbow">Repeated viewing of <a href="/tyler">Tyler</a>'s profile (3+ times) with zero interaction or engagement</span></li>
            <li><span className="rainbow">Account behavior patterns matching known coordinated attack accounts</span></li>
            <li><span className="rainbow">Any form of stalking, harassment, or investigation of <a href="/tyler">Tyler</a> or community members</span></li>
          </ul>
          <p>
            <a href="/hallie"><span className="rainbow">Hallie, Tyler's AI assistant</span></a>, monitors these patterns continuously and may block accounts directly or alert <a href="/tyler"><span className="rainbow">Tyler</span></a> for review. Blocking decisions are made by both <a href="/hallie"><span className="rainbow">Hallie</span></a> and <a href="/tyler"><span className="rainbow">Tyler</span></a> based on behavioral evidence.
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
            We monitor all activity, by the use of <a href="/hallie"><span className="rainbow">Hallie, Tyler's AI assistant</span></a>, and human moderation, and reserve the right to escalate to law enforcement. By being here, and on any of our social media, you agree and warrant to these rules and our use of AI moderation to ensure compliance with our community guidelines and the collection of information.
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

        <div className="section" id="hallie-tos">
          <h2>8. Hallie TikTok Moderation App – Terms & Conditions</h2>
          <p>
            The following terms govern your use of the <span className="rainbow">Hallie Moderation System</span>, the AI-powered TikTok comment and interaction moderation tool operated by TJB Management Inc. By connecting a TikTok account to this system or interacting with any TikTok content moderated by it, you agree to the following.
          </p>

          <h2>8.1 What the System Does</h2>
          <p>
            The <span className="rainbow">Hallie Moderation System</span> automatically scans TikTok comments, live chat messages, and other public interactions on TJB Management Inc.'s TikTok account(s). It uses a rule-based scoring engine to classify content as spam, scam, harassment, hate speech, or promotional material and may take the following automated actions:
          </p>
          <ul>
            <li><span className="rainbow">Flag content for human review</span></li>
            <li><span className="rainbow">Generate a suggested reply for the account owner</span></li>
            <li><span className="rainbow">Automatically hide comments that score above the configured threshold</span></li>
            <li><span className="rainbow">Send an internal alert to tyler@tjbmanagementinc.com</span></li>
          </ul>

          <h2>8.2 Data We Access and Store</h2>
          <p>When a TikTok account is connected to this system, the following data is accessed and temporarily stored:</p>
          <ul>
            <li><span className="rainbow">TikTok OAuth access tokens and refresh tokens (stored encrypted, never shared)</span></li>
            <li><span className="rainbow">Public profile information (display name, follower count, video count)</span></li>
            <li><span className="rainbow">Public video metadata (title, view count, comment count)</span></li>
            <li><span className="rainbow">Public comment text, author username, and engagement data</span></li>
            <li><span className="rainbow">Moderation event logs, including scores and flags assigned to content</span></li>
          </ul>
          <p>
            All data is stored in a secure, access-controlled database. Comment data and moderation logs are retained for up to 30 days. Token data is retained only as long as the account remains connected. We do not sell, rent, or share this data with any third party.
          </p>

          <h2>8.3 TikTok Platform Compliance</h2>
          <p>
            This system operates under TikTok's Developer Terms of Service and Content API usage policies. Data accessed through the TikTok API is used solely for the purpose of content moderation on TJB Management Inc.'s own account(s). We do not use TikTok API data for advertising, resale, or any purpose outside of moderation and account management.
          </p>

          <h2>8.4 Automated Decisions</h2>
          <p>
            The <span className="rainbow">Hallie Moderation System</span> may automatically hide your comment on TJB Management Inc.'s TikTok content if it is scored as harmful under our guidelines. Automated hiding is not permanent — the account owner may review and restore any hidden comment at their discretion. If you believe a comment was incorrectly moderated, you may appeal by emailing tyler@tjbmanagementinc.com with your TikTok username and the content in question.
          </p>

          <h2>8.5 No Warranty & Limitation of Liability</h2>
          <p>
            The <span className="rainbow">Hallie Moderation System</span> is provided as-is. TJB Management Inc. makes no guarantees that the system will catch all harmful content or that it will never incorrectly flag benign content. Moderation is a best-effort service and is subject to the availability and approved scope of the TikTok API. TJB Management Inc. is not liable for any damages arising from moderation decisions, system downtime, or API limitations imposed by TikTok.
          </p>

          <h2>8.6 Changes to These Terms</h2>
          <p>
            We may update these terms at any time. Continued use of TJB Management Inc.'s TikTok content or this website after an update constitutes acceptance of the revised terms. The date at the bottom of this page reflects the most recent update.
          </p>
        </div>

        <footer>
          <p>Last Updated: April 19, 2026</p>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
