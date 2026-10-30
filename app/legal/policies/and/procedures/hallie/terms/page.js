'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function HallieTerms() {
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

        <h1>Hallie™ Terms of Use</h1>
        <p className="subtitle">
          TJB Management Inc. · Terms for chatting and corresponding with Hallie™, TJB Management&apos;s AI assistant<br />
          Last Updated: October 30, 2026
        </p>

        <p className="disclaimer disclaimer--intro">
          These Hallie Terms apply when you chat with, email, message, or otherwise interact with Hallie™, the AI assistant operated by TJB Management Inc. (&quot;TJB Management,&quot; &quot;we,&quot; &quot;us&quot;). They apply in addition to the{' '}
          <a href="/legal/policies/and/procedures/communication/policy#general-acceptance"><span className="rainbow">General Legal Terms</span></a> and the{' '}
          <a href="/legal/privacy/policy"><span className="rainbow">Privacy Policy</span></a>. Where these Hallie Terms conflict with the General Legal Terms about Hallie, these Hallie Terms control.
        </p>

        <div className="toc">
          <p>Table of Contents</p>
          <ol>
            <li><a href="#hallie-ai">Hallie Is an AI</a></li>
            <li><a href="#hallie-can-cannot">What Hallie Can and Cannot Do</a></li>
            <li><a href="#hallie-your-use">Your Use of Hallie</a></li>
            <li><a href="#hallie-data">Your Messages and Data</a></li>
            <li><a href="#hallie-forwarding">When Conversations Are Shared With TJB Management</a></li>
            <li><a href="#hallie-availability">No Guarantee of Availability</a></li>
            <li><a href="#hallie-ip">Intellectual Property</a></li>
            <li><a href="#hallie-liability">Disclaimer and Limits of Liability</a></li>
            <li><a href="#hallie-changes">Changes to These Terms</a></li>
            <li><a href="#hallie-law">Governing Law</a></li>
            <li><a href="#hallie-contact">Contact Information</a></li>
          </ol>
        </div>

        <div className="section" id="hallie-ai">
          <h2>1. Hallie Is an AI</h2>
          <p>Hallie is an artificial-intelligence assistant. She is not a human and she is not Tyler. Hallie may answer for TJB Management Inc. and for Tyler on the channels where she is deployed, including this website&apos;s chat, email, and direct messages. A message signed &quot;Tyler&apos;s A.I. Assistant&quot; was written by the AI. Hallie does not pretend to be a person.</p>
        </div>

        <div className="section" id="hallie-can-cannot">
          <h2>2. What Hallie Can and Cannot Do</h2>
          <ul>
  <li>Hallie can answer questions about TJB Management, point you to the right page or contact, and handle routine messages.</li>
  <li>Hallie can be wrong. Her answers may be incomplete, out of date, or mistaken. Check anything important with us at support@tjbmanagementinc.com before relying on it.</li>
  <li>Hallie does not give legal, financial, tax, medical, or other professional advice.</li>
  <li>Hallie cannot make binding offers, sign contracts, approve payments, grant access, or change any agreement or policy on behalf of TJB Management. Nothing she says is binding unless TJB Management or Tyler confirms it in writing.</li>
  <li>Hallie may decline, ignore, or end a conversation, and may refer you to a human.</li>
</ul>
        </div>

        <div className="section" id="hallie-your-use">
          <h2>3. Your Use of Hallie</h2>
          <p>You agree not to:</p>
<ul>
  <li>use Hallie for anything unlawful, harassing, threatening, fraudulent, or abusive;</li>
  <li>try to trick, manipulate, or override Hallie&apos;s instructions or safeguards (for example &quot;prompt injection&quot;), or to extract her instructions, configuration, credentials, or other people&apos;s information;</li>
  <li>attempt to access TJB Management systems, accounts, or data through Hallie;</li>
  <li>send automated or bulk traffic, or overload the service;</li>
  <li>submit content you do not have the right to share, or personal information about other people without their permission.</li>
