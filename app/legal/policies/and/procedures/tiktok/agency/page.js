'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function TikTokAgencyPoliciesAndProcedures() {
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

        <h1>TikTok Agency Policies & Procedures</h1>
        <p className="subtitle">
          TJB Management Inc. · TikTok LIVE Creator Agency<br />
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

          <p className="toc-part">TikTok Agency Policy</p>
          <ol>
            <li><a href="#agency-about">About TJB Management Inc.</a></li>
            <li><a href="#agency-eligibility">Creator Eligibility Requirements</a></li>
            <li><a href="#agency-trial">LIVE Trial Period</a></li>
            <li><a href="#agency-ban-appeal">Ban Appeal Policy</a></li>
            <li><a href="#agency-non-solicitation">Non-Solicitation and Non-Compete</a></li>
            <li><a href="#agency-manager-visibility">Manager Data Visibility</a></li>
            <li><a href="#agency-leaving">Leaving the Agency & Termination</a></li>
            <li><a href="#agency-ip">Intellectual Property</a></li>
            <li><a href="#agency-liability">Limitation of Liability</a></li>
            <li><a href="#agency-contact-disputes">Contact and Dispute Resolution</a></li>
            <li><a href="#agency-support">Support Availability</a></li>
            <li><a href="#agency-corporate-policy">Corporate Policy: Inquiry Handling</a></li>
          </ol>
        </div>

        <h2 className="part-heading">General Legal Terms</h2>

        <div className="section" id="general-acceptance">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using tjbmanagementinc.com (the "Website"), you agree to be bound by these General Legal Terms. If you do not agree to these terms, please do not use the Website.
          </p>
          <p>
            These general terms apply to all visitors to the Website. The TikTok Agency Policy below applies in addition to, and where it conflicts, takes precedence over, these general terms.
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
            These automated controls are a technical measure used to enforce the geographic restriction in this section and the eligibility requirements described in the TikTok Agency Policy below. They do not expand or limit any other right or obligation described elsewhere in these terms.
          </p>
        </div>

        <div className="section" id="general-no-advice">
          <h2>4. No Professional Advice</h2>
          <p>
            Nothing on this Website constitutes legal, financial, tax, or other professional advice. Information is provided for general purposes only and should not be relied upon as a substitute for professional consultation.
          </p>
          <p>
            Any specific representation, service, or engagement with TJB Management Inc. is governed exclusively by a signed agreement or the TikTok Agency Policy below, not by general statements made elsewhere on this Website.
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
            This general limitation is in addition to, and does not replace, any liability terms set out in the TikTok Agency Policy below.
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

        <h2 className="part-heading">TikTok Agency Policy</h2>

        <div className="section" id="agency-about">
          <h2>1. About TJB Management Inc.</h2>
          <p>
            TJB Management Inc. is a specialized TikTok LIVE creator management agency founded and led by Tyler J. Beasley. We represent TikTok LIVE creators through formal contracts and deliver comprehensive management, strategic guidance, and growth support.
          </p>
          <p>
            <strong>Important:</strong> Nothing on this website constitutes legal advice or a binding offer of representation. All representation begins only upon execution of a signed agreement.
          </p>
        </div>

        <div className="section" id="agency-eligibility">
          <h2>2. Creator Eligibility Requirements</h2>
          <p>To qualify for representation with TJB Management Inc., creators must satisfy all of the following criteria at the time of signing:</p>
          <ul>
            <li><span className="rainbow">Be at least 18 years of age</span></li>
            <li><span className="rainbow">Maintain good standing with TikTok (no active violations or permanent bans on the account intended for agency use)</span></li>
            <li><span className="rainbow">Have averaged no more than 500,000 diamonds per month over the past 6 months on any TikTok account</span></li>
            <li><span className="rainbow">Not be currently signed to, or in active negotiations with, any competing TikTok LIVE agency</span></li>
            <li><span className="rainbow">Not have signed backup or secondary accounts to another TikTok agency within the past 6 months</span></li>
            <li><span className="rainbow">Sign only their primary TikTok account (backup or secondary accounts are not accepted)</span></li>
            <li><span className="rainbow">Not have attempted to recruit or poach creators from any other TikTok agency</span></li>
            <li><span className="rainbow">Be located in the United States or Canada</span></li>
            <li><span className="rainbow">Commit to going LIVE for a minimum of 1 hour, at least 4 days per week</span></li>
          </ul>
          <p>Separately, to be eligible to join TJB Management at all, a creator must meet all of the following:</p>
          <ul>
            <li>You are not currently signed to another TikTok agency on this account or any account</li>
            <li>You have not exceeded 500,000 diamonds in the current calendar month or any of the 5 prior calendar months</li>
            <li>You are located in the United States or Canada</li>
          </ul>
          <p><strong>Creator Tiers</strong></p>
          <p>Perks and services scale with your performance:</p>
          <ul>
            <li><span className="rainbow">💎 Diamond Tier</span> — 1M+ diamonds per month</li>
            <li><span className="rainbow">📈 Growing Creator</span> — 250K – 1M diamonds per month</li>
            <li><span className="rainbow">🌐 Community Tier</span> — 100K+ diamonds per month</li>
          </ul>
          <p className="disclaimer">
            To qualify for creator services, creators are expected to complete a minimum of 10 streamed days per month (at least 1 hour per session), accumulate 15 streamed hours per month, and earn a minimum of 10,000 diamonds per month. Creator perks are determined by tier level.
          </p>
        </div>

        <div className="section" id="agency-trial">
          <h2>3. LIVE Trial Period</h2>
          <p>
            TikTok may require some creators to complete a LIVE trial before unlocking full access to TikTok LIVE features. This typically applies to creators who have not streamed LIVE for at least 10 minutes in the past 60 days.
          </p>
          <p>
            A creator is not considered officially signed with TJB Management Inc. until they successfully complete any required LIVE trial. While we provide full support during this period, we cannot guarantee TikTok's approval or processing timeline.
          </p>
        </div>

        <div className="section" id="agency-ban-appeal">
          <h2>4. Ban Appeal Policy</h2>
          <ol>
            <li>For signed creators, we will review all violation clips in accordance with TikTok's policies and share findings privately with the creator.</li>
            <li>If the ban appears unfair, we will first appeal through TikTok Backstage to the USDS Trust and Safety team.</li>
            <li>If that appeal fails and we still disagree with the ban, we will then ask the designated partner for assistance.</li>
            <li>If the ban is justified, no appeal will be submitted.</li>
          </ol>
          <p>Designated external partners should not reach out about bans unless explicitly requested by TJB Management Inc.</p>
          <p>
            TJB Management Inc. may, at its sole discretion, assist with TikTok ban appeals for creators who are actively in the signing process or onboarding phase. This service is exclusive to prospective and incoming creators and is not available to the general public.
          </p>
          <p>
            We cannot guarantee the success of any appeal, as all final decisions rest solely with TikTok.
          </p>
          <p>
            Separately: if a signed creator's in-app ban appeal gets denied, their TJB Management creator network manager may appeal the ban on their behalf — at their discretion. Not every ban is eligible for escalation, but when it is, we go to bat for the creator.
          </p>
        </div>

        <div className="section" id="agency-non-solicitation">
          <h2>5. Non-Solicitation and Non-Compete</h2>
          <p>Creators who are signed to or actively negotiating with TJB Management Inc. agree to the following:</p>
          <ul>
            <li><span className="rainbow">You will not solicit, recruit, or encourage other TJB Management creators to leave the TikTok agency.</span></li>
            <li><span className="rainbow">You will not sign with or negotiate with any competing TikTok LIVE agency while under contract.</span></li>
            <li><span className="rainbow">You will not sign backup, secondary, or any other TikTok accounts to a competing TikTok agency during your contract term.</span></li>
          </ul>
          <p>Violations of these provisions may result in immediate contract termination and potential legal action.</p>
        </div>

        <div className="section" id="agency-manager-visibility">
          <h2>6. Manager Data Visibility</h2>
          <p>
            When a creator joins TJB Management, their creator network managers are given access to certain account data through TikTok's agency dashboard. This is what allows the agency to support, protect, and advocate for creators effectively. Managers have visibility into:
          </p>
          <ul>
            <li><strong>LIVE replays</strong> — managers can review past streams</li>
            <li><strong>LIVE analytics</strong> — real-time and historical performance data from streams</li>
            <li><strong>Current violations</strong> — any active strikes or policy flags on the account</li>
            <li><strong>Violation clips</strong> — the specific clip flagged for each violation</li>
            <li><strong>Diamond count</strong> — total diamonds earned</li>
            <li><strong>LIVE time</strong> — total hours streamed</li>
            <li><strong>Follower count</strong></li>
            <li><strong>Like count</strong></li>
            <li><strong>Number of videos posted</strong></li>
          </ul>
          <p>
            This data is used solely to support the creator's growth, monitor for violations the agency can help resolve, and qualify the creator for campaigns and opportunities within the network.
          </p>
        </div>

        <div className="section" id="agency-leaving">
          <h2>7. Leaving the Agency & Termination</h2>
          <ul>
            <li>When a creator first joins, they are placed on a <span className="rainbow">15-day trial period</span>. During this time, the creator can leave immediately with no waiting period.</li>
            <li>After the trial ends, the creator can still leave at any time — however, departure will take <span className="rainbow">30 days</span> to process.</li>
            <li>If a creator leaves after the 15-day trial, there is an additional <span className="rainbow">60-day waiting period</span> after the 30-day quit process before another TikTok agency can sign them, provided they still meet eligibility requirements.</li>
            <li><strong>Rule Violations & Termination:</strong> If a creator violates TJB Management's rules or guidelines at any point, the creator network reserves the right to <span className="rainbow">immediately terminate the relationship at any time, for any reason</span>, with no waiting period and no further obligation to the creator.</li>
          </ul>
        </div>

        <div className="section" id="agency-ip">
          <h2>8. Intellectual Property</h2>
          <p>
            The TJB Management Inc. name, logo, branding, website content, and <a href="/hallie"><span className="rainbow">Hallie</span></a> (our AI assistant) are the exclusive proprietary property of TJB Management Inc. and Tyler J. Beasley.
          </p>
          <p>
            No part of these assets may be reproduced, copied, distributed, or used in any manner without prior written consent. Unauthorized use will be pursued to the fullest extent permitted by law.
          </p>
        </div>

        <div className="section" id="agency-liability">
          <h2>9. Limitation of Liability</h2>
          <p>
            TJB Management Inc. is not responsible or liable for any actions or decisions taken by TikTok, including (but not limited to) account bans, restrictions, demonetization, or removal from the LIVE program.
          </p>
          <p>
            We offer professional management and support services only. We do not control TikTok's platform, policies, or enforcement decisions. All results are not guaranteed.
          </p>
        </div>

        <div className="section" id="agency-contact-disputes">
          <h2>10. Contact and Dispute Resolution</h2>
          <p>
            For legal inquiries, contract questions, or disputes, please contact us at <span className="rainbow">support@tjbmanagementinc.com</span>.
          </p>
          <p>
            All disputes are governed by the laws of the State of Florida. By applying for or signing with TJB Management Inc., you agree to these guidelines and terms.
          </p>
        </div>

        <div className="section" id="agency-support">
          <h2>11. Support Availability</h2>
          <p>TJB Management Inc. TikTok LIVE agency support is available <span className="rainbow">Monday through Friday, 1:00 PM to 9:00 PM Eastern Time</span>, unless otherwise stated.</p>
          <p>Inquiries received outside these hours will be addressed during the next available support period.</p>
        </div>

        <div className="section" id="agency-corporate-policy">
          <h2>12. Corporate Policy: Inquiry Handling</h2>
          <p>TJB Management Inc. handles all inquiries — from creators, partners, or the public — under the same response window described in Support Availability above.</p>

          <p><strong>Communication Rules for Designated External Partners</strong></p>
          <p>
            All required communications must take place using the channels approved by TJB Management Inc.
          </p>
          <p>
            Anyone is welcome to email us at <span className="rainbow">support@tjbmanagementinc.com</span> unless explicitly stated to you otherwise.
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
