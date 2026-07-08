'use client';

import './page.css';

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

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/agency" onClick={() => setMenuOpen(false)}>TJB Management Agency</a>
        <a href="/contact-agency" onClick={() => setMenuOpen(false)}>Connect with Agency</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/contact-tyler" onClick={() => setMenuOpen(false)}>Connect with Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie</a>
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Connect with Hallie</a>
        <a href="/hallie/tiktok-moderation/system" onClick={() => setMenuOpen(false)}>Hallie TikTok Moderation System</a>
        <a href="/merch" onClick={() => setMenuOpen(false)}>Merch</a>
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/tiktok-guidelines" onClick={() => setMenuOpen(false)}>TikTok Guidelines</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
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
            The Platform connects to TikTok's API on behalf of authorized TikTok accounts to automate account operations including content publishing, comment management, community moderation, mention monitoring, trending discovery, and automated rule execution. It is designed to help brands, creators, and businesses run their TikTok presence with as little manual intervention as possible.
          </p>
          <p>
            This Policy governs the Platform's data handling practices and applies to all businesses and individuals ("Operators") who use the Platform to manage their TikTok accounts. By using the Platform, Operators agree to this Policy and accept responsibility for ensuring their own use complies with applicable laws and TikTok's terms.
          </p>
          <p>
            The Platform operates under TikTok's API for Business Developer Terms and is subject to TikTok's Data Security and Privacy Review (DSPR) as a condition of accessing the full scope of TikTok Business API permissions.
          </p>
        </div>

        <div className="section" id="definitions">
          <h2>2. Definitions</h2>
          <ul>
            <li><strong>Platform Provider</strong> — TJB Management Inc., the company that develops, operates, and maintains the Hallie Platform.</li>
            <li><strong>Operator</strong> — Any business, brand, creator, or individual who uses the Hallie Platform to manage their TikTok account(s).</li>
            <li><strong>End User</strong> — TikTok users who post comments on an Operator's TikTok content. End Users do not interact with the Platform directly.</li>
            <li><strong>Platform</strong> — The Hallie Account Automation Platform, including all associated software, APIs, and infrastructure.</li>
            <li><strong>Connected Account</strong> — An Operator's authorized TikTok account connected to the Platform via TikTok's API.</li>
          </ul>
        </div>

        <div className="section" id="data-collected">
          <h2>3. Data Collected</h2>
          <p>The Platform accesses and processes the following data via TikTok's API on behalf of each Operator:</p>
          <h3>Comment & Community Data</h3>
          <ul>
            <li><span className="rainbow">Comment text</span> — the content of comments posted to an Operator's TikTok videos</li>
            <li><span className="rainbow">Comment ID</span> — TikTok's internal identifier for each comment</li>
            <li><span className="rainbow">Username</span> — the TikTok username of the commenter</li>
            <li><span className="rainbow">Timestamp</span> — the date and time the comment was posted</li>
            <li><span className="rainbow">Like count</span> — the number of likes a comment has received</li>
            <li><span className="rainbow">Comment status</span> — whether a comment is visible or hidden</li>
          </ul>
          <h3>Content Data</h3>
          <ul>
            <li><span className="rainbow">Video ID, title, and creation date</span> — displayed in each Operator's dashboard to identify their content</li>
            <li><span className="rainbow">View, like, comment, and share counts</span> — displayed for performance visibility</li>
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
          <h3>Direct Message Data (Business Messaging API — Pending DSPR Approval)</h3>
          <ul>
            <li><span className="rainbow">Message content</span> — text of direct messages sent to or received from TikTok users on behalf of an Operator</li>
            <li><span className="rainbow">Sender and recipient identifiers</span> — TikTok user IDs and usernames involved in each message thread</li>
            <li><span className="rainbow">Message timestamps</span> — date and time each message was sent or received</li>
            <li><span className="rainbow">Message and delivery status</span> — read, unread, and delivery state of each message</li>
            <li><span className="rainbow">Conversation thread IDs</span> — TikTok's internal identifiers for message threads</li>
          </ul>
          <p>Direct message data will only be accessed upon approval of the TikTok Business Messaging API scope following completion of TikTok's Data Security and Privacy Review (DSPR). DM data is processed solely to enable automated responses and message management on behalf of authorized Operators. DM data is subject to the same — or higher — data handling and security requirements as all other data listed above. Until DSPR approval is granted, the Platform does not collect or access direct messages.</p>
          <p>The Platform does not collect or process payment information, private account data, advertising campaign data, or any data beyond what is explicitly listed above.</p>
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
          <p>Comment text, usernames, and other content data fetched from TikTok's API are processed in memory for the duration of the request and are not written to any persistent database operated by the Platform Provider. OAuth access tokens are stored as HttpOnly, Secure browser cookies on the Operator's own device with a 30-day expiration — the Platform Provider does not retain tokens server-side. Operators can immediately revoke all session data at any time by clicking "Disconnect" within the Platform dashboard. See Section 6 for the full data retention policy.</p>
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
          <p><strong>In-platform deletion:</strong> Operators can immediately delete all session data — including their OAuth token — by clicking the "Disconnect" button within the Platform dashboard. This takes effect instantly and requires no email request.</p>
          <p>To exercise any other rights, or to submit a request on behalf of End Users, contact the Platform Provider at <strong>support@tjbmanagementinc.com</strong>. We will respond within 30 days. Identity verification may be required before fulfilling a request.</p>
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
          <p>When an Operator clicks "Disconnect" within the Platform dashboard, their OAuth token cookie is immediately expired — no further API access is possible and no session data remains. In-memory data (event logs, seen IDs) associated with that session is also cleared. Operators may alternatively revoke authorization directly in TikTok's app under <em>Settings → Apps and Websites</em>.</p>
          <p>End Users who wish to request deletion of any data held about them may contact <strong>support@tjbmanagementinc.com</strong>. We will respond within 30 days.</p>
        </div>

        <div className="section" id="data-minimization">
          <h2>7. Data Minimization</h2>
          <p>
            The Platform requests only the minimum API scopes necessary to perform authorized account automation functions. Specifically:
          </p>
          <ul>
            <li>The Platform requests <strong>comment.list</strong> and <strong>comment.list.manage</strong> scopes to read and manage comments on behalf of Operators</li>
            <li>The Platform requests <strong>video.list</strong> to display an Operator's videos in their dashboard</li>
            <li>The Platform requests <strong>discovery.search.words</strong> to surface trending content</li>
            <li>The Platform requests <strong>user.info.basic</strong>, <strong>user.info.username</strong>, <strong>user.info.stats</strong>, <strong>user.info.profile</strong>, and <strong>user.account.type</strong> to display the connected account's identity and stats in each Operator's dashboard</li>
          </ul>
          <p>Upon approval of the Business Messaging API scope, the Platform will additionally request only the minimum DM-related permissions required to read incoming messages and send automated responses — no other messaging scopes will be requested. No scopes beyond those necessary for each authorized function are requested at any stage. API fields are limited to those actively used by the Platform — no unused fields are fetched.</p>
        </div>

        <div className="section" id="roles">
          <h2>8. Roles & Responsibilities</h2>
          <p>The following role structure governs data responsibilities under this Policy:</p>
          <ul>
            <li><strong>Platform Provider (TJB Management Inc.)</strong> — Acts as a data processor on behalf of Operators. Responsible for the security and integrity of the Platform infrastructure, and for processing data only as directed by Operators and as permitted under this Policy.</li>
            <li><strong>Operator</strong> — Acts as the data controller for their connected TikTok account and the End Users who interact with their content. Operators are responsible for their own privacy notices, lawful basis for processing, and compliance with applicable local laws.</li>
            <li><strong>Data Protection Officer (Platform Provider)</strong> — <strong>Tyler J. Beasley</strong>, sole authorized officer of TJB Management Inc., serves as the Platform Provider's designated Data Protection Officer and Privacy & Security Contact. All privacy inquiries, data subject requests, security incidents, and compliance documentation requests should be directed to <strong>support@tjbmanagementinc.com</strong>.</li>
          </ul>
          <p>Operators must designate a Data Protection Officer (DPO) or equivalent privacy contact within their own organization where required by applicable law (e.g., GDPR Article 37).</p>
        </div>

        <div className="section" id="operator-obligations">
          <h2>9. Operator Obligations</h2>
          <p>By using the Hallie Platform, Operators agree to the following obligations:</p>
          <ul>
            <li><strong>Lawful basis</strong> — Operators must have a valid lawful basis under applicable privacy law for processing End User data through the Platform.</li>
            <li><strong>Privacy notice</strong> — Operators must maintain a publicly accessible privacy notice that discloses their use of automated account management tools and the processing of End User data.</li>
            <li><strong>Credential security</strong> — Operators are responsible for securing their TikTok account credentials. The Platform does not issue separate credentials — Operators authenticate directly with TikTok via Login Kit.</li>
            <li><strong>Authorized use only</strong> — Operators may only use the Platform to manage their own TikTok account(s) that they are authorized to manage.</li>
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
          <p>All Platform administration is performed exclusively on Apple iOS devices (iPhone and iPad). The following protections are enforced by the iOS platform:</p>
          <ul>
            <li><strong>Biometric Authentication</strong> — All administrator devices require Face ID or Touch ID authentication. Biometric access cannot be bypassed without the device passcode</li>
            <li><strong>Hardware Encryption</strong> — iOS enforces full hardware-level disk encryption on all devices with Face ID or Touch ID enabled. Data is inaccessible without successful biometric or passcode authentication</li>
            <li><strong>Automatic Screen Lock</strong> — iOS auto-lock is active on all administrator devices, requiring re-authentication after a short period of inactivity</li>
            <li><strong>OS and App Updates</strong> — iOS and all applications are kept up to date. Security patches are applied promptly upon release</li>
            <li><strong>App Sandboxing</strong> — iOS enforces strict app sandboxing. No application can access data belonging to another application, providing inherent protection against malware and unauthorized data access</li>
          </ul>
          <p>Operators are expected to maintain appropriate endpoint protections on any device used to access their Hallie Platform dashboard.</p>
          <p>Software development and infrastructure changes are carried out with the assistance of an AI coding tool operating in an isolated, ephemeral cloud execution environment. This environment holds no independent or standing access to any Operator's TikTok account, does not persist credentials or Operator data beyond a single development session, and every action it takes is directed and authorized in real time by the Platform Provider's sole authorized officer from their Apple iOS device.</p>
        </div>

        <div className="section" id="security-baselines">
          <h2>13. Security Baselines</h2>
          <p>The following baseline security measures are enforced for all access to the Platform and associated infrastructure:</p>
          <ul>
            <li><strong>Multi-Factor Authentication (MFA)</strong> — All Platform infrastructure accounts (Vercel and GitHub) require a password plus a second factor. The Platform Provider's sole authorized officer uses the Oracle Authenticator app to generate time-based one-time passcodes (TOTP), and passkeys bound exclusively to personal Apple iOS devices (protected by Face ID or Touch ID and the device's hardware Secure Enclave) where a service supports passkey sign-in. No single credential is sufficient to gain access</li>
            <li><strong>Firewall</strong> — Vercel's web application firewall is active across all Platform endpoints. Traffic is continuously monitored and filtered, with non-compliant requests denied or challenged in real time</li>
            <li><strong>DDoS Mitigation</strong> — Vercel's infrastructure provides automatic DDoS protection at the network and application layers. No additional configuration is required — protection is active by default on all deployments</li>
            <li><strong>Bot Protection</strong> — Bot Protection is enabled and actively challenging requests from non-browser sources, excluding verified bots. Known AI scrapers and crawlers are blocked</li>
            <li><strong>Operator Authentication</strong> — Operators access the Platform exclusively through TikTok Login Kit (OAuth). Each Operator authenticates with their own TikTok credentials — no shared keys or passwords are issued. The Platform Provider does not create, hold, or manage Operator credentials of any kind</li>
            <li><strong>Administrative Access</strong> — A single administrative key, held exclusively by the Platform Provider's sole authorized officer, is used only to access operational debug logs. This key does not grant access to any Operator's TikTok account data</li>
            <li><strong>Session Management</strong> — Operator sessions use HttpOnly, Secure, SameSite cookies. OAuth tokens expire after 30 days and require re-authentication</li>
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
            <li><strong>Operator isolation</strong> — Data isolation is architecturally enforced, not just policy. Each Operator authenticates via TikTok Login Kit, which issues an OAuth token scoped exclusively to their own TikTok account. It is technically impossible for one Operator to access another Operator's data.</li>
            <li><strong>Platform Provider data access</strong> — The Platform Provider cannot access any Operator's TikTok account data. OAuth tokens are scoped per-Operator by TikTok's API and are stored in the Operator's own session cookies. The Platform Provider's administrative key grants access only to operational debug logs — not to any account data.</li>
            <li><strong>No credential management</strong> — The Platform does not issue, store, or manage Operator passwords or access keys. Operators authenticate directly with TikTok via Login Kit.</li>
            <li><strong>API access</strong> — TikTok OAuth tokens are scoped to the minimum required permissions and stored only in server-side HttpOnly cookies inaccessible to client-side code.</li>
            <li><strong>Platform infrastructure access</strong> — Access to Platform source code and hosting infrastructure is limited to the Platform Provider's sole authorized officer, with Oracle MFA enforced.</li>
          </ul>
        </div>

        <div className="section" id="vulnerability">
          <h2>16. Vulnerability Management</h2>
          <p>The Platform Provider maintains the following vulnerability management practices:</p>
          <ul>
            <li><strong>Dependency management</strong> — GitHub Dependabot continuously monitors all software dependencies and opens an alert or pull request when a vulnerability is found. Critical and high vulnerabilities are prioritized for prompt remediation.</li>
            <li><strong>Infrastructure scanning</strong> — Vercel provides automated infrastructure-level vulnerability detection and patching as part of its platform.</li>
            <li><strong>Development and review process</strong> — Code and infrastructure changes are made collaboratively by the Platform Provider's sole authorized officer and an AI coding assistant. Every change is authorized by the Platform Provider before it is committed. When Dependabot identifies a vulnerability, the Platform Provider and the AI assistant jointly evaluate and remediate it before the fix is published to the main repository.</li>
            <li><strong>Security testing</strong> — The Platform undergoes AI-assisted security testing against non-production test environments as part of ongoing development. The Platform Provider has not yet engaged an independent third-party penetration testing firm and plans to do so as the Platform's data access needs grow.</li>
            <li><strong>Vulnerability disclosure</strong> — Security vulnerabilities may be reported to <strong>support@tjbmanagementinc.com</strong>. We commit to acknowledging reports within 48 hours and remediating critical issues within 7 days.</li>
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
            <li><strong>Vercel Inc.</strong> — Hosting and serverless compute infrastructure. SOC 2 Type II certified. Headquartered in San Francisco, CA, USA. Data processed in the United States. <a href="https://vercel.com/legal/privacy-policy" className="link-purple">Privacy Policy</a></li>
            <li><strong>GitHub Inc. (Microsoft)</strong> — Private source code repository. SOC 2 Type II certified. No production data is stored in version control. <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" className="link-purple">Privacy Policy</a></li>
            <li><strong>TikTok for Business</strong> — Data source and action endpoint. All data originates from TikTok's API and moderation actions are returned to TikTok via authorized API calls. No TikTok user data is shared with any other subprocessor.</li>
          </ul>
          <p>The Platform Provider does not use any other subprocessors that process Operator or End User data. This list is reviewed and updated whenever a new subprocessor is engaged. Operators will be notified of material changes to subprocessors.</p>
          <p>
            <strong>Platform Provider Headquarters:</strong> United States<br />
            <strong>Primary Workforce Location:</strong> United States<br />
            <strong>System Location:</strong> United States (Vercel US regions)<br />
            <strong>Ownership:</strong> Sole owner Tyler J. Beasley — US citizen and resident, sole shareholder and sole authorized officer of TJB Management Inc.
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
            <li>Solely owned by Tyler J. Beasley, a US citizen and resident. Tyler J. Beasley is the sole shareholder, sole authorized officer, and sole owner of TJB Management Inc. There are no other ownership interests of any kind</li>
            <li>No other officers, board members, or controlling parties exist — the company has a single authorized officer and a single issued share</li>
            <li>The Platform has no operational, contractual, or financial ties to any US-restricted jurisdiction</li>
          </ul>

          <h3>Data Handling & Privacy</h3>
          <ul>
            <li>All data collected via TikTok's API is used solely to perform authorized automation actions on behalf of each Operator — no secondary use, profiling, or sale of data occurs (see Sections 3–4)</li>
            <li>Content data (comments, video metadata) fetched via TikTok's API is processed in-request memory and is not written to any persistent database operated by the Platform Provider. OAuth tokens are stored exclusively as HttpOnly browser cookies on the Operator's own device — not retained server-side. Operators can immediately delete all session data via the in-platform Disconnect button (see Section 6)</li>
            <li>Only the minimum API scopes necessary to perform authorized functions are requested — no excess permissions are sought or held (see Section 7)</li>
            <li>All data is processed and stored within the United States. No data is transferred to or accessible from any US-restricted jurisdiction</li>
            <li>End User data subject rights (access, deletion, correction, portability) are supported and can be exercised by contacting support@tjbmanagementinc.com (see Section 5)</li>
          </ul>

          <h3>Security Controls</h3>
          <ul>
            <li>All data in transit is encrypted with TLS 1.2 or above. All secrets are encrypted at rest using AES-256 via Vercel's infrastructure (see Section 14)</li>
            <li>All infrastructure accounts (Vercel and GitHub) require a password plus a second factor — Oracle Authenticator TOTP codes or passkeys bound to personal iOS devices, protected by Face ID or Touch ID and hardware Secure Enclave (see Sections 12–13)</li>
            <li>Access to the Platform is governed by least-privilege and need-to-know principles. Each Operator is isolated from all others (see Section 15)</li>
            <li>AI-assisted security testing is performed against non-production environments as part of ongoing development. A third-party penetration testing engagement has not yet been conducted (see Section 16)</li>
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
            Supporting documentation, including dependency vulnerability monitoring history, is available upon request at <strong>support@tjbmanagementinc.com</strong>.
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
