'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function CommunicationPolicy() {
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

        <h1>Communication Policy</h1>
        <p className="subtitle">
          TJB Management Inc. · Professional Conduct in Business Communication<br />
          Last Updated: October 13, 2026
        </p>

        <div className="toc">
          <p>Table of Contents</p>
          <ol>
            <li><a href="#comm-purpose">Purpose</a></li>
            <li><a href="#comm-scope">Scope</a></li>
            <li><a href="#comm-standards">Professional Conduct Standards</a></li>
            <li><a href="#comm-prohibited">Prohibited Conduct</a></li>
            <li><a href="#comm-channels">Official Communication Channels</a></li>
            <li><a href="#comm-response-times">Response Times</a></li>
            <li><a href="#comm-confidentiality">Confidentiality</a></li>
            <li><a href="#comm-enforcement">Reporting & Enforcement</a></li>
            <li><a href="#comm-contact">Contact</a></li>
          </ol>
        </div>

        <div className="section" id="comm-purpose">
          <h2>1. Purpose</h2>
          <p>
            This policy sets the standard for how TJB Management Inc. — including Tyler, any staff, and anyone
            communicating on the company&apos;s behalf — interacts with creators, partners, vendors, and the public.
            The goal is simple: every interaction should be professional, respectful, and focused on the business
            at hand.
          </p>
        </div>

        <div className="section" id="comm-scope">
          <h2>2. Scope</h2>
          <p>
            This policy applies to all communication conducted on behalf of TJB Management Inc., across every
            channel — email, phone and text, direct messages, video calls, social media, and in person. It applies
            to communication with creators represented by the agency, prospective creators, partners, vendors, and
            the general public.
          </p>
        </div>

        <div className="section" id="comm-standards">
          <h2>3. Professional Conduct Standards</h2>
          <p>All communication on behalf of TJB Management Inc. must be:</p>
          <ul>
            <li><strong>Professional</strong> — communication stays focused on business, not personal matters</li>
            <li><strong>Respectful</strong> — courteous and considerate, regardless of how a conversation is going</li>
            <li><strong>Honest</strong> — accurate and not misleading about the business, its services, or its terms</li>
            <li><strong>Timely</strong> — responded to within a reasonable timeframe</li>
          </ul>
          <p>
            <strong>Flirting, romantic advances, or sexual comments of any kind are not permitted in any business
            communication</strong> — this applies regardless of who initiates it, and regardless of the relationship
            between the parties. Business communication stays business communication.
          </p>
        </div>

        <div className="section" id="comm-prohibited">
          <h2>4. Prohibited Conduct</h2>
          <p>The following are not permitted in any communication conducted on behalf of TJB Management Inc.:</p>
          <ul>
            <li>Flirting, romantic advances, or sexual comments</li>
            <li>Harassment, threats, or intimidation of any kind</li>
            <li>Discriminatory language or conduct based on race, gender, religion, national origin, disability, sexual orientation, or any other protected class</li>
            <li>Profanity or abusive language directed at another person</li>
            <li>Sharing confidential business or creator information without authorization</li>
            <li>Misrepresenting the company, its terms, or its services</li>
          </ul>
        </div>

        <div className="section" id="comm-channels">
          <h2>5. Official Communication Channels</h2>
          <p>
            Business communication should take place through the official channels listed on the{' '}
            <a href="/tyler/contact/tyler"><span className="rainbow">Connect with Tyler</span></a> page, or through
            whatever channel a creator and their manager have agreed to use for ongoing contact. Business shouldn&apos;t
            be conducted through channels that bypass this policy or make it harder to document what was actually
            said.
          </p>
        </div>

        <div className="section" id="comm-response-times">
          <h2>6. Response Times</h2>
          <p>
            We aim to respond to business communication within a reasonable timeframe during normal business hours.
            Response times may be longer outside of business hours, on weekends, or during periods of high volume —
            see <a href="/system/status"><span className="rainbow">System Status</span></a> for any known, ongoing
            service disruptions.
          </p>
        </div>

        <div className="section" id="comm-confidentiality">
          <h2>7. Confidentiality</h2>
          <p>
            Information shared in the course of business — creator performance data, account details, contract
            terms, or anything else not otherwise public — is confidential and should not be shared outside of
            what&apos;s necessary to conduct that business.
          </p>
        </div>

        <div className="section" id="comm-enforcement">
          <h2>8. Reporting & Enforcement</h2>
          <p>
            Anyone who experiences or witnesses conduct that violates this policy in communication with TJB
            Management Inc. should report it using the contact information below. Reports are taken seriously, and
            a violation of this policy may result in termination of a creator&apos;s representation agreement or
            other appropriate action, consistent with{' '}
            <a href="/legal/policies/and/procedures/tiktok/agency#agency-leaving">
              <span className="rainbow">Section 7 (Leaving the Agency & Termination)</span>
            </a>{' '}
            of our TikTok Agency Policies & Procedures.
          </p>
        </div>

        <div className="section" id="comm-contact">
          <h2>9. Contact</h2>
          <p>
            Questions about this policy, or reports of conduct that violates it, can be sent to{' '}
            <strong>support@tjbmanagementinc.com</strong>.
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
