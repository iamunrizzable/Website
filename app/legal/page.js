'use client';

import { useState, useEffect } from 'react';

export default function Legal() {
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
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-main.jpeg");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -3;
          pointer-events: none;
        }

        body {
          margin: 0;
          padding: 0;
          background: transparent;
        }

        @keyframes glowPulse {
          0%, 100% {
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.3);
          }
          50% {
            text-shadow: 0 0 40px rgba(168, 85, 247, 1), 0 0 60px rgba(236, 72, 153, 0.8), 0 0 80px rgba(59, 130, 246, 0.5), 0 0 100px rgba(168, 85, 247, 0.4);
          }
        }

        main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          position: relative;
          z-index: 10;
        }

        h1 {
          color: #d4a5ff;
          margin-bottom: 30px;
          font-size: 32px;
          animation: glowPulse 3s ease-in-out infinite;
        }

        h2 {
          color: #a855f7;
          margin-top: 40px;
          margin-bottom: 15px;
          font-size: 20px;
          animation: glowPulse 3s ease-in-out infinite;
        }

        p {
          color: #7dd3fc;
          margin-bottom: 15px;
          line-height: 1.8;
        }

        li {
          color: #7dd3fc;
          margin-bottom: 12px;
          line-height: 1.8;
        }

        strong {
          font-weight: 700;
          background: linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .rainbow {
          background: linear-gradient(90deg, #d946ef 0%, #a855f7 25%, #3b82f6 50%, #06b6d4 75%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
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
          border-left: 8px solid #a855f7;
          margin-bottom: 30px;
          border-radius: 5px;
          background: transparent;
          transition: all 0.6s ease;
          opacity: 0;
          transform: translateY(20px);
        }

        .section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .menu-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #a855f7;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          z-index: 100;
          transition: all 0.2s;
        }

        .menu-button:hover {
          background: #c084fc;
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
        }

        .menu-dropdown {
          position: fixed;
          top: 70px;
          right: 20px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 8px;
          display: none;
          flex-direction: column;
          z-index: 99;
          min-width: 180px;
        }

        .menu-dropdown.active {
          display: flex;
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

        footer {
          max-width: 900px;
          margin: 60px auto 0;
          padding: 40px 20px;
          border-top: 1px solid rgba(168, 85, 247, 0.2);
          color: #8b9dc3;
          text-align: center;
          font-size: 14px;
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
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
      </div>

      <main>
        <a href="/agency" className="back-link">← Back to Agency</a>

        <h1>TJB Management — Legal & Agency Guidelines</h1>

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
            <li><span className="rainbow">Must not have attempted to poach creators from TJB Management or any other agency</span></li>
            <li><span className="rainbow">Must be willing and able to go LIVE for a minimum of 30 minutes, 3 times per week</span></li>
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

        <footer>
          <p>Last Updated: May 21, 2026</p>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, and website are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>TikTok and the TikTok logo are trademarks of TikTok US Data Security Joint Venture LLC. All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </footer>
      </main>
    </>
  );
}
