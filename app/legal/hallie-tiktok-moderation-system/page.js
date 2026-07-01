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
          border-top: 1px solid rgba(168,85,247,0.2); color: #8b9dc3; text-align: center; font-size: 14px;
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
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/tiktok-guidelines" onClick={() => setMenuOpen(false)}>TikTok Guidelines</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
      </div>

      <main>
        <a href="/legal" className="back-link">← Back to Legal</a>

        <h1>Hallie Platform — Data Security & Privacy Policy</h1>
        <p className="subtitle">
          TikTok Account Automation Platform · Powered by TJB Management Inc.<br />
          Effective Date: July 1, 2026 · Last Updated: July 1, 2026
        </p>

        <div className="toc">
          <p>Table of Contents</p>
          <ol>
            <li><a href="#about">About the Platform</a></li>
            <li><a href="#definitions">Definitions</a></li>
            <li><a href="#data-collected">Data Collected</a></li>
            <li><a href="#privacy-notice">Privacy Notice</a></li>
            <li><a href="#data-subject-rights">Data Subject Rights</a></li>
            <li><a href="#data-retention">Data Retention</a></li>
            <li><a href="#data-minimization">Data Minimization</a></li>
            <li><a href="#roles">Roles & Responsibilities</a></li>
            <li><a href="#operator-obligations">Operator Obligations</a></li>
            <li><a href="#infosec">Information Security Policy</a></li>
            <li><a href="#network">Network Security</a></li>
            <li><a href="#endpoint">Endpoint Protection</a></li>
            <li><a href="#security-baselines">Security Baselines</a></li>
            <li><a href="#data-protection">Data Protection & Encryption</a></li>
            <li><a href="#access-control">Access Control Policy</a></li>
            <li><a href="#vulnerability">Vulnerability Management</a></li>
            <li><a href="#incident">Incident Management</a></li>
            <li><a href="#subprocessors">Subprocessors & Infrastructure</a></li>
            <li><a href="#usds">US Data Security Compliance</a></li>
            <li><a href="#contact">Contact & Requests</a></li>
          </ol>
        </div>

        <div className="section" id="about">
          <h2>1. About the Platform</h2>
          <p>
            The <strong>Hallie Account Automation Platform</strong> ("Platform") is a TikTok account automation and management system developed and operated by TJB Management Inc. ("Platform Provider"), headquartered in the United States.
          </p>
          <p>
            The Platform connects to TikTok's Business API on behalf of authorized TikTok Business Accounts to automate account operations including content publishing, comment management, community moderation, mention monitoring, trending discovery, and automated rule execution. It is designed to help brands, creators, and businesses run their TikTok presence with as little manual intervention as possible.
          </p>
          <p>
            This Policy governs the Platform's data handling practices and applies to all businesses and individuals ("Operators") who use the Platform to manage their TikTok Business Accounts. By using the Platform, Operators agree to this Policy and accept responsibility for ensuring their own use complies with applicable laws and TikTok's terms.
          </p>
          <p>
            The Platform operates under TikTok's API for Business Developer Terms and is subject to TikTok's Data Security and Privacy Review (DSPR) as a condition of accessing the full scope of TikTok Business API permissions.
          </p>
        </div>

        <div className="section" id="definitions">
          <h2>2. Definitions</h2>
          <ul>
            <li><strong>Platform Provider</strong> — TJB Management Inc., the company that develops, operates, and maintains the Hallie Platform.</li>
            <li><strong>Operator</strong> — Any business, brand, creator, or individual who uses the Hallie Platform to moderate their TikTok Business Account(s).</li>
            <li><strong>End User</strong> — TikTok users who post comments on an Operator's TikTok content. End Users do not interact with the Platform directly.</li>
            <li><strong>Platform</strong> — The Hallie Account Automation Platform, including all associated software, APIs, and infrastructure.</li>
            <li><strong>TikTok Business Account</strong> — An Operator's authorized TikTok account connected to the Platform via TikTok's API.</li>
          </ul>
        </div>

        <div className="section" id="data-collected">
          <h2>3. Data Collected</h2>
          <p>The Platform accesses and processes the following data via the TikTok Business API on behalf of each Operator:</p>
          <h3>Comment & Community Data</h3>
          <ul>
            <li><span className="rainbow">Comment text</span> — the content of comments posted to an Operator's TikTok videos</li>
            <li><span className="rainbow">Comment ID</span> — TikTok's internal identifier for each comment</li>
            <li><span className="rainbow">Username</span> — the TikTok username of the commenter</li>
            <li><span className="rainbow">Timestamp</span> — the date and time the comment was posted</li>
            <li><span className="rainbow">Like count</span> — the number of likes a comment has received</li>
            <li><span className="rainbow">Comment status</span> — whether a comment is visible or hidden</li>
          </ul>
          <h3>Content & Publishing Data</h3>
          <ul>
            <li><span className="rainbow">Video ID, title, and creation date</span> — used for content management and organization</li>
            <li><span className="rainbow">View, like, comment, and share counts</span> — used for performance analytics</li>
            <li><span className="rainbow">Video settings and publish status</span> — used to manage and schedule content on behalf of Operators</li>
            <li><span className="rainbow">Post authorization data</span> — used to authorize, track, and manage content actions</li>
            <li><span className="rainbow">Location data</span> — used only when Operators choose to tag a location on published content</li>
          </ul>
          <h3>Mentions & Discovery Data</h3>
          <ul>
            <li><span className="rainbow">Hashtag and keyword mentions</span> — monitored to track brand presence and community activity</li>
            <li><span className="rainbow">Trending search terms and hashtags</span> — used for content strategy and discovery</li>
            <li><span className="rainbow">Mention video metadata</span> — titles and engagement counts of videos mentioning an Operator's account or hashtags</li>
          </ul>
          <h3>Account Data</h3>
          <ul>
            <li><span className="rainbow">Display name and avatar</span> — fetched to identify the connected account in the Operator's dashboard</li>
            <li><span className="rainbow">Follower, like, and video counts</span> — used for display and performance benchmarking</li>
          </ul>
          <h3>Automated Rules Data</h3>
          <ul>
            <li><span className="rainbow">Rule definitions and configurations</span> — the automation rules Operators create and manage within the Platform</li>
            <li><span className="rainbow">Rule execution results</span> — the outcome of automated actions triggered by Operator-defined rules</li>
          </ul>
          <p>The Platform does not collect or process direct messages, payment information, private account data, advertising campaign data, or any data beyond what is explicitly listed above.</p>
        </div>

        <div className="section" id="privacy-notice">
          <h2>4. Privacy Notice</h2>
          <h3>What data is collected</h3>
          <p>As described in Section 3, the Platform collects TikTok comment text, usernames, comment IDs, and associated video metadata through TikTok's authorized Business API on behalf of each Operator.</p>
          <h3>Why it is collected</h3>
          <p>Data is collected to power automated TikTok account management on behalf of Operators — including publishing content, moderating communities, monitoring brand mentions, discovering trending opportunities, and executing automated account rules. Processing is based on the legitimate interests of Operators in managing and growing their TikTok presence efficiently.</p>
          <h3>How data is used</h3>
          <p>Account data is used to perform authorized automation actions: publishing or scheduling content, hiding or pinning comments, replying to comments, managing hashtag mentions, surfacing trending keywords, and executing Operator-defined automation rules. Comment text is analyzed by the Platform's rule-based scoring engine to identify content requiring moderation. No Operator or End User data is sent to third-party AI, analytics, or advertising services. All API calls are back to TikTok on behalf of the Operator.</p>
          <h3>Where data is transferred</h3>
          <p>Data travels between TikTok's servers and Platform infrastructure hosted on Vercel Inc. (a SOC 2 Type II certified provider) in the United States. No Operator or End User data is shared with, sold to, or transferred to any third party. The only outbound API calls are back to TikTok to perform actions authorized by the Operator.</p>
          <h3>How data is protected</h3>
          <p>All data in transit is encrypted using TLS 1.2 or above. Session tokens are stored as HttpOnly cookies inaccessible to client-side scripts. Each Operator's admin interface is protected by a unique secret key accessible only to authorized personnel within that Operator's organization.</p>
          <h3>How long data is stored</h3>
          <p>Account and content data is processed transiently in memory and is not written to a persistent database. A rolling in-memory event log retains recent automation events per Operator and is cleared on server restart. OAuth access tokens are stored as HttpOnly cookies with a 30-day expiration. See Section 6 for the full data retention policy.</p>
        </div>

        <div className="section" id="data-subject-rights">
          <h2>5. Data Subject Rights</h2>
          <p>The Platform respects the data rights of End Users in accordance with applicable privacy regulations including GDPR and CPRA. Operators are responsible for facilitating these rights for their End Users. The following rights apply to personal data processed by the Platform:</p>
          <ul>
            <li><strong>Right to Access</strong> — End Users may request a copy of any personal data processed on their behalf.</li>
            <li><strong>Right to Correction</strong> — End Users may request that inaccurate personal data be corrected.</li>
            <li><strong>Right to Deletion</strong> — End Users may request deletion of their personal data. Because the Platform does not maintain a persistent database of comment data, most data is cleared automatically on server restart. Upon request, any retained identifiers will be removed.</li>
            <li><strong>Right to Restriction</strong> — End Users may request that processing of their data be restricted while a complaint is under review.</li>
            <li><strong>Right to Object</strong> — End Users may object to processing of their personal data where processing is based on legitimate interests.</li>
            <li><strong>Right to Data Portability</strong> — End Users may request a structured, machine-readable export of their data.</li>
          </ul>
          <p>To exercise any of these rights, contact the Platform Provider at <strong>support@tjbmanagementinc.com</strong>. We will respond within 30 days. Identity verification may be required before fulfilling a request. Operators may also direct End User data requests to the Platform Provider on their behalf.</p>
        </div>

        <div className="section" id="data-retention">
          <h2>6. Data Retention</h2>
          <p>Personal data is retained only as long as necessary to fulfill the purpose for which it was collected:</p>
          <ul>
            <li><strong>Comment text and usernames</strong> — processed transiently in memory. Not written to persistent storage. Cleared on server restart.</li>
            <li><strong>Automation event log</strong> — recent automation events retained in memory per Operator session. Rolling — oldest events are overwritten as new events are added. Cleared on server restart.</li>
            <li><strong>Seen content IDs</strong> — stored in memory to prevent reprocessing. Cleared on server restart.</li>
            <li><strong>OAuth tokens</strong> — stored as HttpOnly cookies on the Operator's authorized device only. Expire after 30 days. Not persisted beyond the active session.</li>
          </ul>
          <p>When an Operator disconnects their TikTok Business Account or revokes API authorization, all associated tokens are invalidated and no further data can be accessed. Any cached data is cleared upon the next server restart.</p>
          <p>Operators or End Users who wish to request immediate deletion of any residual data may do so by contacting <strong>support@tjbmanagementinc.com</strong>.</p>
        </div>

        <div className="section" id="data-minimization">
          <h2>7. Data Minimization</h2>
          <p>
            The Platform requests only the minimum API scopes necessary to perform authorized account automation functions. Specifically:
          </p>
          <ul>
            <li>The Platform requests <strong>comment.list</strong> and <strong>comment.list.manage</strong> scopes to read and manage comments on behalf of Operators</li>
            <li>The Platform requests <strong>video.list</strong> and <strong>video.publish</strong> scopes to manage and publish content on behalf of Operators</li>
            <li>The Platform requests <strong>discovery.search.words</strong> and mention-related scopes to surface trending content and monitor brand mentions</li>
            <li>The Platform requests <strong>user.info.basic</strong> and related scopes to display the connected account identity in each Operator's dashboard</li>
          </ul>
          <p>No scopes beyond those necessary for authorized functions are requested. The Platform does not request access to direct messages, financial data, advertising campaign data, or any other data outside the scope of account automation. API fields are limited to those actively used by the Platform — no unused fields are fetched.</p>
        </div>

        <div className="section" id="roles">
          <h2>8. Roles & Responsibilities</h2>
          <p>The following role structure governs data responsibilities under this Policy:</p>
          <ul>
            <li><strong>Platform Provider (TJB Management Inc.)</strong> — Acts as a data processor on behalf of Operators. Responsible for the security and integrity of the Platform infrastructure, and for processing data only as directed by Operators and as permitted under this Policy.</li>
            <li><strong>Operator</strong> — Acts as the data controller for their TikTok Business Account and the End Users who interact with their content. Operators are responsible for their own privacy notices, lawful basis for processing, and compliance with applicable local laws.</li>
            <li><strong>Platform Privacy & Security Contact</strong> — support@tjbmanagementinc.com. All privacy inquiries, data subject requests, and security incidents related to the Platform should be directed here.</li>
          </ul>
          <p>Operators must designate a Data Protection Officer (DPO) or equivalent privacy contact within their own organization where required by applicable law (e.g., GDPR Article 37).</p>
        </div>

        <div className="section" id="operator-obligations">
          <h2>9. Operator Obligations</h2>
          <p>By using the Hallie Platform, Operators agree to the following obligations:</p>
          <ul>
            <li><strong>Lawful basis</strong> — Operators must have a valid lawful basis under applicable privacy law for processing End User data through the Platform.</li>
            <li><strong>Privacy notice</strong> — Operators must maintain a publicly accessible privacy notice that discloses their use of automated account management tools and the processing of End User data.</li>
            <li><strong>Credential security</strong> — Operators are responsible for securing their admin credentials and TikTok OAuth tokens. Credentials must not be shared with unauthorized personnel.</li>
            <li><strong>Authorized use only</strong> — Operators may only use the Platform to moderate their own TikTok Business Account(s) that they are authorized to manage.</li>
            <li><strong>Compliance with TikTok terms</strong> — Operators must comply with all applicable TikTok API for Business Developer Terms and Community Guidelines.</li>
            <li><strong>Data subject requests</strong> — Operators must be able to assist End Users in exercising their data rights and must direct such requests to the Platform Provider where necessary.</li>
            <li><strong>No resale</strong> — Operators may not resell, sublicense, or otherwise provide Platform access to third parties without written authorization from the Platform Provider.</li>
          </ul>
        </div>

        <div className="section" id="infosec">
          <h2>10. Information Security Policy</h2>
          <p>
            The Platform Provider maintains a comprehensive information security framework governing all aspects of the Hallie Platform. This framework is reviewed and updated at least annually.
          </p>
          <p>Core security principles applied to the Platform:</p>
          <ul>
            <li><strong>Least Privilege</strong> — Platform access is restricted to the minimum required to perform authorized functions at both the infrastructure and application level.</li>
            <li><strong>Defense in Depth</strong> — Multiple layers of security controls are applied at the application, infrastructure, and operational levels.</li>
            <li><strong>Data Minimization</strong> — Only the data necessary for moderation is accessed or retained. No data is processed beyond what Operators authorize.</li>
            <li><strong>Secure by Default</strong> — All new features and configurations default to the most restrictive setting and require explicit enablement.</li>
            <li><strong>Continuous Improvement</strong> — Security controls are reviewed following any incident, significant change, or annually at minimum.</li>
          </ul>
        </div>

        <div className="section" id="network">
          <h2>11. Network Security</h2>
          <p>The Platform is hosted on Vercel Inc.'s serverless infrastructure, which provides the following network-level protections:</p>
          <ul>
            <li>All traffic is routed through Vercel's edge network with DDoS protection and traffic filtering</li>
            <li>All endpoints are served exclusively over HTTPS with TLS 1.2 or above — HTTP is not permitted</li>
            <li>Serverless function environments are fully isolated — there is no persistent shared runtime between requests or between Operators</li>
            <li>Network access to each Operator's dashboard requires a unique secret administrator key that is never exposed client-side</li>
            <li>All API routes are access-controlled — unauthenticated requests receive a 401 Unauthorized response and no data is returned</li>
          </ul>
          <p>Vercel maintains a SOC 2 Type II certification. Their security documentation is available at vercel.com/security.</p>
        </div>

        <div className="section" id="endpoint">
          <h2>12. Endpoint Protection</h2>
          <p>Platform Provider personnel with administrative access to Platform infrastructure maintain the following endpoint protections on all devices used to administer the Platform:</p>
          <ul>
            <li>Antivirus and anti-malware software is installed and actively running on all administrator devices</li>
            <li>Operating system and application security patches are applied promptly upon release</li>
            <li>Full-disk encryption is enabled on all administrator devices</li>
            <li>Screen auto-lock is configured to activate after 15 minutes or less of inactivity</li>
          </ul>
          <p>Operators are expected to maintain equivalent endpoint protections on any device used to access their Hallie Platform dashboard.</p>
        </div>

        <div className="section" id="security-baselines">
          <h2>13. Security Baselines</h2>
          <p>The following baseline security measures are enforced for all access to the Platform and associated infrastructure:</p>
          <ul>
            <li><strong>Multi-Factor Authentication (MFA)</strong> — MFA is required on all accounts with access to Platform infrastructure, including Vercel and source code repositories</li>
            <li><strong>Password Requirements</strong> — All passwords are at minimum 16 characters, include uppercase, lowercase, numbers, and special characters, and are managed via a dedicated password manager</li>
            <li><strong>Operator Admin Keys</strong> — Each Operator's admin interface is protected by a unique cryptographically random secret key, stored only as an encrypted environment variable — never in code or version control</li>
            <li><strong>Session Management</strong> — Operator sessions use HttpOnly, Secure, SameSite cookies. OAuth tokens expire after 30 days and require re-authentication</li>
            <li><strong>Screen Lock</strong> — All Platform Provider administrator devices enforce automatic screen lock after 15 minutes of inactivity</li>
            <li><strong>Security Awareness</strong> — Platform Provider personnel maintain current awareness of security threats and TikTok API security requirements through regular review of industry resources and security advisories</li>
          </ul>
        </div>

        <div className="section" id="data-protection">
          <h2>14. Data Protection & Encryption</h2>
          <ul>
            <li><strong>Data in Transit</strong> — All data transmitted between Operators, the Platform, and TikTok's API is encrypted using TLS 1.2 or above. This is enforced at the infrastructure level by Vercel and cannot be downgraded.</li>
            <li><strong>Data at Rest</strong> — The Platform does not maintain a persistent database. OAuth tokens stored in cookies are HttpOnly (inaccessible to JavaScript), Secure (HTTPS only), and SameSite=Strict. Environment variables including all secrets are encrypted at rest by Vercel's infrastructure using AES-256.</li>
            <li><strong>Secret Management</strong> — API keys, admin secrets, and OAuth credentials are stored exclusively as encrypted environment variables. They are never committed to source control, logged, or exposed in API responses.</li>
            <li><strong>No Third-Party Data Sharing</strong> — Comment data is never transmitted to third-party analytics, advertising, AI training, or any other external service. The only outbound API calls are to TikTok's authorized API endpoints on behalf of each Operator.</li>
          </ul>
        </div>

        <div className="section" id="access-control">
          <h2>15. Access Control Policy</h2>
          <p>Access to the Platform is governed by a strict need-to-know, least-privilege model:</p>
          <ul>
            <li><strong>Operator isolation</strong> — Each Operator accesses only their own TikTok Business Account data. No Operator can access another Operator's data or credentials.</li>
            <li><strong>Authentication</strong> — Each Operator's dashboard is protected by a unique secret key stored as an encrypted environment variable. It must be rotated if compromise is suspected.</li>
            <li><strong>No shared credentials</strong> — Shared credentials between Operators or between Operator personnel are not permitted.</li>
            <li><strong>API access</strong> — TikTok API tokens are scoped to the minimum required permissions and stored only in server-side cookies inaccessible to client-side code.</li>
            <li><strong>Platform infrastructure access</strong> — Access to Platform source code and hosting infrastructure is limited to authorized Platform Provider personnel with MFA enforced.</li>
            <li><strong>Access review</strong> — Access rights are reviewed at least annually and immediately upon any personnel or organizational change.</li>
          </ul>
        </div>

        <div className="section" id="vulnerability">
          <h2>16. Vulnerability Management</h2>
          <p>The Platform Provider maintains the following vulnerability management practices:</p>
          <ul>
            <li><strong>Dependency management</strong> — All software dependencies are regularly audited. Critical and high vulnerabilities are remediated within 7 days of discovery.</li>
            <li><strong>Infrastructure scanning</strong> — Vercel provides automated infrastructure-level vulnerability detection and patching as part of its platform.</li>
            <li><strong>Code review</strong> — All code changes are reviewed before deployment. Security implications are evaluated for each change.</li>
            <li><strong>Penetration testing</strong> — External penetration testing is conducted at least annually or following any significant system change.</li>
            <li><strong>Vulnerability disclosure</strong> — Security vulnerabilities may be reported to <strong>support@tjbmanagementinc.com</strong>. We commit to acknowledging reports within 48 hours and remediating critical issues within 7 days.</li>
            <li><strong>Scan retention</strong> — Vulnerability scan reports and penetration test results are retained for a minimum of 12 months.</li>
          </ul>
        </div>

        <div className="section" id="incident">
          <h2>17. Incident Management</h2>
          <p>The Platform Provider maintains an incident response policy. In the event of a security incident or data breach involving Operator or End User data:</p>
          <h3>Detection & Containment</h3>
          <ul>
            <li>Suspicious activity is monitored through Platform runtime logs and error tracking</li>
            <li>Upon discovery of a potential incident, all affected tokens and credentials are immediately revoked and rotated</li>
            <li>The affected system or account is isolated as quickly as possible to prevent further exposure</li>
          </ul>
          <h3>Assessment & Notification</h3>
          <ul>
            <li>The scope and nature of the incident is assessed within 24 hours of discovery</li>
            <li>Affected Operators are notified within 48 hours of discovery</li>
            <li>TikTok is notified of any incident affecting TikTok user data within 72 hours in accordance with applicable regulatory requirements</li>
            <li>Affected End Users and regulatory authorities are notified as required by applicable law (GDPR, CPRA)</li>
          </ul>
          <h3>Recovery & Review</h3>
          <ul>
            <li>All access credentials involved in the incident are permanently rotated</li>
            <li>A post-incident review is conducted within 7 days to identify root cause and implement preventative measures</li>
            <li>Incident reports are documented and retained for a minimum of 12 months</li>
            <li>Incident response procedures are tested at least annually through a tabletop exercise</li>
          </ul>
          <p>To report a security incident or suspected breach, contact <strong>support@tjbmanagementinc.com</strong> immediately.</p>
        </div>

        <div className="section" id="subprocessors">
          <h2>18. Subprocessors & Infrastructure</h2>
          <p>The Platform relies on the following third-party subprocessors. All subprocessors are subject to appropriate data protection agreements:</p>
          <ul>
            <li><strong>Vercel Inc.</strong> — Hosting and serverless compute infrastructure. SOC 2 Type II certified. Headquartered in San Francisco, CA, USA. Data processed in the United States. <a href="https://vercel.com/legal/privacy-policy" style={{ color: '#a855f7' }}>Privacy Policy</a></li>
            <li><strong>GitHub Inc. (Microsoft)</strong> — Private source code repository. SOC 2 Type II certified. No production data is stored in version control. <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" style={{ color: '#a855f7' }}>Privacy Policy</a></li>
            <li><strong>TikTok for Business</strong> — Data source and action endpoint. All data originates from TikTok's API and moderation actions are returned to TikTok via authorized API calls. No TikTok user data is shared with any other subprocessor.</li>
          </ul>
          <p>The Platform Provider does not use any other subprocessors that process Operator or End User data. This list is reviewed and updated whenever a new subprocessor is engaged. Operators will be notified of material changes to subprocessors.</p>
          <p>
            <strong>Platform Provider Headquarters:</strong> United States<br />
            <strong>Primary Workforce Location:</strong> United States<br />
            <strong>System Location:</strong> United States (Vercel US regions)<br />
            <strong>Foreign Ownership:</strong> None — Platform Provider is 100% US-owned and operated
          </p>
        </div>

        <div className="section" id="usds">
          <h2>19. US Data Security Compliance</h2>
          <p>
            The Hallie Platform is developed and operated in compliance with TikTok's US Data Security (USDS) requirements. The following attestations map TJB Management Inc.'s specific practices to each USDS requirement area.
          </p>

          <h3>Ownership & Corporate Structure</h3>
          <ul>
            <li>TJB Management Inc. is headquartered in the United States and organized under US law</li>
            <li>100% owned by US citizens and residents — no direct or indirect ownership interest is held by any individual or entity from a US-restricted jurisdiction</li>
            <li>No board members, officers, or controlling parties are affiliated with any US-restricted jurisdiction</li>
            <li>The Platform has no operational, contractual, or financial ties to any US-restricted jurisdiction</li>
          </ul>

          <h3>Data Handling & Privacy</h3>
          <ul>
            <li>All data collected via the TikTok Business API is used solely to perform authorized automation actions on behalf of each Operator — no secondary use, profiling, or sale of data occurs (see Sections 3–4)</li>
            <li>Data is processed transiently in memory and is not written to a persistent database. No TikTok user data is retained beyond the active server session (see Section 6)</li>
            <li>Only the minimum API scopes necessary to perform authorized functions are requested — no excess permissions are sought or held (see Section 7)</li>
            <li>All data is processed and stored within the United States. No data is transferred to or accessible from any US-restricted jurisdiction</li>
            <li>End User data subject rights (access, deletion, correction, portability) are supported and can be exercised by contacting support@tjbmanagementinc.com (see Section 5)</li>
          </ul>

          <h3>Security Controls</h3>
          <ul>
            <li>All data in transit is encrypted with TLS 1.2 or above. All secrets are encrypted at rest using AES-256 via Vercel's infrastructure (see Section 14)</li>
            <li>Multi-factor authentication (MFA) is enforced on all accounts with access to Platform infrastructure (see Section 13)</li>
            <li>Access to the Platform is governed by least-privilege and need-to-know principles. Each Operator is isolated from all others (see Section 15)</li>
            <li>External penetration testing is conducted at least annually. Critical vulnerabilities are remediated within 7 days of discovery (see Section 16)</li>
            <li>A documented incident response process is in place. Affected parties are notified within 48 hours of any confirmed incident (see Section 17)</li>
            <li>The Platform is hosted on Vercel Inc., a SOC 2 Type II certified provider operating US infrastructure (see Section 18)</li>
          </ul>

          <h3>Subprocessors</h3>
          <ul>
            <li>Vercel Inc. — US-headquartered, SOC 2 Type II certified, US infrastructure only</li>
            <li>GitHub Inc. (Microsoft) — US-headquartered, SOC 2 Type II certified, no production data stored</li>
            <li>No subprocessors have material ownership or operational ties to any US-restricted jurisdiction</li>
          </ul>

          <p>
            Supporting documentation including vulnerability scan reports and penetration testing results is available upon request at <strong>support@tjbmanagementinc.com</strong>.
          </p>
        </div>

        <div className="section" id="contact">
          <h2>20. Contact & Requests</h2>
          <p>For any questions, data subject requests, privacy inquiries, security reports, or compliance documentation requests related to the Hallie Platform, please contact:</p>
          <ul>
            <li><strong>All privacy, security & compliance inquiries:</strong> support@tjbmanagementinc.com</li>
          </ul>
          <p>
            <strong>TJB Management Inc.</strong><br />
            Platform Provider · United States
          </p>
          <p>We will respond to all privacy and security inquiries within 30 days. Critical security incidents will receive an acknowledgment within 48 hours.</p>
        </div>

        <footer>
          <p>Last Updated: July 1, 2026</p>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>This document constitutes the official Data Security and Privacy Policy for the Hallie TikTok Account Automation Platform as required by TikTok's Data Security and Privacy Review (DSPR) and US Data Security (USDS) review processes.</p>
          <p>TikTok and the TikTok logo are trademarks of TikTok US Data Security Joint Venture LLC. The Hallie Platform is an independent product developed by TJB Management Inc. and is not affiliated with, endorsed by, or sponsored by TikTok.</p>
        </footer>
      </main>
    </>
  );
}
