'use client';

import { useState, useEffect } from 'react';

export default function HallieTikTokLegal() {
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
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-main.jpeg");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -3;
          pointer-events: none;
        }
        body { margin: 0; padding: 0; background: transparent; }

        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.3); }
          50% { text-shadow: 0 0 40px rgba(168,85,247,1), 0 0 60px rgba(236,72,153,0.8), 0 0 80px rgba(59,130,246,0.5), 0 0 100px rgba(168,85,247,0.4); }
        }

        main { max-width: 900px; margin: 0 auto; padding: 40px 20px; position: relative; z-index: 10; }
        h1 { color: #d4a5ff; margin-bottom: 8px; font-size: 28px; animation: glowPulse 3s ease-in-out infinite; line-height: 1.3; }
        h2 { color: #a855f7; margin-top: 40px; margin-bottom: 15px; font-size: 18px; animation: glowPulse 3s ease-in-out infinite; }
        h3 { color: #c084fc; margin-top: 24px; margin-bottom: 10px; font-size: 15px; }
        p { color: #7dd3fc; margin-bottom: 15px; line-height: 1.8; font-size: 14px; }
        li { color: #7dd3fc; margin-bottom: 10px; line-height: 1.8; font-size: 14px; }
        ul { padding-left: 20px; }

        strong {
          font-weight: 700;
          background: linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .rainbow {
          background: linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          font-weight: 700;
        }
        .back-link { display: inline-block; margin-bottom: 30px; color: #a855f7; text-decoration: none; font-weight: 500; }
        .back-link:hover { text-decoration: underline; }

        .section {
          padding: 20px; border-left: 8px solid #a855f7; margin-bottom: 30px;
          border-radius: 5px; background: transparent;
          transition: all 0.6s ease; opacity: 0; transform: translateY(20px);
        }
        .section.visible { opacity: 1; transform: translateY(0); }

        .subtitle { color: #64748b; font-size: 13px; margin-bottom: 30px; }

        .menu-button {
          position: fixed; top: 20px; right: 20px; background: #a855f7; color: white;
          border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;
          font-size: 16px; z-index: 100; transition: all 0.2s;
        }
        .menu-button:hover { background: #c084fc; transform: scale(1.05); box-shadow: 0 0 20px rgba(168,85,247,0.6); }
        .menu-dropdown {
          position: fixed; top: 70px; right: 20px; background: rgba(15,23,42,0.95);
          border: 1px solid rgba(168,85,247,0.3); border-radius: 8px;
          display: none; flex-direction: column; z-index: 99; min-width: 180px;
        }
        .menu-dropdown.active { display: flex; }
        .menu-dropdown a { display: block; padding: 10px 20px; color: #a855f7; text-decoration: none; border-bottom: 1px solid rgba(168,85,247,0.2); transition: background-color 0.2s; }
        .menu-dropdown a:last-child { border-bottom: none; }
        .menu-dropdown a:hover { background-color: rgba(168,85,247,0.1); }

        .toc { background: rgba(168,85,247,0.05); border: 1px solid rgba(168,85,247,0.2); border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .toc p { color: #a855f7; font-weight: 600; font-size: 13px; margin-bottom: 10px; }
        .toc ol { color: #7dd3fc; font-size: 13px; padding-left: 20px; }
        .toc li { margin-bottom: 6px; }
        .toc a { color: #7dd3fc; text-decoration: none; }
        .toc a:hover { color: #c084fc; text-decoration: underline; }

        footer {
          max-width: 900px; margin: 60px auto 0; padding: 40px 20px;
          border-top: 1px solid rgba(168,85,247,0.2); color: #8b9dc3;
          text-align: center; font-size: 14px;
        }
        footer p { margin-bottom: 1.5em; margin-top: 0; line-height: 1.6; background: linear-gradient(90deg, #d946ef, #a855f7, #3b82f6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

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
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/legal" className="back-link">← Back to Legal</a>

        <h1>Hallie TikTok Moderation System</h1>
        <p className="subtitle">
          Data Security, Privacy & Compliance Policy · TJB Management Inc.<br />
          Effective Date: July 1, 2026 · Last Updated: July 1, 2026
        </p>

        <div className="toc">
          <p>Table of Contents</p>
          <ol>
            <li><a href="#about">About This System</a></li>
            <li><a href="#data-collected">Data Collected</a></li>
            <li><a href="#privacy-notice">Privacy Notice</a></li>
            <li><a href="#data-subject-rights">Data Subject Rights</a></li>
            <li><a href="#data-retention">Data Retention</a></li>
            <li><a href="#data-minimization">Data Minimization</a></li>
            <li><a href="#roles">Dedicated Roles & Responsibilities</a></li>
            <li><a href="#infosec">Information Security Policy</a></li>
            <li><a href="#network">Network Security</a></li>
            <li><a href="#endpoint">Endpoint Protection</a></li>
            <li><a href="#security-baselines">Security Baselines</a></li>
            <li><a href="#data-protection">Data Protection & Encryption</a></li>
            <li><a href="#access-control">Access Control Policy</a></li>
            <li><a href="#vulnerability">Vulnerability Management</a></li>
            <li><a href="#incident">Incident Management</a></li>
            <li><a href="#subprocessors">Subprocessors & Infrastructure</a></li>
            <li><a href="#contact">Contact & Requests</a></li>
          </ol>
        </div>

        <div className="section" id="about">
          <h2>1. About This System</h2>
          <p>
            The <strong>Hallie TikTok Moderation System</strong> is a proprietary comment moderation platform developed and operated exclusively by TJB Management Inc. ("TJB Management," "we," "us," or "our"), a company headquartered in the United States.
          </p>
          <p>
            The system connects to TikTok's Business API on behalf of a single authorized TikTok Business Account — the TJB Management Inc. TikTok account — to automatically retrieve, score, and moderate comments posted to that account's videos. It is not a multi-tenant or third-party SaaS product. No other organization's TikTok data is processed by this system.
          </p>
          <p>
            The system operates under TikTok's API for Business Developer Terms and is subject to TikTok's Data Security and Privacy Review (DSPR) as a condition of accessing the TikTok Business Messaging scope.
          </p>
        </div>

        <div className="section" id="data-collected">
          <h2>2. Data Collected</h2>
          <p>The Hallie Moderation System accesses and processes the following data via the TikTok Business API:</p>
          <h3>Comment Data</h3>
          <ul>
            <li><span className="rainbow">Comment text</span> — the content of comments posted to TJB Management's TikTok videos</li>
            <li><span className="rainbow">Comment ID</span> — TikTok's internal identifier for each comment</li>
            <li><span className="rainbow">Username</span> — the TikTok username of the commenter</li>
            <li><span className="rainbow">Timestamp</span> — the date and time the comment was posted</li>
            <li><span className="rainbow">Like count</span> — the number of likes a comment has received</li>
            <li><span className="rainbow">Comment status</span> — whether a comment is visible or hidden</li>
          </ul>
          <h3>Video Metadata</h3>
          <ul>
            <li><span className="rainbow">Video ID</span> — TikTok's internal identifier for each video</li>
            <li><span className="rainbow">Video title and creation date</span> — used for display and organization only</li>
            <li><span className="rainbow">View, like, comment, and share counts</span> — used for display only</li>
          </ul>
          <h3>Account Data</h3>
          <ul>
            <li><span className="rainbow">Display name and avatar</span> — fetched to display the connected account identity in the admin interface</li>
            <li><span className="rainbow">Follower, like, and video counts</span> — used for display only</li>
          </ul>
          <p>We do not collect or process direct messages, payment information, private account data, or any data beyond what is explicitly listed above.</p>
        </div>

        <div className="section" id="privacy-notice">
          <h2>3. Privacy Notice</h2>
          <h3>What data we collect</h3>
          <p>As described in Section 2, we collect TikTok comment text, usernames, comment IDs, and associated video metadata through TikTok's authorized Business API.</p>
          <h3>Why we collect it</h3>
          <p>Data is collected solely to perform automated comment moderation — identifying and hiding comments that contain profanity, harassment, hate speech, spam, scams, or other content that violates TJB Management's community standards. This serves the legitimate interest of maintaining a safe and respectful community on TJB Management's TikTok content.</p>
          <h3>How data is used</h3>
          <p>Comment text is passed through a local, rule-based scoring algorithm. No comment data is sent to third-party AI or analytics services. Comments that score above a moderation threshold are automatically hidden via TikTok's API. A moderation event log is maintained in memory for operational review.</p>
          <h3>Where data is transferred</h3>
          <p>Data travels between TikTok's servers and our infrastructure hosted on Vercel Inc. (a SOC 2 Type II certified provider) in the United States. No comment data is shared with, sold to, or transferred to any third party. The only outbound API calls are back to TikTok to perform hide/reply actions authorized by the account holder.</p>
          <h3>How data is protected</h3>
          <p>All data in transit is encrypted using TLS 1.2 or above. Session tokens are stored as HttpOnly cookies inaccessible to client-side scripts. The admin interface is protected by a secret key accessible only to authorized personnel.</p>
          <h3>How long data is stored</h3>
          <p>Comment data is processed transiently in memory and is not written to a persistent database. A rolling in-memory event log retains up to 50 recent moderation events and is cleared on server restart. OAuth access tokens are stored as HttpOnly cookies with a 30-day expiration and are not persisted beyond that. See Section 5 for the full data retention policy.</p>
        </div>

        <div className="section" id="data-subject-rights">
          <h2>4. Data Subject Rights</h2>
          <p>TJB Management Inc. respects the data rights of individuals in accordance with applicable privacy regulations including GDPR and CPRA. The following rights apply to personal data processed by the Hallie Moderation System:</p>
          <ul>
            <li><strong>Right to Access</strong> — Individuals may request a copy of any personal data we hold about them.</li>
            <li><strong>Right to Correction</strong> — Individuals may request that inaccurate personal data be corrected.</li>
            <li><strong>Right to Deletion</strong> — Individuals may request that their personal data be deleted. Because we do not maintain a persistent database of comment data, most data is cleared automatically. Upon request, we will ensure any retained identifiers are removed.</li>
            <li><strong>Right to Restriction</strong> — Individuals may request that processing of their data be restricted while a complaint is under review.</li>
            <li><strong>Right to Object</strong> — Individuals may object to processing of their personal data where processing is based on legitimate interests.</li>
            <li><strong>Right to Data Portability</strong> — Individuals may request a structured, machine-readable export of their data.</li>
          </ul>
          <p>To exercise any of these rights, contact us at <strong>privacy@tjbmanagementinc.com</strong>. We will respond within 30 days. Identity verification may be required before fulfilling a request.</p>
        </div>

        <div className="section" id="data-retention">
          <h2>5. Data Retention</h2>
          <p>Personal data is retained only as long as necessary to fulfill the purpose for which it was collected:</p>
          <ul>
            <li><strong>Comment text and usernames</strong> — processed transiently in memory. Not written to persistent storage. Cleared on server restart (typically within hours on serverless infrastructure).</li>
            <li><strong>Moderation event log</strong> — up to 50 events retained in memory. Rolling — oldest events are overwritten as new events are added. Cleared on server restart.</li>
            <li><strong>Seen comment IDs</strong> — stored in memory to prevent reprocessing. Cleared on server restart.</li>
            <li><strong>OAuth tokens</strong> — stored as HttpOnly cookies on the authorized administrator's device only. Expire after 30 days. Not stored server-side beyond the active session.</li>
          </ul>
          <p>When a TikTok Business Account user revokes API authorization, all associated tokens are invalidated and no further data can be accessed. Any cached data is cleared upon the next server restart.</p>
          <p>We do not retain personal data beyond the periods stated above. Users who wish to request immediate deletion of any residual data may do so by contacting <strong>privacy@tjbmanagementinc.com</strong>.</p>
        </div>

        <div className="section" id="data-minimization">
          <h2>6. Data Minimization</h2>
          <p>
            The Hallie Moderation System requests only the minimum API scopes necessary to perform comment moderation. Specifically:
          </p>
          <ul>
            <li>We request <strong>comment.list</strong> and <strong>comment.list.manage</strong> scopes to read and moderate comments</li>
            <li>We request <strong>video.list</strong> to identify which videos have comments to moderate</li>
            <li>We request <strong>user.info.basic</strong> and related scopes solely to display the connected account identity in the admin interface</li>
          </ul>
          <p>We do not request scopes beyond those listed. We do not request access to direct messages, financial data, advertising data, or any other data unrelated to comment moderation. API fields requested are limited to those required for scoring and action — we do not fetch fields that are not used by the system.</p>
        </div>

        <div className="section" id="roles">
          <h2>7. Dedicated Roles & Responsibilities</h2>
          <p>TJB Management Inc. has designated the following responsibilities for data privacy and security compliance:</p>
          <ul>
            <li><strong>Data Controller & Privacy Officer:</strong> Tyler J. Beasley, Founder & CEO, TJB Management Inc. Tyler is responsible for all decisions regarding data collection, processing, and protection, and serves as the primary point of contact for all privacy-related inquiries.</li>
            <li><strong>Security Officer:</strong> Tyler J. Beasley. Responsible for maintaining and reviewing security policies, access controls, and incident response procedures.</li>
            <li><strong>System Administrator:</strong> Tyler J. Beasley. The sole authorized administrator of the Hallie Moderation System. No other individuals have administrative access.</li>
          </ul>
          <p>Privacy and security inquiries may be directed to <strong>privacy@tjbmanagementinc.com</strong> or <strong>security@tjbmanagementinc.com</strong>.</p>
        </div>

        <div className="section" id="infosec">
          <h2>8. Information Security Policy</h2>
          <p>
            TJB Management Inc. maintains an information security framework governing the operation of the Hallie Moderation System. This policy is reviewed and updated at least annually and is signed off by Tyler J. Beasley as senior leadership.
          </p>
          <p>Core security principles applied to this system:</p>
          <ul>
            <li><strong>Least Privilege</strong> — system access is restricted to the minimum required to perform authorized functions</li>
            <li><strong>Defense in Depth</strong> — multiple layers of security controls are applied at the application, infrastructure, and operational levels</li>
            <li><strong>Data Minimization</strong> — only the data necessary for moderation is accessed or retained</li>
            <li><strong>Secure by Default</strong> — all new features and configurations default to the most restrictive setting</li>
            <li><strong>Continuous Improvement</strong> — security controls are reviewed following any incident, significant change, or annually at minimum</li>
          </ul>
        </div>

        <div className="section" id="network">
          <h2>9. Network Security</h2>
          <p>The Hallie Moderation System is hosted on Vercel Inc.'s serverless infrastructure, which provides the following network-level protections:</p>
          <ul>
            <li>All traffic is routed through Vercel's edge network with DDoS protection and traffic filtering</li>
            <li>All endpoints are served exclusively over HTTPS with TLS 1.2 or above — HTTP is not permitted</li>
            <li>Serverless function environments are fully isolated — there is no persistent shared runtime between requests</li>
            <li>Network access to the admin interface requires knowledge of a secret administrator key that is never exposed client-side</li>
            <li>API routes are scoped and protected — unauthenticated requests receive a 401 Unauthorized response and no data is returned</li>
          </ul>
          <p>Vercel maintains a SOC 2 Type II certification. Their security documentation is available at vercel.com/security.</p>
        </div>

        <div className="section" id="endpoint">
          <h2>10. Endpoint Protection</h2>
          <p>Administrative access to the Hallie Moderation System is performed exclusively from devices owned and controlled by Tyler J. Beasley. The following endpoint protections are in place on all devices used to administer this system:</p>
          <ul>
            <li>Antivirus and anti-malware software is installed and actively running on all administrator devices</li>
            <li>Operating system and application security patches are applied promptly upon release</li>
            <li>Full-disk encryption is enabled on all administrator devices</li>
            <li>Screen auto-lock is configured to activate after 15 minutes or less of inactivity</li>
            <li>Access to the admin interface from non-administrator devices is blocked by the admin secret key requirement</li>
          </ul>
        </div>

        <div className="section" id="security-baselines">
          <h2>11. Security Baselines</h2>
          <p>The following baseline security measures are enforced for all access to the Hallie Moderation System and associated infrastructure:</p>
          <ul>
            <li><strong>Multi-Factor Authentication (MFA)</strong> — MFA is required on all accounts with access to Vercel, GitHub, and any service that stores or processes system credentials</li>
            <li><strong>Password Requirements</strong> — All passwords are at minimum 16 characters, include uppercase, lowercase, numbers, and special characters, and are managed via a dedicated password manager</li>
            <li><strong>Admin Key</strong> — The system admin interface is protected by a cryptographically random secret key, rotated periodically and stored only as a Vercel environment variable — never in code or version control</li>
            <li><strong>Session Management</strong> — Admin sessions use HttpOnly, Secure, SameSite cookies. OAuth tokens expire after 30 days and require re-authentication</li>
            <li><strong>Screen Lock</strong> — All administrator devices enforce automatic screen lock after 15 minutes of inactivity</li>
            <li><strong>Security Awareness</strong> — Tyler J. Beasley maintains current awareness of security threats and TikTok API security requirements through regular review of industry resources</li>
          </ul>
        </div>

        <div className="section" id="data-protection">
          <h2>12. Data Protection & Encryption</h2>
          <ul>
            <li><strong>Data in Transit</strong> — All data transmitted between clients, the Hallie Moderation System, and TikTok's API is encrypted using TLS 1.2 or above. This is enforced at the infrastructure level by Vercel and cannot be downgraded.</li>
            <li><strong>Data at Rest</strong> — The system does not maintain a persistent database. OAuth tokens stored in cookies are HttpOnly (inaccessible to JavaScript), Secure (HTTPS only), and SameSite=Strict. Environment variables including secrets are encrypted at rest by Vercel's infrastructure using AES-256.</li>
            <li><strong>Secret Management</strong> — API keys, admin secrets, and OAuth credentials are stored exclusively as Vercel environment variables. They are never committed to source control, logged, or exposed in API responses.</li>
            <li><strong>No Third-Party Data Sharing</strong> — Comment data is never transmitted to third-party analytics, advertising, AI training, or any other external service. The only outbound API calls are to TikTok's authorized API endpoints.</li>
          </ul>
        </div>

        <div className="section" id="access-control">
          <h2>13. Access Control Policy</h2>
          <p>Access to the Hallie Moderation System is governed by a strict need-to-know, least-privilege model:</p>
          <ul>
            <li><strong>Administrator access</strong> — Limited exclusively to Tyler J. Beasley. No other individuals hold administrative credentials.</li>
            <li><strong>Authentication</strong> — The admin interface requires a secret key that is stored as an encrypted Vercel environment variable. It is rotated if compromise is suspected.</li>
            <li><strong>No shared accounts</strong> — There is one administrator account. Shared credentials are not used.</li>
            <li><strong>API access</strong> — TikTok API tokens are scoped to the minimum required permissions and stored only in server-side cookies inaccessible to client-side code.</li>
            <li><strong>Source code access</strong> — The codebase is stored in a private GitHub repository. Access is limited to Tyler J. Beasley. MFA is enforced on the GitHub account.</li>
            <li><strong>Infrastructure access</strong> — Vercel project access is limited to Tyler J. Beasley. MFA is enforced on the Vercel account.</li>
            <li><strong>Access review</strong> — Access rights are reviewed at least annually and immediately upon any personnel or organizational change.</li>
          </ul>
        </div>

        <div className="section" id="vulnerability">
          <h2>14. Vulnerability Management</h2>
          <p>TJB Management Inc. maintains the following vulnerability management practices for the Hallie Moderation System:</p>
          <ul>
            <li><strong>Dependency management</strong> — All npm dependencies are regularly audited using <code style={{ color: '#c084fc', fontSize: 13 }}>npm audit</code>. Critical and high vulnerabilities are remediated within 7 days of discovery.</li>
            <li><strong>Infrastructure scanning</strong> — Vercel provides automated infrastructure-level vulnerability detection and patching as part of its platform.</li>
            <li><strong>Code review</strong> — All code changes are reviewed before deployment. Security implications are evaluated for each change.</li>
            <li><strong>Penetration testing</strong> — External penetration testing is conducted at least annually or following any significant system change.</li>
            <li><strong>Vulnerability disclosure</strong> — Security vulnerabilities may be reported to <strong>security@tjbmanagementinc.com</strong>. We commit to acknowledging reports within 48 hours and remediating critical issues within 7 days.</li>
            <li><strong>Scan retention</strong> — Vulnerability scan reports and penetration test results are retained for a minimum of 12 months.</li>
          </ul>
        </div>

        <div className="section" id="incident">
          <h2>15. Incident Management</h2>
          <p>TJB Management Inc. maintains an incident response policy for the Hallie Moderation System. In the event of a security incident or data breach involving TikTok Business Account data:</p>
          <h3>Detection & Containment</h3>
          <ul>
            <li>Suspicious activity is monitored through Vercel's runtime logs and error tracking</li>
            <li>Upon discovery of a potential incident, all affected tokens and credentials are immediately revoked and rotated</li>
            <li>The affected system is isolated as quickly as possible to prevent further exposure</li>
          </ul>
          <h3>Assessment & Notification</h3>
          <ul>
            <li>The scope and nature of the incident is assessed within 24 hours of discovery</li>
            <li>TikTok is notified of any incident affecting TikTok user data within 72 hours in accordance with applicable regulatory requirements</li>
            <li>Affected individuals are notified as required by applicable law (GDPR, CPRA)</li>
          </ul>
          <h3>Recovery & Review</h3>
          <ul>
            <li>All access credentials involved in the incident are permanently rotated</li>
            <li>A post-incident review is conducted within 7 days to identify root cause and implement preventative measures</li>
            <li>Incident reports are documented and retained for a minimum of 12 months</li>
            <li>Incident response procedures are tested at least annually through a tabletop exercise</li>
          </ul>
          <p>To report a security incident or suspected breach, contact <strong>security@tjbmanagementinc.com</strong> immediately.</p>
        </div>

        <div className="section" id="subprocessors">
          <h2>16. Subprocessors & Infrastructure</h2>
          <p>The Hallie Moderation System relies on the following third-party subprocessors. All subprocessors are subject to appropriate data protection agreements:</p>
          <ul>
            <li><strong>Vercel Inc.</strong> — Hosting and serverless compute infrastructure. SOC 2 Type II certified. Headquartered in San Francisco, CA, USA. Data processed in the United States. <a href="https://vercel.com/legal/privacy-policy" style={{ color: '#a855f7' }}>Privacy Policy</a></li>
            <li><strong>GitHub Inc. (Microsoft)</strong> — Private source code repository. SOC 2 Type II certified. No production data is stored in version control. <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" style={{ color: '#a855f7' }}>Privacy Policy</a></li>
            <li><strong>TikTok for Business</strong> — Data source. All data originates from TikTok's API and is returned to TikTok via authorized API actions. No TikTok user data is shared with any other party.</li>
          </ul>
          <p>TJB Management Inc. does not use any other subprocessors or third-party services that process TikTok user data. This list is reviewed and updated whenever a new subprocessor is engaged.</p>
          <p><strong>Business Headquarters:</strong> United States<br />
          <strong>Primary Workforce Location:</strong> United States<br />
          <strong>System Location:</strong> United States (Vercel US regions)<br />
          <strong>Foreign Ownership:</strong> None — TJB Management Inc. is 100% US-owned and operated</p>
        </div>

        <div className="section" id="contact">
          <h2>17. Contact & Requests</h2>
          <p>For any questions, data subject requests, privacy inquiries, or security reports related to the Hallie TikTok Moderation System, please contact:</p>
          <ul>
            <li><strong>Privacy inquiries & data requests:</strong> privacy@tjbmanagementinc.com</li>
            <li><strong>Security incidents & vulnerability reports:</strong> security@tjbmanagementinc.com</li>
            <li><strong>General inquiries:</strong> support@tjbmanagementinc.com</li>
          </ul>
          <p>
            <strong>TJB Management Inc.</strong><br />
            Tyler J. Beasley, Data Controller<br />
            United States
          </p>
          <p>We will respond to all privacy and security inquiries within 30 days. Critical security incidents will receive an acknowledgment within 48 hours.</p>
        </div>

        <footer>
          <p>Last Updated: July 1, 2026</p>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>This document constitutes the official Data Security and Privacy Policy for the Hallie TikTok Moderation System as required by TikTok's Data Security and Privacy Review (DSPR) process.</p>
          <p>TikTok and the TikTok logo are trademarks of TikTok US Data Security Joint Venture LLC. TJB Management Inc. is an independent developer and is not affiliated with, endorsed by, or sponsored by TikTok.</p>
        </footer>
      </main>
    </>
  );
}
