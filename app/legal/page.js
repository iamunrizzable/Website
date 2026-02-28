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
            background: linear-gradient(135deg, #0f172a 0%, #0f1419 50%, #000 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #e0e0e0;
            line-height: 1.6;
          }
          main {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
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
            background: rgba(255,255,255,0.03);
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
        `}</style>
      </head>
      <body>
        <main>
          <a href="/" className="back-link">← Back to Home</a>
          
          <h1>Legal Disclaimers & Community Guidelines</h1>
          
          <div className="section">
            <h2>AI Assistant Disclaimer</h2>
            <p>
              This website is managed by <strong>Hallie</strong>, an AI assistant. All responses to emails, direct messages, and social media inquiries are <strong>automated and not directly reviewed by Tyler Beasley</strong> unless they are escalated as requiring his personal attention.
            </p>
            <p>
              Messages may be automatically categorized, filtered, or responded to based on content analysis. Only messages deemed important or requiring direct human response will be forwarded to Tyler.
            </p>
          </div>

          <div className="section">
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
              This data is used solely for website performance optimization and security purposes. We do not share this data with third parties without consent.
            </p>
            <p>
              For more information about Vercel's privacy practices, visit <a href="https://vercel.com/legal/privacy-policy" target="_blank" style={{color: '#a855f7'}}>Vercel's Privacy Policy</a>.
            </p>
          </div>

          <div className="section">
            <h2>Contact Information Use</h2>
            <p>
              Contact information provided via this website (email, phone, social media) may be used to:
            </p>
            <ul>
              <li>Respond to inquiries and requests</li>
              <li>Send automated responses via AI assistant</li>
              <li>Contact you regarding business matters</li>
              <li>Provide updates or important information</li>
            </ul>
            <p>
              We will not sell, rent, or share your contact information with unaffiliated third parties without your explicit consent.
            </p>
          </div>

          <div className="section">
            <h2>Community Guidelines</h2>
            <p>
              When communicating with this website or through associated channels, users agree to:
            </p>
            <ul>
              <li><strong>Be Respectful:</strong> Treat all communications with professionalism and courtesy</li>
              <li><strong>No Harassment:</strong> Do not engage in harassment, threats, or abusive behavior</li>
              <li><strong>No Spam:</strong> Do not send unsolicited commercial messages or spam</li>
              <li><strong>No Illegal Content:</strong> Do not share content that violates laws or regulations</li>
              <li><strong>Intellectual Property:</strong> Respect copyrights, trademarks, and intellectual property rights</li>
              <li><strong>Honesty:</strong> Provide truthful information in all communications</li>
            </ul>
          </div>

          <div className="section">
            <h2>Limitations of Liability</h2>
            <p>
              This website and all content are provided "as is" without warranties of any kind. TJB Management Inc. is not liable for:
            </p>
            <ul>
              <li>Errors or omissions in content</li>
              <li>Automated response accuracy or appropriateness</li>
              <li>Delays in responding to inquiries</li>
              <li>Loss of data or unauthorized access</li>
              <li>Third-party actions or content</li>
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
              If you have questions about these policies, please contact us through the <a href="/" style={{color: '#a855f7'}}>contact form on our main page</a>.
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
