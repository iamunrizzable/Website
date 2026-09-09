'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function C2StreamingBasics() {
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

      <div className="fade-top"></div>

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

        <h1>C2 Streaming Basics</h1>
        <p className="subtitle">How gifting, earnings, payouts, and your account work on C2 Live — summarized from C2&apos;s Terms (effective March 13, 2025). The official Terms at c2live.co/terms govern.</p>

        <div className="toc">
          <p>Jump to a section:</p>
          <div className="toc-links">
            <a href="#eligibility">Who Can Stream</a>
            <a href="#gifts">How Gifts Work</a>
            <a href="#gems">How You Earn</a>
            <a href="#redemption">Getting Paid</a>
            <a href="#account">Your Account</a>
            <a href="#termination">Termination</a>
            <a href="#rules">Rules</a>
            <a href="#contact">Contact C2</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>

        <div className="section" id="eligibility">
          <h2>Who Can Stream on C2</h2>
          <p>C2&apos;s Terms set four eligibility requirements. By using C2 you confirm all of them:</p>
          <ul>
            <li><strong>Age.</strong> You must be at least <span className="highlight">18 years old</span>.</li>
            <li><strong>Legal capacity.</strong> You have the legal capacity to enter into a binding contract with C2, and you are legally permitted to use C2 in your jurisdiction.</li>
            <li><strong>Criminal background.</strong> You represent that you have never been convicted of a felony, or any criminal offense involving sexual misconduct or otherwise — and that you have not previously been suspended, removed, deactivated, terminated, or blocked from C2.</li>
            <li><strong>Not a competitor.</strong> You certify that you are not a competitor of C2 and are not using C2 for purposes that compete with it.</li>
          </ul>
          <p>If you don&apos;t meet these criteria, C2&apos;s Terms say you are not permitted to use the C2 Services.</p>
        </div>

        <div className="section" id="gifts">
          <h2>How C2 Gifts Work</h2>
          <p>When you go LIVE, viewers can send you virtual Gifts. Here&apos;s how C2&apos;s Terms describe the flow:</p>
          <ul>
            <li><strong>Step 1 — Viewers buy C2 Coins.</strong> C2 Coins are C2&apos;s in-app Virtual Currency, sold in packages through the viewer&apos;s <span className="highlight">Apple, Google, or PayPal</span> account. The price of each package is displayed at the point of purchase.</li>
            <li><strong>Step 2 — They spend Coins on Gifts.</strong> Gifts are Virtual Goods that viewers send during a live stream. Each Gift&apos;s price is displayed at the point of purchase.</li>
            <li><strong>Step 3 — Gifts earn you C2 Gems.</strong> When you receive a Gift, C2 awards you a number of virtual <span className="highlight">C2 Gems</span> in relation to that Gift. See <em>How You Earn</em> below.</li>
          </ul>
          <p><strong>Things viewers and creators should know about Coins and Gifts, per C2&apos;s Terms:</strong></p>
          <ul>
            <li>Buying Coins doesn&apos;t mean owning them — it&apos;s a <span className="highlight">limited right to use them</span> within the C2 app. Coins and Gifts cannot be redeemed for money or physical goods.</li>
            <li><span className="highlight">All purchases are final</span> — no refunds for Coins or Gifts, and no credit if C2 modifies, suspends, or terminates them.</li>
            <li>Coins and Gifts are <span className="highlight">non-transferable</span> and cannot be sub-licensed. C2 can change their price, how they can be used, set expiration dates, or stop issuing them at any time without notice or compensation.</li>
            <li>C2 is not liable for Coins or Gifts lost to hacking, phishing, or other unauthorized activity, though it may replace them case by case at its discretion.</li>
          </ul>
        </div>

        <div className="section" id="gems">
          <h2>How You Earn: C2 Gems</h2>
          <p>C2 Gems are what you actually redeem for money. Per C2&apos;s Terms:</p>
          <ul>
            <li><strong>Gems come from Gifts.</strong> Currently, when you receive a Gift from another user, C2 awards you a number of C2 Gems in relation to that Gift.</li>
            <li><strong>The rate is set by C2.</strong> The amount of Gems per Gift is determined by C2 in its sole discretion and is <span className="highlight">subject to change without notice</span>. C2&apos;s Terms don&apos;t publish a fixed conversion rate.</li>
            <li><strong>C2 controls Gems entirely.</strong> C2 reserves the absolute right to manage, revise, modify, suspend, discontinue, revoke, or eliminate C2 Gems at any time, for any reason, without notice or compensation.</li>
            <li><strong>Gems are non-transferable and non-refundable.</strong></li>
          </ul>
        </div>

        <div className="section" id="redemption">
          <h2>Getting Paid: Redeeming C2 Gems</h2>
          <ul>
            <li><strong>Redeem for USD.</strong> You can redeem C2 Gems for a set US dollar amount, based on <span className="highlight">minimum and maximum thresholds</span> displayed at the point of redemption. C2 can change the thresholds, amounts, and frequency at any time without notice.</li>
            <li><strong>One request per 24 hours.</strong> You may only make <span className="highlight">one redemption request per twenty-four-hour period</span>.</li>
            <li><strong>Paid through a third party.</strong> C2 may use <span className="highlight">PayPal, Venmo</span>, or another third-party payment vendor — the vendor is shown at the point of redemption. You need a valid account with that vendor in good standing, must agree to its terms, and are responsible for any fees it charges.</li>
            <li><strong>Enter your details correctly.</strong> It&apos;s your responsibility to verify the information you enter when connecting your payment account. C2 is not responsible for lost payments, fraud, unauthorized payments, reversals, or refunds of Gem redemption payments.</li>
            <li><strong>Identity verification.</strong> C2 reserves the right to verify your identity and eligibility before paying out.</li>
            <li><strong>Taxes are on you.</strong> Everyone who redeems C2 Gems is solely responsible for reporting and paying any taxes due on the amounts received.</li>
            <li><strong>Suspected fraud freezes everything.</strong> C2 can revoke, suspend, or limit access to your Coins, Gifts, or Gems if it suspects fraudulent, abusive, or unlawful activity — and won&apos;t reinstate them unless it believes it made an error.</li>
          </ul>
        </div>

        <div className="section" id="account">
          <h2>Your C2 Account</h2>
          <ul>
            <li><strong>Personal, non-commercial use only.</strong> No transferring your account, and no using C2 for commercial activities without C2&apos;s written permission.</li>
            <li><strong>Accurate information.</strong> You agree to provide accurate information and keep your contact information current — C2 says failing to do so may make it difficult to restore your account.</li>
            <li><strong>You&apos;re responsible for everything on your account,</strong> including any purchases made. Be careful on shared devices. C2 is not liable for losses from unauthorized access to your account.</li>
            <li><strong>Don&apos;t share your login.</strong> C2&apos;s Conduct Policy prohibits letting another person access or use your account.</li>
            <li><strong>Interactions are at your own risk.</strong> C2 does not run background checks on users and is not responsible for their conduct.</li>
            <li><strong>Data charges.</strong> You&apos;re responsible for any data usage charges from streaming.</li>
            <li><strong>Your content license.</strong> By using C2, you grant C2 a worldwide, irrevocable, non-exclusive, royalty-free, perpetual license to use your content to operate, develop, and improve its services. C2 may also place ads next to your content without compensating you.</li>
          </ul>
        </div>

        <div className="section" id="termination">
          <h2>Termination — and What You Lose</h2>
          <p>C2 can disable, block, suspend, deactivate, or terminate your account or access at any time, with or without notice, for any reason — including breaking its Terms or policies, breaking the law, fraud or misuse, a legal requirement, preventing harm, or business reasons. You can also delete your account yourself in the app at any time.</p>
          <p><strong>If your account is terminated — by you or by C2, for any reason:</strong></p>
          <ul>
            <li>You <span className="highlight">lose all accumulated Coins, Gifts, and C2 Gems</span> with no refund or compensation.</li>
            <li>You are not entitled to refunds for purchases already made.</li>
            <li>Termination does not cancel recurring subscriptions or payments — you must cancel those yourself through your app store or payment processor.</li>
          </ul>
          <p>Cash out your Gems before you leave. Once the account is gone, so are they.</p>
        </div>

        <div className="section" id="rules">
          <h2>What You&apos;re Not Allowed to Do on LIVE</h2>
          <p>C2&apos;s User Content and Conduct Policy is part of its Terms, and it&apos;s strict — no nudity or hinting at it, no minors on stream (even your own kids), no promoting payment apps or OnlyFans, no drinking or drugs for gifts, no streaming while driving, and more. Violations can mean content removal, termination, legal action, or a report to law enforcement.</p>
          <p><a href="/agencies/c2/community/guidelines" style={{ color: '#a855f7', textDecoration: 'none' }}>See the full breakdown of C2&apos;s Community Guidelines →</a></p>
        </div>

        <div className="section" id="contact">
          <h2>Contact C2</h2>
          <p>C2 Live is owned and operated by <strong>C2 Capital Group Inc.</strong></p>
          <ul>
            <li><strong>Address.</strong> 20283 FL-7, Boca Raton, FL 33498</li>
            <li><strong>Email.</strong> <a href="mailto:support@c2live.co" className="coin-link">support@c2live.co</a> — for questions, reporting violations, and reporting security bugs</li>
            <li><strong>Phone.</strong> <a href="tel:+15614829336" className="coin-link">561-482-9336</a></li>
          </ul>
          <p>You can also report violations with the report button inside the C2 app.</p>
        </div>

        <div className="section" id="faq">
          <h2>Frequently Asked Questions</h2>
          <p><strong>How old do I need to be to stream on C2?</strong></p>
          <p>18 or older. Minors may not create an account or use C2 at all, and may not appear on your stream even briefly.</p>
          <p><strong>How much is a C2 Gem worth?</strong></p>
          <p>C2&apos;s Terms don&apos;t publish a fixed rate. The number of Gems you get per Gift, and the dollar amount you can redeem them for, are set by C2 and shown at the point of redemption — and C2 can change both at any time without notice.</p>
          <p><strong>How often can I cash out?</strong></p>
          <p>One redemption request per 24-hour period, subject to C2&apos;s minimum and maximum thresholds.</p>
          <p><strong>How do I get paid?</strong></p>
          <p>Through a third-party payment vendor such as PayPal or Venmo — whichever C2 shows at the point of redemption. You need a valid account there in good standing, and you cover any fees that vendor charges.</p>
          <p><strong>Can I get a refund on Coins or Gifts?</strong></p>
          <p>No. C2&apos;s Terms state that all purchases of Coins and Gifts are final and non-refundable.</p>
          <p><strong>What happens to my Gems if my account is terminated?</strong></p>
          <p>You lose all accumulated Coins, Gifts, and Gems with no refund or compensation — whether you or C2 closed the account.</p>
          <p><strong>Do I have to pay taxes on my earnings?</strong></p>
          <p>Yes. Everyone who redeems C2 Gems is solely responsible for reporting and paying any taxes due.</p>
          <p><strong>Can I run my C2 account as a business or let someone else stream on it?</strong></p>
          <p>No. Accounts are for personal, non-commercial use, may not be transferred, and may not be accessed by anyone else.</p>
        </div>

        <a href="/agencies/c2/about" className="cta-btn">About Our C2 Agency →</a>

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
