'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function CommunicationPolicy() {
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
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/system/status" onClick={() => setMenuOpen(false)}>System Status</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/legal/policies/and/procedures" className="back-link">← Back to Policies & Procedures</a>

        <h1>Communication Policy</h1>
        <p className="subtitle">
          TJB Management Inc. · Professional Conduct in Business Communication<br />
          Last Updated: October 13, 2026
        </p>

        <div className="toc">
          <p>Table of Contents</p>

          <p className="toc-part">General Legal Terms</p>
          <ol>
            <li><a href="#general-acceptance">Acceptance of Terms</a></li>
            <li><a href="#general-use-of-site">Use of This Website</a></li>
            <li><a href="#general-geo">Geographic Restrictions & Automated Access Controls</a></li>
            <li><a href="#general-no-advice">No Professional Advice</a></li>
            <li><a href="#general-ip">Intellectual Property</a></li>
            <li><a href="#general-third-party">Third-Party Links & Services</a></li>
            <li><a href="#general-conduct">User Conduct</a></li>
            <li><a href="#general-warranties">Disclaimer of Warranties</a></li>
            <li><a href="#general-liability">Limitation of Liability</a></li>
            <li><a href="#general-indemnification">Indemnification</a></li>
            <li><a href="#general-changes">Changes to These Terms</a></li>
            <li><a href="#general-governing-law">Governing Law</a></li>
            <li><a href="#general-contact">Contact Information</a></li>
          </ol>

          <p className="toc-part">Communication Policy</p>
          <ol>
            <li><a href="#comm-purpose">Purpose</a></li>
            <li><a href="#comm-scope">Scope</a></li>
            <li><a href="#comm-standards">Professional Conduct Standards</a></li>
            <li><a href="#comm-prohibited">Prohibited Conduct</a></li>
            <li><a href="#comm-channels">Official Communication Channels</a></li>
            <li><a href="#comm-response-times">Response Times</a></li>
            <li><a href="#comm-confidentiality">Confidentiality</a></li>
            <li><a href="#comm-enforcement">Reporting & Enforcement</a></li>
            <li><a href="#comm-contact">Contact</a></li>
          </ol>
        </div>

        <h2 className="part-heading">General Legal Terms</h2>

        <div className="section" id="general-acceptance">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using tjbmanagementinc.com (the "Website"), you agree to be bound by these General Legal Terms. If you do not agree to these terms, please do not use the Website.
          </p>
          <p>
            These general terms apply to all visitors to the Website. The Communication Policy below applies in addition to, and where it conflicts, takes precedence over, these general terms.
          </p>
        </div>

        <div className="section" id="general-use-of-site">
          <h2>2. Use of This Website</h2>
          <p>
            This Website is provided to describe TJB Management Inc.'s services, including talent management, the Hallie automation platform, and related resources. You agree to use the Website only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use and enjoyment of the Website by, any other person.
          </p>
        </div>

        <div className="section" id="general-geo">
          <h2>3. Geographic Restrictions & Automated Access Controls</h2>
          <p>
            This Website is available only to visitors located in the United States and Canada, as a permanent, site-wide policy. This restriction is enforced automatically: connections from outside the United States and Canada are blocked, and connections TJB Management Inc. detects as coming from a VPN, proxy, Tor exit node, or commercial datacenter/hosting IP — rather than a visitor's own residential or mobile connection — are automatically blocked as well, since those connections can be used to mask a visitor's true location.
          </p>
          <p>
            Apple's iCloud Private Relay is not treated as a VPN for purposes of this policy and is not blocked solely for being Private Relay traffic.
          </p>
          <p>
            These automated controls are a technical measure used to enforce the geographic restriction in this section. They do not expand or limit any other right or obligation described elsewhere in these terms.
          </p>
        </div>

        <div className="section" id="general-no-advice">
          <h2>4. No Professional Advice</h2>
          <p>
            Unless stated otherwise, Nothing on this Website constitutes legal, financial, tax, or other professional advice.
          </p>
          <p>
            Unless stated otherwise to you, Information is provided for general purposes only and should not be relied upon as a substitute for professional consultation.
          </p>
          <p>
            Any specific representation, service, or engagement with TJB Management Inc. is governed exclusively by our policies and procedures, located at (<a href="/legal/policies/and/procedures"><span className="rainbow">https://tjbmanagementinc.com/legal/policies/and/procedures</span></a>)
          </p>
        </div>

        <div className="section" id="general-ip">
          <h2>5. Intellectual Property</h2>
          <p>
            The TJB Management Inc. name, logo, branding, website design, and all content published on this Website are the property of TJB Management Inc. and Tyler J. Beasley, unless otherwise noted. No part of this Website may be reproduced, copied, distributed, or used in any form without prior written consent. Unauthorized use will be pursued to the fullest extent permitted by law.
          </p>
        </div>

        <div className="section" id="general-third-party">
          <h2>6. Third-Party Links & Services</h2>
          <p>
            This Website may link to third-party websites and services, including TikTok, for reference and convenience. TJB Management Inc. does not control and is not responsible for the content, policies, or practices of any third-party site. Inclusion of a link does not imply endorsement.
          </p>
        </div>

        <div className="section" id="general-conduct">
          <h2>7. User Conduct</h2>
          <p>
            You agree not to use this Website to transmit any content that is unlawful, harmful, fraudulent, or infringing, or to attempt to gain unauthorized access to any portion of the Website or its underlying systems.
          </p>
        </div>

        <div className="section" id="general-warranties">
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            This Website and its content are provided "as is" and "as available," without warranties of any kind, express or implied, including but not limited to accuracy, completeness, or fitness for a particular purpose. TJB Management Inc. does not guarantee uninterrupted or error-free operation of the Website.
          </p>
        </div>

        <div className="section" id="general-liability">
          <h2>9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, TJB Management Inc. is not liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of this Website.
          </p>
          <p>
            This general limitation is in addition to, and does not replace, any liability terms set out in the Communication Policy below.
          </p>
        </div>

        <div className="section" id="general-indemnification">
          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless TJB Management Inc., Tyler J. Beasley, and their officers, employees, and affiliates from any claims, damages, or expenses arising out of your use of this Website or your violation of these terms.
          </p>
        </div>

        <div className="section" id="general-changes">
          <h2>11. Changes to These Terms</h2>
          <p>
            TJB Management Inc. may update these General Legal Terms at any time without prior notice. Continued use of the Website following any changes constitutes acceptance of the revised terms.
          </p>
        </div>

        <div className="section" id="general-governing-law">
          <h2>12. Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of Florida, without regard to conflict-of-law principles. Any dispute arising under these general terms shall be resolved in the applicable courts of the State of Florida.
          </p>
        </div>

        <div className="section" id="general-contact">
          <h2>13. Contact Information</h2>
          <p>
            Questions about these General Legal Terms can be directed to <span className="rainbow">support@tjbmanagementinc.com</span>.
          </p>
        </div>

        <h2 className="part-heading">Communication Policy</h2>

        <div className="section" id="comm-purpose">
          <h2>1. Purpose</h2>
          <p>
            This policy sets the standard for how TJB Management Inc. — including Tyler, any staff, and anyone
            communicating on the company&apos;s behalf — interacts with creators, partners, vendors, and the public.
            The goal is simple: every interaction should be professional, respectful, and focused on the business
            at hand.
          </p>
        </div>

        <div className="section" id="comm-scope">
          <h2>2. Scope</h2>
          <p>
            This policy applies to all communication conducted on behalf of TJB Management Inc., across every
            channel — email, phone and text, direct messages, video calls, social media, and in person. It applies
            to communication with creators represented by the agency, prospective creators, partners, vendors, and
            the general public.
          </p>
        </div>

        <div className="section" id="comm-standards">
          <h2>3. Professional Conduct Standards</h2>
          <p>All communication on behalf of TJB Management Inc. must be:</p>
          <ul>
            <li><strong>Professional</strong> — communication stays focused on business, not personal matters</li>
            <li><strong>Respectful</strong> — courteous and considerate, regardless of how a conversation is going</li>
            <li><strong>Honest</strong> — accurate and not misleading about the business, its services, or its terms</li>
            <li><strong>Timely</strong> — responded to within a reasonable timeframe</li>
          </ul>
          <p>
            <strong>Flirting, romantic advances, or sexual comments of any kind are not permitted in any business
            communication</strong> — this applies regardless of who initiates it, and regardless of the relationship
            between the parties. Business communication stays business communication.
          </p>
        </div>

        <div className="section" id="comm-prohibited">
          <h2>4. Prohibited Conduct</h2>
          <p>The following are not permitted in any communication conducted on behalf of TJB Management Inc.:</p>
          <ul>
            <li>Harassment, threats, or intimidation of any kind</li>
            <li>Discriminatory language or conduct based on race, gender, religion, national origin, disability, sexual orientation, or any other protected class</li>
            <li>Profanity or abusive language directed at another person</li>
            <li>Sharing confidential business or creator information without authorization</li>
            <li>Misrepresenting the company, its terms, or its services</li>
          </ul>
        </div>

        <div className="section" id="comm-channels">
          <h2>5. Official Communication Channels</h2>
          <p>
            Business communication should take place through the official channels listed on the{' '}
            <a href="/tyler/contact/tyler"><span className="rainbow">Connect with Tyler</span></a> page, or through
            whatever channel a creator and their manager have agreed to use for ongoing contact. Business shouldn&apos;t
            be conducted through channels that bypass this policy or make it harder to document what was actually
            said.
          </p>
        </div>

        <div className="section" id="comm-response-times">
          <h2>6. Response Times</h2>
          <p>
            We aim to respond to business communication within a reasonable timeframe during normal business hours.
            Response times may be longer outside of business hours, on weekends, or during periods of high volume —
            see <a href="/system/status"><span className="rainbow">System Status</span></a> for any known, ongoing
            service disruptions.
          </p>
        </div>

        <div className="section" id="comm-confidentiality">
          <h2>7. Confidentiality</h2>
          <p>
            Information shared in the course of business — creator performance data, account details, contract
            terms, or anything else not otherwise public — is confidential and should not be shared outside of
            what&apos;s necessary to conduct that business.
          </p>
        </div>

        <div className="section" id="comm-enforcement">
          <h2>8. Reporting & Enforcement</h2>
          <p>
            Anyone who experiences or witnesses conduct that violates this policy in communication with TJB
            Management Inc. should report it using the contact information below. Reports are taken seriously, and
            this policy is enforced equally against anyone communicating on the company&apos;s behalf — Tyler,
            staff, and any other representative — the same as it is against a signed creator.
          </p>
          <p>
            A violation may result in whatever action is appropriate to the relationship involved — for a signed
            creator, that includes termination of their representation agreement, consistent with{' '}
            <a href="/legal/policies/and/procedures/tiktok/agency#agency-leaving">
              <span className="rainbow">Section 7 (Leaving the Agency & Termination)</span>
            </a>{' '}
            of our TikTok Agency Policies & Procedures; for anyone communicating on the company&apos;s behalf,
            including Tyler, that includes removal from any role or responsibility that involves communicating on
            TJB Management Inc.&apos;s behalf. No one is exempt from this policy because of their position.
          </p>
        </div>

        <div className="section" id="comm-contact">
          <h2>9. Contact</h2>
          <p>
            Questions about this policy, or reports of conduct that violates it, can be sent to{' '}
            <strong>support@tjbmanagementinc.com</strong>.
          </p>
        </div>

        <footer>
          <p>Last Updated: October 13, 2026</p>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </footer>
      </main>
    </>
  );
}
