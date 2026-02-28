export default function Legal() {
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
            background-color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #ccc;
            line-height: 1.6;
          }
          main {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #0f172a;
          }
          h1 {
            color: #fff;
            margin-bottom: 30px;
            font-size: 32px;
          }
          h2 {
            color: #a855f7;
            margin-top: 40px;
            margin-bottom: 15px;
            font-size: 20px;
          }
          p {
            margin-bottom: 15px;
            color: #ccc;
          }
          ul {
            margin-left: 20px;
            margin-bottom: 15px;
          }
          li {
            margin-bottom: 8px;
            color: #ccc;
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
            border-left: 3px solid #a855f7;
            margin-bottom: 30px;
            border-radius: 5px;
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
          }
          .menu-button:hover {
            background-color: #9333ea;
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
      </head>
      <body>
        <button className="menu-button" onclick="document.getElementById('menuDropdown').classList.toggle('active')">☰ Menu</button>
        <div id="menuDropdown" className="menu-dropdown">
          <a href="#ai-disclaimer">AI Assistant Disclaimer</a>
          <a href="#data-collection">Data Collection & Privacy</a>
          <a href="#contact-info">Contact Information Use</a>
          <a href="#basics">1. The Basics</a>
          <a href="#account">2. Your Account</a>
          <a href="#interactions">3. Interactions with Tyler</a>
          <a href="#consequences">4. Consequences</a>
          <a href="#appeals">5. Appeals</a>
          <a href="#final-notes">6. Final Notes and Disclosures</a>
          <a href="#changes">Changes to These Policies</a>
          <a href="#questions">Questions or Concerns?</a>
        </div>
        <main>
          <a href="/" className="back-link">← Back to Home</a>
          
          <h1>Legal Disclaimers & Community Guidelines</h1>
          
          <div className="section" id="ai-disclaimer">
            <h2>AI Assistant Disclaimer</h2>
            <p>
              This website is managed by <strong>Hallie, Tyler's AI assistant</strong>. All responses to emails, direct messages, and social media inquiries are <strong>reviewed and responded to by Hallie, Tyler's AI assistant</strong> and not directly reviewed by Tyler Beasley unless they are escalated as requiring his personal attention.
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
              <li>Respond to inquiries and requests</li>
              <li>Send automated responses via Hallie, Tyler's AI assistant</li>
              <li>Provide updates or important information</li>
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
              <li>Hallie, Tyler's AI assistant, monitors all interactions for compliance</li>
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
              <li>Platform they are blocked on</li>
              <li>What they did to get blocked</li>
              <li>Why they would like to be unblocked</li>
            </ul>
            <p>
              We only overturn bans with solid evidence supporting the appeal.
            </p>
          </div>

          <div className="section" id="final-notes">
            <h2>6. Final Notes and Disclosures</h2>
            <p>
              We monitor all activity, by the use of Hallie, Tyler's AI assistant, and human moderation, and reserve the right to escalate to law enforcement. By being here, and on any of our social media, you agree and consent to these rules and our use of AI moderation to ensure compliance with our community guidelines and the collection of your personal information. Information we collect is:
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
              If you have questions about these policies, please contact us through one of our options on the <a href="/">main page</a>.
            </p>
          </div>

          <div className="footer">
            <p>Last Updated: February 28, 2026</p>
            <p>© 2026 TJB Management Inc. All rights reserved.</p>
          </div>
        </main>
      </body>
    </html>
  );
}
