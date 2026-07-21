'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function AgencyLegal() {
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

        <h1>TJB Management — Agency Guidelines</h1>

        <div className="section">
          <h2>1. About TJB Management Inc.</h2>
          <p>
            TJB Management Inc. is a specialized TikTok LIVE creator management agency founded and led by Tyler J. Beasley. We represent TikTok LIVE creators through formal contracts and deliver comprehensive management, strategic guidance, and growth support.
          </p>
          <p>
            <strong>Important:</strong> Nothing on this website constitutes legal advice or a binding offer of representation. All representation begins only upon execution of a signed agreement.
          </p>
        </div>

        <div className="section">
          <h2>2. Creator Eligibility Requirements</h2>
          <p>To qualify for representation with TJB Management Inc., creators must satisfy all of the following criteria at the time of signing:</p>
          <ul>
            <li><span className="rainbow">Be at least 18 years of age</span></li>
            <li><span className="rainbow">Maintain good standing with TikTok (no active violations or permanent bans on the account intended for agency use)</span></li>
            <li><span className="rainbow">Have averaged no more than 500,000 diamonds per month over the past 6 months on any TikTok account</span></li>
            <li><span className="rainbow">Not be currently signed to, or in active negotiations with, any competing TikTok LIVE agency</span></li>
            <li><span className="rainbow">Not have signed backup or secondary accounts to another agency within the past 6 months</span></li>
            <li><span className="rainbow">Sign only their primary TikTok account (backup or secondary accounts are not accepted)</span></li>
            <li><span className="rainbow">Not have attempted to recruit or poach creators from any other agency</span></li>
            <li><span className="rainbow">Be located in the United States or Canada</span></li>
            <li><span className="rainbow">Commit to going LIVE for a minimum of 1 hour, at least 4 days per week</span></li>
          </ul>
        </div>

        <div className="section">
          <h2>3. LIVE Trial Period</h2>
          <p>
            TikTok may require some creators to complete a LIVE trial before unlocking full access to TikTok LIVE features. This typically applies to creators who have not streamed LIVE for at least 10 minutes in the past 60 days.
          </p>
          <p>
            A creator is not considered officially signed with TJB Management Inc. until they successfully complete any required LIVE trial. While we provide full support during this period, we cannot guarantee TikTok's approval or processing timeline.
          </p>
        </div>

        <div className="section">
          <h2>4. Ban Appeal Policy</h2>
          <p>
            TJB Management Inc. may, at its sole discretion, assist with TikTok ban appeals for creators who are actively in the signing process or onboarding phase. This service is exclusive to prospective and incoming creators and is not available to the general public.
          </p>
          <p>
            We cannot guarantee the success of any appeal, as all final decisions rest solely with TikTok.
          </p>
        </div>

        <div className="section">
          <h2>5. Non-Solicitation and Non-Compete</h2>
          <p>Creators who are signed to or actively negotiating with TJB Management Inc. agree to the following:</p>
          <ul>
            <li><span className="rainbow">You will not solicit, recruit, or encourage other TJB Management creators to leave the agency.</span></li>
            <li><span className="rainbow">You will not sign with or negotiate with any competing TikTok LIVE agency while under contract.</span></li>
            <li><span className="rainbow">You will not sign backup, secondary, or any other TikTok accounts to a competing agency during your contract term.</span></li>
          </ul>
          <p>Violations of these provisions may result in immediate contract termination and potential legal action.</p>
        </div>

        <div className="section">
          <h2>6. Intellectual Property</h2>
          <p>
            The TJB Management Inc. name, logo, branding, website content, and <a href="/hallie"><span className="rainbow">Hallie</span></a> (our AI assistant) are the exclusive proprietary property of TJB Management Inc. and Tyler J. Beasley.
          </p>
          <p>
            No part of these assets may be reproduced, copied, distributed, or used in any manner without prior written consent. Unauthorized use will be pursued to the fullest extent permitted by law.
          </p>
        </div>

        <div className="section">
          <h2>7. Limitation of Liability</h2>
          <p>
            TJB Management Inc. is not responsible or liable for any actions or decisions taken by TikTok, including (but not limited to) account bans, restrictions, demonetization, or removal from the LIVE program.
          </p>
          <p>
            We offer professional management and support services only. We do not control TikTok's platform, policies, or enforcement decisions. All results are not guaranteed.
          </p>
        </div>

        <div className="section">
          <h2>8. Contact and Dispute Resolution</h2>
          <p>
            For legal inquiries, contract questions, or disputes, please contact us at <span className="rainbow">support@tjbmanagementinc.com</span>.
          </p>
          <p>
            All disputes are governed by the laws of the State of Florida. By applying for or signing with TJB Management Inc., you agree to these guidelines and terms.
          </p>
        </div>

        <div className="section">
          <h2>9. Support Availability</h2>
          <p>TJB Management Inc. maintains the following support hours (all times Eastern Time):</p>
          <ul>
            <li><span className="rainbow">TJB Creator Support — 7:00 AM to 12:00 AM ET.</span> Support for creators who are signed to or actively signing with TJB Management Inc.</li>
            <li><span className="rainbow">TJB Corporate Support — 8:00 PM to 12:00 AM ET.</span> Business inquiries directed to TJB Management Inc. that were not initiated by the agency.</li>
          </ul>
          <p>Inquiries received outside these windows will be addressed during the next available support period for the applicable support hours.</p>
        </div>

        <div className="section">
          <h2>10. Corporate Policy: Inquiry Handling and TikTok Appeals Process (Effective July 22, 2026)</h2>
          <p>TJB Management Inc. operates 7 days a week with clearly defined response windows:</p>

          <p><strong>Creator Inquiries</strong></p>
          <ul>
            <li><span className="rainbow">Related to creators who are signed or in the process of signing with TJB Management Inc.</span></li>
            <li><span className="rainbow">Response Window: 7:00 AM – 12:00 AM ET daily</span></li>
          </ul>

          <p><strong>Corporate Inquiries</strong></p>
          <ul>
            <li><span className="rainbow">All other business inquiries not related to signed or signing creators.</span></li>
            <li><span className="rainbow">Response Window: 8:00 PM – 12:00 AM ET daily</span></li>
          </ul>

          <p><strong>Communication Rules for Designated External Partners</strong></p>
          <p>
            All required communications must take place using the channels approved by TJB Management Inc. Personal virtual or in-person meetings are discontinued unless mandated by official policy or law.
          </p>
          <p>
            Anyone is welcome to email us at <span className="rainbow">support@tjbmanagementinc.com</span> unless explicitly stated to you otherwise.
          </p>

          <p><strong>TikTok Suspension Appeals Process</strong></p>
          <ol>
            <li>We will review all violation clips per TikTok's policies and share findings privately with the creator.</li>
            <li>If the ban appears unfair, we will first appeal through TikTok Backstage to the USDS Trust and Safety team.</li>
            <li>If that appeal fails and we still disagree with the ban, we will then ask the designated partner for assistance.</li>
            <li>If the ban is justified, no appeal will be submitted.</li>
          </ol>
          <p>Designated external partners should not reach out about bans unless explicitly requested by TJB Management Inc.</p>
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
