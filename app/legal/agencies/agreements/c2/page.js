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
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/legal" className="back-link">← Back to Legal</a>

        <h1>C2 Live Streamer Agency Agreement</h1>
        <p className="subtitle">Effective Date: August 22, 2025. This is the full text of C2 Capital Group Inc.&apos;s own C2 Live Streamer Agency Agreement, reproduced here for TJB Management creators. This is C2&apos;s contract, not TJB Management&apos;s — it governs everyone who joins an Agency on C2, including TJB Management&apos;s. The official Agreement at c2live.co and C2&apos;s Terms at c2live.co/terms govern.</p>

        <div className="toc">
          <p>Table of Contents</p>
          <ol>
            <li><a href="#definitions">1. Definitions</a></li>
            <li><a href="#registration">2. Agency Owner and Agency Member Registration</a></li>
            <li><a href="#commission">3. Commission Structure</a></li>
            <li><a href="#obligations">4. Obligations of the Agency Owners and Agency Members</a></li>
            <li><a href="#termination">5. Termination of Agreement</a></li>
            <li><a href="#tax">6. Tax Responsibilities</a></li>
            <li><a href="#liability">7. Limitation of Liability</a></li>
            <li><a href="#disclaimers">8. Disclaimers</a></li>
            <li><a href="#indemnity">9. Indemnity by You</a></li>
            <li><a href="#force-majeure">10. Force Majeure</a></li>
            <li><a href="#non-solicitation">11. Non-Solicitation</a></li>
            <li><a href="#disputes">12. Dispute Resolution</a></li>
            <li><a href="#amendments">13. Amendments</a></li>
            <li><a href="#severability">14. Severability</a></li>
            <li><a href="#insurance">15. Insurance Disclaimer</a></li>
            <li><a href="#waiver">16. Waiver</a></li>
            <li><a href="#assignment">17. Assignment</a></li>
            <li><a href="#entire-agreement">18. Entire Agreement</a></li>
          </ol>
        </div>

        <p style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.8, marginBottom: 30 }}>
          This C2 Live Streamer Agency Agreement (the &quot;Agreement&quot;) outlines the terms and conditions for participation in the C2 Live Streamer Agency Program (the &quot;Program&quot;) and is a legally binding contract between you and C2 Capital Group Inc. (the &quot;Company&quot;). By registering as an Agency Owner or an Agency Member you agree to be bound by this Agreement and the C2 Terms available at https://c2live.co/terms.
        </p>

        <div className="section" id="definitions">
          <h2>1. Definitions</h2>
          <ul>
            <li>&quot;You,&quot; and &quot;Your&quot; refer to the party, other than C2 Capital Group Inc., entering into this Agreement and participating in the Program.</li>
            <li>&quot;Agency&quot; refers to a user-created entity within the Program, consisting of an Agency Owner and one or more Agency Members, all of whom participate in the Program under the terms of this Agreement.</li>
            <li>&quot;Agency Owner&quot; means a C2 user who creates and manages a registered Agency on their C2 account, having the authority to manage Agency Members, and oversee other aspects of the Agency&apos;s participation in the Program, subject to the terms of this Agreement.</li>
            <li>&quot;Agency Member&quot; means a C2 user who is registered as a member under a specific Agency within the Program.</li>
            <li>&quot;Commission&quot; refers to the amount described in the Commission Structure section of this Agreement.</li>
            <li>&quot;Gems&quot; has the same meaning as C2 Gems under Section 15 of the C2 Terms.</li>
            <li>&quot;Gifts&quot; has the same meaning as Gifts under Section 15 of the C2 Terms.</li>
            <li>&quot;Program&quot; refers to the program described in this Agreement.</li>
            <li>&quot;User,&quot; and &quot;Users&quot; have the same meaning as &quot;User&quot; under Section 2 of the C2 Terms.</li>
            <li>&quot;We,&quot; &quot;Us,&quot; &quot;Our,&quot; &quot;The Company,&quot; and &quot;C2&quot; refer to C2 Capital Group Inc.</li>
          </ul>
        </div>

        <div className="section" id="registration">
          <h2>2. Agency Owner and Agency Member Registration</h2>
          <p>
            As a user of the C2 app, you have the ability to create an Agency and become an Agency Owner, or register as a member of an existing Agency within the Program. Both the creation of an Agency and the registration as an Agency Member are subject to review and will be at the Company&rsquo;s sole discretion.
          </p>
          <p>
            The Company reserves the right to revoke, suspend, delete, or remove your status as an Agency Owner or Agency Member, or to delete or remove an Agency, at any time, for any reason, with or without cause, and with or without prior notice. The Company will not be held liable for any loss of commissions, status, Agency, or other consequences resulting from the exercise of these rights.
          </p>
          <p>
            For clarity, &quot;cause&quot; for revocation by the Company includes, but is not limited to, breach of this Agreement, fraudulent activities, failure to comply with the Company&rsquo;s Terms or other policies, or violation of applicable laws.
          </p>
        </div>

        <div className="section" id="commission">
          <h2>3. Commission Structure</h2>
          <p><strong>Commission Payment and Processing:</strong></p>
          <p>
            All commissions are paid in the form of Gems to the Agency Owner&apos;s C2 account and are non-transferable. Commissions will be processed automatically as Agency Members earn Gems. While C2 makes reasonable efforts to ensure accuracy, it does not guarantee the timing of commission processing. C2 shall not be liable for any errors in awarding commissions, including, but not limited to, miscalculations or technical issues. In the event of an error, C2 reserves the right to correct it at its sole discretion. Any disputes regarding commissions must be reported in writing within 5 days; otherwise, the commission will be deemed final.
          </p>
          <p><strong>Agency Owner Commissions on Gifts:</strong></p>
          <p>
            Agency Owners will receive a 5% commission on all Gems earned from Gifts received by any of their registered Agency Members&apos; C2 accounts. Gems eligible for commissions exclude historically earned Gems, Bonus Bot Gems, contest bonuses, or any other rewards.
          </p>
          <p><strong>Agency Owner Commissions on Personal Gems Earnings:</strong></p>
          <p>
            Agency Owners may be eligible to earn a 5% commission on the Gems they earn from Gifts on their C2 account. Gems eligible for commissions exclude historically earned Gems, Bonus Bot Gems, contest bonuses, or any other rewards. To become eligible for this commission and maintain eligibility, the Agency Owner must have at least five (5) Agency Members, with each member earning a minimum of forty thousand (40,000) Gems per month. If the number of Agency Members who meet the forty thousand (40,000) Gems per month requirement falls below five (5), the Agency Owner will temporarily lose eligibility to earn commissions on their own Gems earnings. If the number of qualifying Agency Members increases back to five (5) or more, the Agency Owner will regain eligibility to earn the 5% commission on their future Gems earnings from Gifts.
          </p>
          <p><strong>Duration of Commission Earnings:</strong></p>
          <p>
            Commissions are earned for the duration of the relationship between the Agency Owner and the registered Agency Member or until this Agreement is terminated as outlined in Section 5. If an Agency Member leaves an Agency, the Agency Owner retains any commissions earned while the Agency Member was registered with the Agency. However, once an Agency Member terminates their registration with the Agency, the Agency will no longer earn commissions from that Agency Member.
          </p>
          <p><strong>Commission Reporting:</strong></p>
          <p>
            Commission earnings reports may be made available in the C2 app at the sole discretion of the Company. The Company is not liable for any delays, inaccuracies, or omissions in commission reporting.
          </p>
          <p><strong>Modification of Commission Rates:</strong></p>
          <p>
            The Company reserves the right to modify commission rates at any time without prior notice.
          </p>
        </div>

        <div className="section" id="obligations">
          <h2>4. Obligations of the Agency Owners and Agency Members</h2>
          <ul>
            <li>Agency Owners are responsible for ensuring that their registered Agency Members comply with the Company&apos;s Terms and User Content and Conduct Policy.</li>
            <li>Agency Owners and Agency Members must not engage in or encourage any artificial inflation of Gems earnings, such as through bots or other automated means, or through fraudulent or fake accounts or transactions.</li>
            <li>Agency Owners and Agency Members will not misrepresent the Company&apos;s services or platform, at any time.</li>
            <li>Agency Members may only be registered under one Agency at a time.</li>
            <li>Agency Owners and Agency Members are responsible for providing and maintaining accurate contact information on their C2 account.</li>
          </ul>
        </div>

        <div className="section" id="termination">
          <h2>5. Termination of Agreement</h2>
          <p><strong>Termination by the Company:</strong> The Company reserves the right to terminate this Agreement, an Agency, or an Agency Member&rsquo;s registration with an Agency at any time, with or without cause, and with or without prior notice.</p>
          <p><strong>Termination by the Agency Owner:</strong> The Agency Owner may terminate this Agreement at any time by providing written notice via email to support@c2live.co or by removing the Agency from their C2 account.</p>
          <p><strong>Termination by an Agency Member:</strong> An Agency Member may terminate their registration with an Agency at any time by removing their Agency registration from their C2 account.</p>
          <p><strong>Effects of Agency Termination:</strong> Upon termination of an Agency by either the Company or the Agency Owner, the Agency Owner will no longer earn commissions from any of its registered Agency Members. Any commissions earned prior to termination will be handled in accordance with the Company&apos;s prevailing commission policies at the time of termination.</p>
        </div>

        <div className="section" id="tax">
          <h2>6. Tax Responsibilities</h2>
          <p>
            Agency Owners are solely responsible for reporting and paying any applicable taxes on commissions earned, in accordance with their local tax laws and regulations. The Company will not withhold or remit taxes on behalf of Agency Owners unless required by law.
          </p>
        </div>

        <div className="section" id="liability">
          <h2>7. Limitation of Liability</h2>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            We do not exclude or limit our liability to you where it would be illegal to do so. In countries where the below types of exclusions are not allowed, we are responsible to you only for losses and damages that are a reasonably foreseeable result of our failure to use reasonable care and skill or our breach of our contract with you. This section does not affect consumer rights that cannot be waived or limited by any contract or agreement.
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            In countries where exclusions or limitations of liability are allowed, neither C2, its affiliates, officers, directors, employees, shareholders, contractors, agents, licensors, suppliers, or service providers involved in creating, producing, or delivering our services will be liable, to the maximum extent permitted under applicable law, for any direct, special, indirect, consequential, exemplary, incidental, punitive, fixed, enhanced, or any other damages of any kind, including but not limited to damages for loss of use, commissions, profits, data, goodwill, revenues, savings, business opportunity, or other intangible losses or other economic loss, computer damage or system failure, or the cost of substitute services of any kind arising out of or in connection with these terms; or from your access to or use of, or inability to access or use, our services; or from the conduct or user content of any users or any content of any third party on or through any of our services; or from any unauthorized access, use, or alteration of your user content, whether based on warranty, contract, statute, tort (including but not limited to negligence), product liability, or any other legal theory, and whether or not C2 has been informed of the possibility of such damage, even if a limited remedy provided in these terms is found to have failed of its essential purpose.
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            Besides the types of liability, we cannot limit by law (as described in this section), C2 limits our liability to you to the greater of (a) the amounts you have paid us in the three months before you first assert a claim; or (b) $100 USD (or the equivalent in your local currency).
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            The exclusions and limitations of damages set forth above are fundamental elements of the basis of the bargain between you and C2.
          </p>
        </div>

        <div className="section" id="disclaimers">
          <h2>8. Disclaimers</h2>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            To the fullest extent permitted by law, C2 provides our services (including all content contained therein) on an &quot;as is&quot; and &quot;as available&quot; basis. C2 makes no warranties of any kind, whether express, implied, statutory, or otherwise, with respect to our services (including all content contained therein), including, without limitation, any implied warranties of satisfactory quality, merchantability, accuracy, quiet enjoyment, fitness for a particular purpose, or non-infringement.
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            C2 does not represent or warrant that (a) your use of the C2 services (including all content contained therein) will be secure, uninterrupted, complete, error-free, or will meet your requirements; (b) any defects in our services (including all content contained therein) will be discovered or corrected; (c) our services (including all content contained therein) are free of viruses or other harmful components; or (d) any content or information you obtain on or through our services will be accurate or appropriate for your purposes. Furthermore, C2 makes no guarantees as to the number of active users at any time, users&apos; ability or desire to communicate with you, or the conduct of users you meet through our services.
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            C2 disclaims liability for, and makes no warranty regarding, the connectivity and availability of our services (including all content contained therein) or the delivery of any communications.
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            C2 has no obligation to verify the identity of or screen the persons using our services, nor to monitor the use of our services by other users. Therefore, C2 disclaims any and all liability for your interactions with and the conduct of other users and for identity theft or any other misuse of your identity or information.
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            The information presented on or through our services is made available solely for informational purposes. C2 does not guarantee the accuracy, completeness, or usefulness of any information on our services or any results from your use of our services. C2 does not adopt, endorse, or accept responsibility or liability for the conduct of any users or for the accuracy or reliability of any opinion, advice, or statement made by any party other than C2. Under no circumstances will C2 be responsible for any losses, damages, or harm of any kind resulting from any user&apos;s conduct or your use of our services or from anyone&apos;s reliance on information or other content posted on our services, or transmitted to or by any users.
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            C2 is not responsible for any damage to your computer hardware, software, or other equipment or technology, including, without limitation, damage from any security breach, virus, bugs, tampering, hacking, fraud, error, omission, interruption, defect, delay in operation or transmission, computer line or network failure, or any other technical or other disruption or malfunction.
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            The laws of certain jurisdictions or states do not allow limitations on implied warranties. To the extent such warranties cannot be disclaimed under the laws of your jurisdiction, we limit the duration and remedies of such warranties to the full extent permissible under those laws.
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            This warranty does not affect any consumer rights you might have under applicable law, including the legal guarantee in certain places such as the European Union that products and services must comply with this agreement and your rights in case of non-conformity of a product or service.
          </p>
        </div>

        <div className="section" id="indemnity">
          <h2>9. Indemnity by You</h2>
          <p>
            To the extent permitted under applicable law, you agree to indemnify, defend, and hold harmless C2, its affiliates, and its respective officers, directors, shareholders, employees, contractors, and agents from and against any and all complaints, demands, claims, damages, losses, costs, liabilities, and expenses, including legal and accounting fees, arising out of or in connection with this Agreement or your participation in the Program.
          </p>
        </div>

        <div className="section" id="force-majeure">
          <h2>10. Force Majeure</h2>
          <p>
            The Company shall not be liable for delays or failures to perform due to circumstances beyond its reasonable control, including but not limited to natural disasters, acts of government, internet outages, or technical failures. The Company reserves the right to temporarily suspend this Agreement during such events without penalty.
          </p>
        </div>

        <div className="section" id="non-solicitation">
          <h2>11. Non-Solicitation</h2>
          <p>
            Agency Owners and Agency Members agree not to solicit or attempt to recruit users on C2 to join competing platforms or other Agencies off of C2 during the term of this Agreement.
          </p>
        </div>

        <div className="section" id="disputes">
          <h2>12. Dispute Resolution</h2>
          <p>
            All disputes, claims, or causes of action arising under this Agreement will be governed by the laws of the State of New York and the federal laws of the United States, excluding any conflicts of law principles.
          </p>
          <p>
            If arbitration as described below is prohibited by applicable law, you agree that all disputes, claims, or causes of action will be heard and resolved in a court of competent jurisdiction located in New York, New York, USA. You consent to the personal jurisdiction of such courts, agree to the convenience of the forum, and waive any objections to proceeding in such courts.
          </p>
          <p>
            Except where prohibited by law, any disputes, claims, or causes of action (whether in contract, tort, statute, regulation, or otherwise, and whether pre-existing, present, or future) arising out of or relating to these terms or our services (including all content) will be resolved by a sole arbitrator pursuant to the rules of the American Arbitration Association (AAA).
          </p>
          <p>
            Accordingly, except where prohibited by law, you waive any right to participate in any class action against C2 related to any disputes, claims, or causes of action, and agree to opt out of any class proceedings against C2.
          </p>
          <p>
            To initiate arbitration, provide written notice at the address specified in the Contact Us section of these terms. If C2 initiates arbitration, we will notify you at the email address provided during your C2 account registration.
          </p>
          <p style={{ textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.3 }}>
            You and C2 agree that any disputes, claims, or causes of action arising out of or related to the C2 services must commence within one (1) year after the dispute, claim, or cause of action accrues. Otherwise, it is permanently barred.
          </p>
          <p>
            If you are a resident in any jurisdiction where the above provision is unenforceable, then any disputes, claims, or causes of action will be governed by and construed under the laws of your jurisdiction of residence, and resolved by competent civil courts within your jurisdiction of residence.
          </p>
        </div>

        <div className="section" id="amendments">
          <h2>13. Amendments</h2>
          <p>
            The Company reserves the right to modify this Agreement at any time. The &apos;Effective Date&apos; will always be displayed at the top of the page, indicating when the most recent changes were made and when they take effect. You are responsible for regularly reviewing the Agreement for any updates. Continued participation in the Program constitutes your acceptance of the updated terms and conditions.
          </p>
        </div>

        <div className="section" id="severability">
          <h2>14. Severability</h2>
          <p>
            If any provision of this Agreement is found to be unlawful, void, or unenforceable, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions of this Agreement will remain valid and enforceable.
          </p>
        </div>

        <div className="section" id="insurance">
          <h2>15. Insurance Disclaimer</h2>
          <p>
            The Company does not provide insurance for Agency Owners or Agency Members. Each party is solely responsible for any liabilities, damages, or expenses they incur through their participation in the Program or use of the C2 platform.
          </p>
        </div>

        <div className="section" id="waiver">
          <h2>16. Waiver</h2>
          <p>
            The failure of the Company to exercise or enforce any right or provision of these terms shall not constitute a waiver of such right or provision. Any waiver of a provision of these terms shall be effective only if in writing and signed by the relevant party.
          </p>
        </div>

        <div className="section" id="assignment">
          <h2>17. Assignment</h2>
          <p>
            To the extent permitted by applicable law, these terms, and any rights or licenses granted hereunder, may not be transferred or assigned by you, but may be freely assigned by C2 without restriction. Any attempted assignment in violation of these terms shall be void.
          </p>
        </div>

        <div className="section" id="entire-agreement">
          <h2>18. Entire Agreement</h2>
          <p>
            This Agreement constitutes the entire understanding between the Company and the Agency and supersedes all prior agreements, understandings, or communications, whether written or oral, related to the subject matter of this Agreement.
          </p>
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