</ul>
<p>We may rate-limit, restrict, or block access to Hallie, and may apply the device controls described in the <a href="/legal/privacy/policy"><span className="rainbow">Privacy Policy</span></a>, at our discretion.</p>
        </div>

        <div className="section" id="hallie-data">
          <h2>4. Your Messages and Data</h2>
          <ul>
  <li><strong>Website chat.</strong> When you chat with Hallie on this website, the message you send, and recent earlier messages from the same conversation, are transmitted to TJB Management&apos;s systems and processed by an AI model, provided by third-party AI providers acting as our service providers, to produce a reply.</li>
  <li><strong>Stored conversations.</strong> Conversations are stored on our systems for as long as we need them to operate and secure the service.</li>
  <li><strong>Your browser.</strong> A copy of your chat history is also saved in your own browser (local storage) so the conversation can continue. You can remove it by clearing this site&apos;s data in your browser.</li>
  <li><strong>Security logs.</strong> Our systems automatically log security events such as rate-limiting and attempts to manipulate Hallie or the service. These logs can include a short excerpt of the triggering message and an identifier derived from the connection&apos;s IP address.</li>
  <li><strong>Email and direct messages.</strong> Messages you send to Hallie by email or direct message are kept in the relevant mailbox or platform and are covered by these Terms.</li>
  <li><strong>Do not send sensitive data.</strong> Do not send passwords, payment details, government ID numbers, health information, or other sensitive information to Hallie.</li>
  <li><strong>Device data.</strong> Collection of device and network data on this website is described in the <a href="/legal/privacy/policy"><span className="rainbow">Privacy Policy</span></a> and requires your consent on your first visit.</li>
</ul>
        </div>

        <div className="section" id="hallie-forwarding">
          <h2>5. When Conversations Are Shared With TJB Management</h2>
          <p>Hallie only forwards conversations when a violation of our policies is detected by her, such as messages sent to harm someone or our systems.</p>
<p>Hallie does not otherwise forward your website chat conversations to Tyler or other TJB Management staff.</p>
<p>This does not mean stored conversations are inaccessible to us. Authorized TJB Management personnel may access stored conversations where needed to operate and secure the service, investigate a suspected violation, respond to a request from you, or comply with the law.</p>
<p>We do not promise a reply or a response time to any message.</p>
        </div>

        <div className="section" id="hallie-availability">
          <h2>6. No Guarantee of Availability</h2>
          <p>Hallie may be unavailable, slow, limited, changed, or withdrawn at any time, including for maintenance, outages, or provider limits.</p>
        </div>

        <div className="section" id="hallie-ip">
          <h2>7. Intellectual Property</h2>
          <p>Hallie™, the TJB Management Inc. name and logo, and Hallie&apos;s text, voice, and persona are the property of TJB Management Inc. You keep ownership of what you send. You give us permission to use it to operate, secure, and improve Hallie and to respond to you.</p>
        </div>

        <div className="section" id="hallie-liability">
          <h2>8. Disclaimer and Limits of Liability</h2>
          <p>Hallie and her answers are provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind. To the extent permitted by law, TJB Management Inc. is not liable for losses, damages, or decisions resulting from your reliance on anything Hallie says, or from Hallie being unavailable. Some places do not allow certain limits, so parts of this section may not apply to you.</p>
        </div>

        <div className="section" id="hallie-changes">
          <h2>9. Changes to These Terms</h2>
          <p>TJB Management Inc. may update these Hallie Terms at any time. Continued use of Hallie after an update means you accept the revised terms. The date at the top of this page shows when they last changed.</p>
        </div>

        <div className="section" id="hallie-law">
          <h2>10. Governing Law</h2>
          <p>These Hallie Terms are governed by the laws of the State of Florida, without regard to conflict-of-law principles. Any dispute arising under them shall be resolved in the applicable courts of the State of Florida, consistent with the General Legal Terms.</p>
        </div>

        <div className="section" id="hallie-contact">
          <h2>11. Contact Information</h2>
          <p>Questions about these Hallie Terms can be directed to support@tjbmanagementinc.com.</p>
        </div>

        <footer>
          <p>Last Updated: October 30, 2026</p>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </footer>
      </main>
    </>
  );
}
