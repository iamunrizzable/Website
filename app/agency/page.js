'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function AgencyPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>

      <div className="fade-top"></div>

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
        <a href="/" className="back-link">← Back to Home</a>

        <h1>TJB Management Inc.</h1>
        <p className="subtitle">A TikTok LIVE Creator Agency — Founded by Tyler J. Beasley</p>

        <div className="section">
          <h2>What is TJB Management?</h2>
          <p>
            TJB Management Inc. is a TikTok LIVE creator agency founded by <span className="highlight">Tyler J. Beasley</span> — a creator manager with <span className="highlight">5 years of experience</span> working inside TikTok Backstage and managing creators across multiple TikTok agencies. Tyler built TJB Management to give creators the direct, personalized support that most agencies simply don't deliver.
          </p>
          <p>
            Whether you're just getting started or already pulling serious numbers, TJB Management gives you the infrastructure, strategy, and protection to take your stream to the next level — and it costs you <span className="highlight">absolutely nothing to join</span>.
          </p>
        </div>

        <div className="section">
          <h2>What's in It for You?</h2>
          <ul>
            <li>Access to an <strong>exclusive Creator Network</strong> with real industry connections</li>
            <li>Personalized <strong>LIVE strategy plans</strong> built around your content and goals</li>
            <li>Full <strong>ban assistance and violation protection</strong> — we go to bat for you</li>
            <li>Exclusive <strong>agency campaigns, leaderboards, and tournaments</strong> with prizes</li>
            <li><strong>Account takeovers, creator spotlights, and in-person meetups</strong> across the US</li>
            <li>Elite-level <strong>live streaming education</strong> from one of the top creator managers in the industry</li>
            <li>Access to our <strong>private, creator-only Discord server</strong></li>
            <li>Help getting <strong>more views, more diamonds, and more exposure</strong> — with zero cost to you</li>
          </ul>
        </div>

        <div className="section">
          <h2>Creator Tiers</h2>
          <p>Perks and services scale with your performance. Here's how it breaks down:</p>
          <div className="tier-grid">
            <div className="tier-card diamond">
              <div className="tier-name">💎 Diamond Tier</div>
              <div className="tier-req">1M+ diamonds per month</div>
            </div>
            <div className="tier-card growing">
              <div className="tier-name">📈 Growing Creator</div>
              <div className="tier-req">250K – 1M diamonds per month</div>
            </div>
            <div className="tier-card community">
              <div className="tier-name">🌐 Community Tier</div>
              <div className="tier-req">100K+ diamonds per month</div>
            </div>
          </div>
          <p className="disclaimer">
            * To qualify for creator services, creators are expected to complete a minimum of 10 streamed days per month (at least 1 hour per session), accumulate 15 streamed hours per month, and earn a minimum of 10,000 diamonds per month. Creator perks are determined by tier level.
          </p>
        </div>

        <div className="section">
          <h2>What Managers Can See</h2>
          <p>
            When you join TJB Management, your creator network managers are given access to certain account data through TikTok's agency dashboard. This is what allows us to support, protect, and advocate for you effectively. Managers have visibility into:
          </p>
          <ul>
            <li><strong>LIVE replays</strong> — managers can review past streams</li>
            <li><strong>LIVE analytics</strong> — real-time and historical performance data from your streams</li>
            <li><strong>Current violations</strong> — any active strikes or policy flags on your account</li>
            <li><strong>Violation clips</strong> — the specific clip flagged for each violation</li>
            <li><strong>Diamond count</strong> — your total diamonds earned</li>
            <li><strong>LIVE time</strong> — your total hours streamed</li>
            <li><strong>Follower count</strong></li>
            <li><strong>Like count</strong></li>
            <li><strong>Number of videos posted</strong></li>
          </ul>
          <p>
            This data is used solely to support your growth, monitor for violations we can help resolve, and qualify you for campaigns and opportunities within the network.
          </p>
        </div>

        <div className="section">
          <h2>Ban Appeals</h2>
          <p>
            If your in-app ban appeal gets denied, your TJB Management creator network manager may appeal the ban on your behalf — <span className="highlight">at their discretion</span>. Not every ban is eligible for escalation, but when it is, we go to bat for you.
          </p>
        </div>

        <div className="section">
          <h2>Agency Eligibility & Leaving</h2>
          <p>To be eligible to join TJB Management, you must meet all of the following:</p>
          <ul>
            <li>You are <span className="highlight">not currently signed to another agency</span> on this account or any account</li>
            <li>You have <span className="highlight">not exceeded 500,000 diamonds</span> in the current calendar month or any of the 5 prior calendar months</li>
            <li>You are located in the <span className="highlight">United States or Canada</span></li>
          </ul>
          <ul>
            <li>When you first join, you are placed on a <span className="highlight">15-day trial period</span>. During this time, you can leave immediately with no waiting period.</li>
            <li>After the trial ends, you can still leave at any time — however, your departure will take <span className="highlight">30 days</span> to process.</li>
            <li>If you leave after the 15-day trial, there is an additional <span className="highlight">60-day waiting period</span> after the 30-day quit process before another agency can sign you, provided you still meet eligibility requirements.</li>
            <li><strong>Rule Violations & Termination:</strong> If you violate TJB Management's rules or guidelines at any point, the creator network reserves the right to <span className="highlight">immediately terminate your relationship at any time, for any reason</span>, with no waiting period and no further obligation to you.</li>
          </ul>
        </div>

        <div className="section">
          <h2>It Costs You Nothing</h2>
          <p>
            Joining TJB Management is completely free — no fees, no contracts, no catches. There's nothing to lose and everything to gain. All we ask is that you show up and stream consistently.
          </p>
        </div>

        <a href="https://www.tiktok.com/t/ZTkgQvTCb/" target="_blank" rel="noopener noreferrer" className="cta-btn">Apply to Join TJB Management →</a>
        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <a href="/contact-agency" style={{ color: '#a855f7', fontSize: 14, textDecoration: 'none' }}>Have questions first? Connect with the agency →</a>
        </p>

        <div className="footer">
          <p>© 2026 Tyler J. Beasley. All rights reserved. TJB Management Inc. and the TJB Management Inc. website are the sole proprietary property of TJB Management Inc. and may not be reproduced or copied without prior written consent.</p>
          <p>TikTok and the TikTok logo are the property of TikTok US Data Security Joint Venture LLC. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}
