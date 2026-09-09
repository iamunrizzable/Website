'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function C2AgenciesFAQ() {
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
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/agencies/c2" className="back-link">← Back to C2</a>

        <h1>C2 Agencies FAQ</h1>
        <p className="subtitle">C2 Capital Group Inc.&apos;s own FAQ for the C2 Agency feature, reproduced here for TJB Management creators. See the full terms at <a href="/agencies/c2/agency-agreement">C2 Agency Agreement</a>.</p>

        <div className="section">
          <p><strong>What is the C2 Agency feature?</strong></p>
          <p>The C2 Agency feature allows experienced streamers to build and manage their own network of streamers. Agency owners earn a commission based on the total earnings of the streamers in their agency.</p>

          <p><strong>How much commission do agency owners get?</strong></p>
          <p>Agency owners earn 5% commission on their agency&apos;s total earnings for life. More information can be found here: <a href="https://c2live.co/agency-agreement" target="_blank" rel="noopener noreferrer">c2live.co/agency-agreement</a>.</p>

          <p><strong>Can you leave an agency?</strong></p>
          <p>Yes, you can leave an agency at any time. However, any commission already earned by the agency is non-refundable and irreversible.</p>

          <p><strong>Can you join more than one agency?</strong></p>
          <p>No, you can only join one agency at a time.</p>

          <p><strong>How many streamers can join your agency?</strong></p>
          <p>Currently, there is no limit to the number of streamers that can join an agency.</p>

          <p><strong>When are agency commissions deposited to your wallet?</strong></p>
          <p>Agency commissions are deposited shortly after the earnings from members are reflected in your account.</p>

          <p><strong>Will you lose your commission on a member if their gems are held back due to fraud?</strong></p>
          <p>Yes, if a member&apos;s gems are held back due to fraud, the equivalent commission will be deducted from your cashable gems and/or held back from your account.</p>

          <p><strong>Can you join your own agency?</strong></p>
          <p>No, you cannot join your own agency at this time.</p>

          <p><strong>How do you recruit streamers to join your agency?</strong></p>
          <p>You can recruit streamers by sending direct invitations and promoting your agency link on social media and other platforms.</p>
          <p>Emphasize the benefits of joining, such as exclusive contests, mentorship opportunities, and increased earning potential.</p>
          <p>You can find your agency share link in the menu in the &quot;My Agency&quot; section.</p>

          <p><strong>What happens if you disband your agency?</strong></p>
          <p>If you choose to disband your agency, you will no longer earn commissions on the streamers who were part of it. Streamers in your agency will also lose their agency affiliation and will be free to join other agencies.</p>

          <p><strong>Do streamers pay a fee to join an agency?</strong></p>
          <p>No, streamers do not pay any fee to join an agency.</p>

          <p><strong>Can an agency owner be removed for violating platform rules?</strong></p>
          <p>Yes, if an agency owner violates platform rules or terms of service, their agency can be terminated, and they may lose all commissions.</p>

          <p><strong>How can you monitor your agency&apos;s performance?</strong></p>
          <p>Agency owners have access to a &quot;My Agency&quot; report found in settings. This report provides insights into agency&apos;s earnings, active members, and overall performance.</p>

          <p><strong>Are there going to be contests for C2 Agencies?</strong></p>
          <p>Yes there will be contests exclusive to agencies and their members on a regular basis. If you have additional questions or need agency related assistance please contact support@c2live.co.</p>
        </div>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
