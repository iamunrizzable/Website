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
    <html>
      <head>
        <title>Legal Disclaimers & Guidelines - TJB Management Inc.</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('/bg-home.png') center/cover fixed;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
          }
          p {
            color: #a0aec0;
            margin-bottom: 15px;
          }
          li {
            color: #a0aec0;
            margin-bottom: 8px;
          }
          .footer {
            color: #8b9dc3;
          }
          a {
            color: #a855f7;
            text-decoration: none;
          }
          main {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #0f172a;
          }
          @keyframes glowPulse {
            0%, 100% { 
              text-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.3);
            }
            50% { 
              text-shadow: 0 0 40px rgba(168, 85, 247, 1), 0 0 60px rgba(236, 72, 153, 0.8), 0 0 80px rgba(59, 130, 246, 0.5), 0 0 100px rgba(168, 85, 247, 0.4);
            }
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
          h2:nth-of-type(2) { color: #ec4899; }
          h2:nth-of-type(3) { color: #3b82f6; }
          h2:nth-of-type(4) { color: #10b981; }
          h2:nth-of-type(5) { color: #f59e0b; }
          h2:nth-of-type(6) { color: #8b5cf6; }
          h2:nth-of-type(7) { color: #06b6d4; }
          h2:nth-of-type(8) { color: #8b5cf6; }
          h2:nth-of-type(9) { color: #f97316; }
          h2:nth-of-type(10) { color: #06b6d4; }
          h2:nth-of-type(11) { color: #ec0016; }
          .logo-section { text-align: center; margin-bottom: 40px; }
          .logo-img { width: 250px; max-width: 100%; height: auto; filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.5)); }
          ul {
            margin-left: 20px;
            margin-bottom: 15px;
          }
          li strong {
            background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
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
          strong { 
            font-weight: 700;
            background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
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
          .section:nth-of-type(2) { border-left-color: #ec4899; background: rgba(236, 72, 153, 0.05); }
          .section:nth-of-type(3) { border-left-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
          .section:nth-of-type(4) { border-left-color: #10b981; background: rgba(16, 185, 129, 0.05); }
          .section:nth-of-type(5) { border-left-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
          .section:nth-of-type(6) { border-left-color: #8b5cf6; background: rgba(139, 92, 246, 0.05); }
          .section:nth-of-type(7) { border-left-color: #06b6d4; background: rgba(6, 182, 212, 0.05); }
          .section:nth-of-type(8) { border-left-color: #8b5cf6; background: rgba(139, 92, 246, 0.05); }
          .section:nth-of-type(9) { border-left-color: #f97316; background: rgba(249, 115, 22, 0.08); }
          .section:nth-of-type(10) { border-left-color: #06b6d4; background: rgba(6, 182, 212, 0.08); }
          .section:nth-of-type(11) { border-left-color: #ec0016; background: rgba(236, 0, 22, 0.08); }
          #final-notes li {
            background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 500;
          }
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 14px;
            color: #888;
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
        `}</style>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
        <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/hallie" onClick={() => setMenuOpen(false)}>Meet Hallie</a>
          <a href="/tyler" onClick={() => setMenuOpen(false)}>Meet Tyler</a>
          <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
        </div>
        <main>
          <div className="logo-section">
            <img src="/logo-new.png" alt="Tyler J. Beasley" className="logo-img" />
          </div>
          <a href="/" className="back-link">← Back to Home</a>
          
          <h1>Legal Disclaimers & Community Guidelines</h1>
          
          <div className="section" id="ai-disclaimer">
            <h2>AI Assistant Disclaimer</h2>
            <p>
              This website is managed by <strong><a href="/hallie">Hallie, Tyler's AI assistant</a></strong>. All responses to emails, direct messages, and social media inquiries are <strong>reviewed and responded to by <a href="/hallie">Hallie, Tyler's AI assistant</a></strong> and not directly reviewed by Tyler Beasley unless they are escalated as requiring his personal attention.
            </p>
            <p>
              Messages may be automatically categorized, filtered, or responded to based on content analysis. Only messages deemed important or requiring direct human response will be forwarded to Tyler.
            </p>
          </div>

          <div className="section" id="data-collection">
            <h2>Data Collection & Privacy</h2>
            <p>
              This website uses <strong>Vercel Analytics</strong> to collect usage data, including:
            </p>
            <ul>
              <li>IP addresses</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent</li>
              <li>Referral source</li>
            </ul>
            <p>
              This data is used solely for website performance optimization and security purposes. We do not share this data with third parties for any reason without a warrant.
            </p>
            <p>
              For more information about Vercel's privacy practices, visit <a href="https://vercel.com/legal/privacy-policy" target="_blank">Vercel's Privacy Policy</a>.
            </p>
          </div>

          <div className="section" id="contact-info">
            <h2>Contact Information Use</h2>
            <p>
              Contact information provided via all social media platforms and email channels (email, phone, social media) may be used to:
            </p>
            <ul>
              <li><strong>Respond to inquiries and requests</strong></li>
              <li>Send automated responses via <strong><a href="/hallie">Hallie, Tyler's AI assistant</a></strong></li>
              <li><strong>Provide updates or important information</strong></li>
            </ul>
            <p>
              We will not sell, rent, or share your contact information with unaffiliated third parties without a warrant.
            </p>
          </div>

          <div className="section" id="basics">
            <h2>1. The Basics</h2>
            <ul>
              <li>Be respectful to Tyler and his admins at all times</li>
              <li>No harassment, threats, or stalking</li>
              <li>No doxing or publicly sharing private info about anyone other than yourself</li>
              <li>NSFW creators aren't welcome here</li>
            </ul>
          </div>

          <div className="section" id="account">
            <h2>2. Your Account</h2>
            <ul>
              <li>Use a real photo and username</li>
              <li>No impersonation of anyone (especially Tyler and his admins)</li>
              <li>Fan/parody accounts are fine if clearly marked</li>
              <li>Ban evading gets you permanently blocked and reported</li>
              <li><strong><a href="/hallie">Hallie, Tyler's AI assistant</a></strong>, monitors all interactions for compliance</li>
            </ul>
          </div>

          <div className="section" id="interactions">
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

          <div className="section" id="consequences">
            <h2>4. Consequences</h2>
            <ul>
              <li><strong>1 Rep:</strong> Warning + mute</li>
              <li><strong>2 Reps:</strong> Temporary ban</li>
              <li><strong>3 Reps:</strong> Permanent ban + legal action if needed</li>
            </ul>
            <p>Close friends of banned users can get blocked too if they're defending the behavior or helping them evade.</p>
          </div>

          <div className="section" id="appeals">
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
            <p>
              We only overturn bans with solid evidence supporting the appeal.
            </p>
          </div>

          <div className="section" id="final-notes">
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

          <div className="section" id="changes">
            <h2>Changes to These Policies</h2>
            <p>
              TJB Management Inc. reserves the right to update these disclaimers and guidelines at any time. Changes will be effective immediately upon posting to this page.
            </p>
          </div>

          <div className="section" id="questions">
            <h2>Questions or Concerns?</h2>
            <p>
              If you have questions about these policies, please <a href="/contact">contact us</a>.
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
