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
            TJB Management Inc. is a TikTok LIVE creator management agency founded and operated by Tyler J. Beasley. The agency represents TikTok LIVE creators under formal agreements and provides management, strategy, and growth support. Nothing on this website constitutes legal advice or a binding offer of representation until a signed agreement is in place.
          </p>
        </div>

        <div className="section">
          <h2>2. Creator Eligibility</h2>
          <p>To be considered for representation by TJB Management, a creator must meet all of the following at the time of signing:</p>
          <ul>
            <li><span className="rainbow">Must be at least 18 years of age</span></li>
            <li><span className="rainbow">Must be in good standing with TikTok — no active violations or permanent bans on any account they intend to use under the agency</span></li>
            <li><span className="rainbow">Must not have averaged more than 500,000 diamonds per month over the past 6 months on any TikTok account</span></li>
            <li><span className="rainbow">Must not currently be signed to or in active negotiations with any competing TikTok LIVE agency</span></li>
            <li><span className="rainbow">Must not have signed any backup accounts or secondary accounts to any other agency within the past 6 months</span></li>
            <li><span className="rainbow">The account being signed must be the creator's primary TikTok account — we do not sign backup or secondary accounts</span></li>
            <li><span className="rainbow">Must not have attempted to poach creators from any agency</span></li>
            <li><span className="rainbow">Must be located in the United States or Canada</span></li>
            <li><span className="rainbow">Must be willing and able to go LIVE for a minimum of 1 hour, 4 days per week</span></li>
          </ul>
        </div>

        <div className="section">
          <h2>3. LIVE Trial Period</h2>
          <p>
            TikTok may require certain creators to complete a LIVE trial before gaining unrestricted access to TikTok LIVE. This applies to creators who have not completed a 10-minute LIVE stream within the past 60 days. A creator is not considered officially signed to TJB Management until they have successfully completed their LIVE trial, if one is required by TikTok. TJB Management will support creators through this process but cannot guarantee TikTok's approval or timeline.
          </p>
        </div>

        <div className="section">
          <h2>4. Ban Policy</h2>
          <p>
            TJB Management may, at its sole discretion, attempt to appeal a TikTok ban on behalf of a creator who is actively in the signing process with the agency. This benefit is reserved exclusively for prospective creators who are in active negotiations or onboarding — it is not available to the general public. TJB Management cannot guarantee the outcome of any appeal, as all final decisions rest with TikTok.
          </p>
        </div>

        <div className="section">
          <h2>5. Non-Solicitation & Non-Compete</h2>
          <p>Creators signed to or in negotiations with TJB Management agree to the following:</p>
          <ul>
            <li><span className="rainbow">You may not solicit, recruit, or encourage other TJB Management creators to leave the agency</span></li>
            <li><span className="rainbow">You may not sign with or negotiate representation with a competing TikTok LIVE agency while under contract with TJB Management</span></li>
            <li><span className="rainbow">You may not sign backup accounts, secondary accounts, or any other TikTok account to a competing agency during your time with TJB Management</span></li>
            <li><span className="rainbow">Violations of these terms may result in immediate termination of your agreement and potential legal action</span></li>
          </ul>
        </div>

        <div className="section">
          <h2>6. Intellectual Property</h2>
          <p>
            The TJB Management Inc. name, branding, this website, and <a href="/hallie"><span className="rainbow">Hallie</span></a> (TJB Management's AI assistant) are the sole proprietary property of TJB Management Inc. and Tyler J. Beasley. None of these may be reproduced, copied, distributed, or used in any form without prior written consent from TJB Management Inc. Unauthorized use will be pursued to the fullest extent of the law.
          </p>
        </div>

        <div className="section">
          <h2>7. Limitation of Liability</h2>
          <p>
            TJB Management Inc. is not liable for any decisions made by TikTok regarding a creator's account, including but not limited to bans, restrictions, demonetization, or removal from the TikTok LIVE program. We provide management and support services — we do not control TikTok's platform, policies, or enforcement actions. Results are not guaranteed.
          </p>
        </div>

        <div className="section">
          <h2>8. Contact & Disputes</h2>
          <p>
            For any legal inquiries, contract questions, or disputes related to TJB Management Inc., please contact us at <span className="rainbow">support@tjbmanagementinc.com</span>. All disputes are subject to the laws of the State of California. By applying to or signing with TJB Management, you agree to these terms.
          </p>
        </div>

        <div className="section">
          <h2>9. TJB Support</h2>

          <p><strong>TJB Corporate Support</strong></p>
          <p>Available: 8:00 PM – 12:00 AM ET</p>
          <p>
            TJB Corporate Support handles ALL business inquiries sent to and from TJB Management Inc. that are NOT related to signed creators or creators in the process of signing with TJB Management Inc.
          </p>

          <p><strong>TJB Creator Support</strong></p>
          <p>Available: 7:00 AM – 12:00 AM ET</p>
          <p>
            TJB Creator Support provides support for creators who are currently signed with TJB Management Inc. or in the process of signing.
          </p>

          <p>
            Both teams communicate via email, iMessage, or phone call at our sole discretion, unless otherwise agreed upon.
          </p>

          <p>TJB Management Inc.'s publicly available contact information is:</p>
          <ul>
            <li>📞 <a href="tel:+14086696123"><span className="rainbow">(408) 669-6123</span></a></li>
            <li>📧 <a href="mailto:support@tjbmanagementinc.com"><span className="rainbow">support@tjbmanagementinc.com</span></a></li>
          </ul>

          <p><strong>Important Notes</strong></p>
          <ul>
            <li>Our office is open 7 days a week.</li>
            <li>Corporate Support may respond during Creator Support hours at our sole discretion.</li>
            <li>Most inquiries received outside these hours will be addressed during the next business day.</li>
          </ul>
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
