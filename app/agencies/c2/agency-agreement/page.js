'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function C2AgencyAgreement() {
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

        <h1>C2 Live Streamer Agency Agreement</h1>
        <p className="subtitle">Summarized from C2 Capital Group Inc.&apos;s own C2 Live Streamer Agency Agreement (effective August 22, 2025) — this is C2&apos;s contract, not TJB Management&apos;s. It governs everyone who joins an Agency on C2, including TJB Management&apos;s. The official Agreement at c2live.co and C2&apos;s Terms at c2live.co/terms govern.</p>

        <div className="toc">
          <p>Table of Contents</p>
          <ol>
            <li><a href="#about">About This Agreement</a></li>
            <li><a href="#definitions">Definitions</a></li>
            <li><a href="#registration">Registration</a></li>
            <li><a href="#commission">Commission Structure</a></li>
            <li><a href="#obligations">Obligations</a></li>
            <li><a href="#termination">Termination</a></li>
            <li><a href="#tax">Tax Responsibilities</a></li>
            <li><a href="#non-solicitation">Non-Solicitation</a></li>
            <li><a href="#legal">Liability, Disputes &amp; Other Legal Terms</a></li>
          </ol>
        </div>

        <div className="section" id="about">
          <h2>1. About This Agreement</h2>
          <p>
            This is C2 Capital Group Inc.&apos;s C2 Live Streamer Agency Agreement (effective August 22, 2025) — a legally binding contract between C2 and anyone who registers as an Agency Owner or Agency Member in C2&apos;s Streamer Agency Program. By registering, you agree to this Agreement and to C2&apos;s Terms.
          </p>
        </div>

        <div className="section" id="definitions">
          <h2>2. Definitions</h2>
          <ul>
            <li><span className="highlight">Agency</span> — a user-created entity consisting of an Agency Owner and one or more Agency Members.</li>
            <li><span className="highlight">Agency Owner</span> — a C2 user who creates and manages a registered Agency, with authority to manage Agency Members and oversee the Agency&apos;s participation in the Program.</li>
            <li><span className="highlight">Agency Member</span> — a C2 user registered as a member under a specific Agency.</li>
            <li><span className="highlight">Commission</span> — the amount described in the Commission Structure section below.</li>
            <li><span className="highlight">Gems</span> and <span className="highlight">Gifts</span> — have the same meaning as under C2&apos;s Terms (see <a href="/agencies/c2/streaming-basics">C2 Streaming Basics</a>).</li>
          </ul>
        </div>

        <div className="section" id="registration">
          <h2>3. Registration</h2>
          <p>
            Creating an Agency or registering as an Agency Member is subject to review and is at <span className="highlight">C2&apos;s sole discretion</span>. C2 can revoke, suspend, delete, or remove an Agency Owner or Agency Member&apos;s status — or delete an Agency entirely — at any time, for any reason, with or without cause, and with or without prior notice. C2 is not liable for any loss of commissions, status, or Agency resulting from this.
          </p>
          <p>
            &quot;Cause&quot; for revocation includes, without limitation: breaching this Agreement, fraudulent activity, failing to comply with C2&apos;s Terms or other policies, or violating applicable law.
          </p>
        </div>

        <div className="section" id="commission">
          <h2>4. Commission Structure</h2>
          <p><strong>Payment.</strong> All commissions are paid as Gems to the Agency Owner&apos;s C2 account and are non-transferable. Commissions process automatically as Agency Members earn Gems, though C2 does not guarantee timing and is not liable for errors (miscalculations, technical issues, etc.) — though it may correct them at its discretion. Any dispute must be reported in writing within <span className="highlight">5 days</span>, or the commission is final.</p>
          <p><strong>Commission on Agency Members&apos; Gifts.</strong> Agency Owners earn a <span className="highlight">5% commission</span> on all Gems earned from Gifts received by their registered Agency Members&apos; accounts. Historically earned Gems, Bonus Bot Gems, contest bonuses, and other rewards don&apos;t count toward this.</p>
          <p><strong>Commission on the Owner&apos;s Own Gifts.</strong> An Agency Owner may also earn a <span className="highlight">5% commission</span> on the Gems they personally earn from Gifts — but only while they have at least <span className="highlight">5 Agency Members</span>, each earning a minimum of <span className="highlight">40,000 Gems per month</span>. Drop below 5 qualifying members and the Owner temporarily loses this self-commission until the count is back to 5 or more.</p>
          <p><strong>Duration.</strong> Commissions run for as long as the Agency Owner–Agency Member relationship lasts, or until this Agreement is terminated. If a Member leaves, the Owner keeps commissions already earned while that Member was registered, but earns nothing further from them after they leave.</p>
          <p><strong>Reporting &amp; Rate Changes.</strong> Commission reports may appear in the C2 app at C2&apos;s sole discretion — C2 is not liable for delays, inaccuracies, or omissions in that reporting. C2 can change commission rates at any time without prior notice.</p>
        </div>

        <div className="section" id="obligations">
          <h2>5. Obligations of Agency Owners and Members</h2>
          <ul>
            <li>Agency Owners must ensure their registered Members comply with C2&apos;s Terms and User Content and Conduct Policy.</li>
            <li>No artificially inflating Gems earnings — through bots, automated means, or fraudulent/fake accounts or transactions.</li>
            <li>No misrepresenting C2&apos;s services or platform, at any time.</li>
            <li>An Agency Member may only be registered under <span className="highlight">one Agency at a time</span>.</li>
            <li>Owners and Members must keep accurate contact information on their C2 account.</li>
          </ul>
        </div>

        <div className="section" id="termination">
          <h2>6. Termination</h2>
          <ul>
            <li><strong>By C2:</strong> C2 can terminate this Agreement, an Agency, or a Member&apos;s registration at any time, with or without cause, with or without prior notice.</li>
            <li><strong>By the Agency Owner:</strong> at any time, by written notice to support@c2live.co or by removing the Agency from their C2 account.</li>
            <li><strong>By an Agency Member:</strong> at any time, by removing their Agency registration from their C2 account.</li>
            <li><strong>Effect:</strong> once an Agency is terminated, the Owner stops earning commissions from its former Members. Commissions already earned are handled under C2&apos;s commission policies at the time of termination.</li>
          </ul>
        </div>

        <div className="section" id="tax">
          <h2>7. Tax Responsibilities</h2>
          <p>
            Agency Owners are solely responsible for reporting and paying any taxes owed on commissions earned, per their local laws. C2 will not withhold or remit taxes on an Owner&apos;s behalf unless legally required to.
          </p>
        </div>

        <div className="section" id="non-solicitation">
          <h2>8. Non-Solicitation</h2>
          <p>
            Agency Owners and Members agree not to solicit or recruit C2 users to join competing platforms, or other Agencies off of C2, for the duration of this Agreement.
          </p>
        </div>

        <div className="section" id="legal">
          <h2>9. Liability, Disputes &amp; Other Legal Terms</h2>
          <p>
            The full Agreement also includes standard legal terms that this summary doesn&apos;t reproduce in full — including C2&apos;s liability limits (capped at the greater of what you paid C2 in the prior 3 months or $100 USD, where such caps are legally allowed), &quot;as is&quot; service disclaimers, your indemnification of C2, a force majeure clause, an insurance disclaimer (C2 provides none — you&apos;re on your own for liabilities from participating), and dispute resolution — New York law, individual arbitration through the AAA (no class actions) where legally enforceable, and a one-year deadline to bring any claim. C2 can amend this Agreement at any time; continued participation means you accept the changes.
          </p>
        </div>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>C2 Live and the C2 logo are trademarks of their respective owner. This page summarizes C2&apos;s own Streamer Agency Agreement for TJB Management creators and is not affiliated with or endorsed by C2. All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
