'use client';

import './page.css';

import { useState, useEffect } from 'react';
import { TIKTOK_AGENCY_APPLY_URL } from '@/lib/agency-apply';

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
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/system/status" onClick={() => setMenuOpen(false)}>System Status</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/agencies/tiktok" className="back-link">← Back to One Creator Network</a>

        <h1>One Creator Network</h1>
        <p className="subtitle">One team · One family — a creator-first TikTok LIVE network</p>

        <div className="section">
          <h2>What is One Creator Network?</h2>
          <p>
            <span className="highlight">One Creator Network (OCN)</span> is a creator-first TikTok LIVE agency focused on helping creators grow their platforms, build communities, increase earnings, and connect with opportunities. It is led by co-founders <span className="highlight">Sam</span> and <span className="highlight">Jerry</span>.
          </p>
          <p>
            TJB Management's TikTok creators are now part of One Creator Network, and Tyler is on its management team. Joining is free. Creators who want in apply on TikTok.
          </p>
          <a href={TIKTOK_AGENCY_APPLY_URL} target="_blank" rel="noopener noreferrer" className="cta-btn">Apply to Join One Creator Network</a>
        </div>

        <div className="section">
          <h2>What's in It for You?</h2>
          <ul>
            <li><strong>Mentorship</strong> — one-on-one guidance from experienced creators and industry professionals</li>
            <li><strong>Growth strategies</strong> built around your content and goals, including the OCN LIVE Playbook</li>
            <li><strong>Campaigns, battles, and tournaments</strong> with prizes</li>
            <li><strong>Networking</strong> with creators, brands, and opportunities</li>
            <li><strong>Community support</strong> through the OCN Discord</li>
            <li><strong>Creator protection</strong> — advocacy and resources to protect your brand and content</li>
            <li>Weekly <strong>community meetings</strong> and new creator orientation</li>
          </ul>
        </div>

        <div className="section">
          <h2>Who Can Join?</h2>
          <p>
            OCN welcomes creators at all levels. You need to be active on TikTok LIVE, have a positive attitude, and be committed to growth. OCN looks for passion and potential, not just follower counts. You must be 18 or older.
          </p>
          <p>
            Applications are usually reviewed within 48 hours, and you'll hear back by email or Discord.
          </p>
        </div>

        <div className="section">
          <h2>Leaving a Creator Network</h2>
          <p>
            TikTok changed the quitting rules for creator networks, effective <span className="highlight">November 28, 2026</span> for existing creators (unless they chose to keep the original rules), and immediately for anyone who joined on or after <span className="highlight">October 29, 2026</span>. Under the updated rules, a creator can leave in one of these ways:
          </p>
          <ul>
            <li><strong>Within the first 15 days of joining</strong> — free to quit.</li>
            <li><strong>By mutual agreement</strong> — the creator asks the network to release them. The network has <span className="highlight">7 days</span> to respond, and a creator can submit this request only <span className="highlight">once every 30 days</span>.</li>
            <li><strong>By platform resolution</strong> — if the network declines, within 7 days the creator can ask TikTok for help by showing evidence of extenuating circumstances (for example, if the network violates platform policies).</li>
            <li><strong>Removal by the network</strong> on TikTok.</li>
          </ul>
          <p className="disclaimer">
            These are TikTok's platform rules for all creator networks. Details are on the Manage relationship page and the resolution procedures in LIVE Backstage. Creators who joined before October 29 and kept the original rules keep the earlier 30-day notice and 60-day wait.
          </p>
        </div>

        <div className="section">
          <h2>It Costs You Nothing</h2>
          <p>
            Joining One Creator Network is completely free — no fees, no catches. All that's asked is that you show up and keep growing. Results aren't guaranteed, and OCN's family isn't meant to be your only gifting community: the network gives you the tools, education, and support to build your own.
          </p>
        </div>

        <p className="apply-followup">
          <a href="/agencies/tiktok/connect" className="link-purple link-purple--small">Have questions first? Connect with One Creator Network →</a>
        </p>

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
