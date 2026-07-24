'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function GeneralLegal() {
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

        <h1>General Legal Terms</h1>
        <p className="subtitle">
          TJB Management Inc. · General Terms of Use<br />
          Effective Date: July 21, 2026 · Last Updated: July 21, 2026
        </p>

        <div className="toc">
          <p>Table of Contents</p>
          <ol>
            <li><a href="#acceptance">Acceptance of Terms</a></li>
            <li><a href="#use-of-site">Use of This Website</a></li>
            <li><a href="#no-advice">No Professional Advice</a></li>
            <li><a href="#ip">Intellectual Property</a></li>
            <li><a href="#third-party">Third-Party Links & Services</a></li>
            <li><a href="#conduct">User Conduct</a></li>
            <li><a href="#warranties">Disclaimer of Warranties</a></li>
            <li><a href="#liability">Limitation of Liability</a></li>
            <li><a href="#indemnification">Indemnification</a></li>
            <li><a href="#changes">Changes to These Terms</a></li>
            <li><a href="#governing-law">Governing Law</a></li>
            <li><a href="#contact">Contact Information</a></li>
          </ol>
        </div>

        <div className="section" id="acceptance">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using tjbmanagementinc.com (the "Website"), you agree to be bound by these General Terms of Use. If you do not agree to these terms, please do not use the Website.
          </p>
          <p>
            These general terms apply to all visitors to the Website. Where a more specific policy applies — such as our <a href="/legal/agency"><span className="rainbow">Agency Guidelines</span></a> for signed or signing creators, or the <a href="/legal/hallie-tiktok-moderation-system"><span className="rainbow">Hallie Platform Data Security & Privacy Policy</span></a> for operators of the Hallie automation platform — that specific policy governs in addition to, and where it conflicts, takes precedence over, these general terms.
          </p>
        </div>

        <div className="section" id="use-of-site">
          <h2>2. Use of This Website</h2>
          <p>
            This Website is provided to describe TJB Management Inc.'s services, including talent management, the Hallie automation platform, and related resources. You agree to use the Website only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use and enjoyment of the Website by, any other person.
          </p>
        </div>

        <div className="section" id="no-advice">
          <h2>3. No Professional Advice</h2>
          <p>
            Nothing on this Website constitutes legal, financial, tax, or other professional advice. Information is provided for general purposes only and should not be relied upon as a substitute for professional consultation.
          </p>
          <p>
            Any specific representation, service, or engagement with TJB Management Inc. is governed exclusively by a signed agreement or the applicable policy referenced in Section 1, not by general statements made elsewhere on this Website.
          </p>
        </div>

        <div className="section" id="ip">
          <h2>4. Intellectual Property</h2>
          <p>
            The TJB Management Inc. name, logo, branding, website design, and all content published on this Website are the property of TJB Management Inc. and Tyler J. Beasley, unless otherwise noted. No part of this Website may be reproduced, copied, distributed, or used in any form without prior written consent. Unauthorized use will be pursued to the fullest extent permitted by law.
          </p>
        </div>

        <div className="section" id="third-party">
          <h2>5. Third-Party Links & Services</h2>
          <p>
            This Website may link to third-party websites and services, including TikTok, for reference and convenience. TJB Management Inc. does not control and is not responsible for the content, policies, or practices of any third-party site. Inclusion of a link does not imply endorsement.
          </p>
        </div>

        <div className="section" id="conduct">
          <h2>6. User Conduct</h2>
          <p>
            You agree not to use this Website to transmit any content that is unlawful, harmful, fraudulent, or infringing, or to attempt to gain unauthorized access to any portion of the Website or its underlying systems.
          </p>
        </div>

        <div className="section" id="warranties">
          <h2>7. Disclaimer of Warranties</h2>
          <p>
            This Website and its content are provided "as is" and "as available," without warranties of any kind, express or implied, including but not limited to accuracy, completeness, or fitness for a particular purpose. TJB Management Inc. does not guarantee uninterrupted or error-free operation of the Website.
          </p>
        </div>

        <div className="section" id="liability">
          <h2>8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, TJB Management Inc. is not liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of this Website.
          </p>
          <p>
            This general limitation is in addition to, and does not replace, any liability terms set out in a specific agreement or policy governing a particular service.
          </p>
        </div>

        <div className="section" id="indemnification">
          <h2>9. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless TJB Management Inc., Tyler J. Beasley, and their officers, employees, and affiliates from any claims, damages, or expenses arising out of your use of this Website or your violation of these terms.
          </p>
        </div>

        <div className="section" id="changes">
          <h2>10. Changes to These Terms</h2>
          <p>
            TJB Management Inc. may update these General Terms of Use at any time without prior notice. Continued use of the Website following any changes constitutes acceptance of the revised terms. The "Last Updated" date above reflects the most recent revision.
          </p>
        </div>

        <div className="section" id="governing-law">
          <h2>11. Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of Florida, without regard to conflict-of-law principles. Any dispute arising under these general terms shall be resolved in the applicable courts of the State of Florida.
          </p>
        </div>

        <div className="section" id="contact">
          <h2>12. Contact Information</h2>
          <p>
            Questions about these General Terms of Use can be directed to <span className="rainbow">support@tjbmanagementinc.com</span>.
          </p>
        </div>

        <footer>
          <p>Last Updated: July 21, 2026</p>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, and website are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>TikTok and the TikTok logo are trademarks of TikTok US Data Security Joint Venture LLC. All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </footer>
      </main>
    </>
  );
}
