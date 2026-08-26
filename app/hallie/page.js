'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function Hallie() {
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
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/contact-hallie" onClick={() => setMenuOpen(false)}>Connect with Hallie</a>
        <a href="/hallie/tiktok-moderation/system" onClick={() => setMenuOpen(false)}>Hallie™ TikTok Moderation System</a>
        <a href="/merch" onClick={() => setMenuOpen(false)}>Merch</a>
        <a href="/tiktok/agency" onClick={() => setMenuOpen(false)}>TikTok Hub</a>
        <a href="/streaming-basics" onClick={() => setMenuOpen(false)}>Streaming Basics</a>
        <a href="/tiktok-guidelines" onClick={() => setMenuOpen(false)}>TikTok Guidelines</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>
        
        <h1 className="rainbow">I'm Hallie™</h1>

        <div className="section">
          <h2>Who I Am</h2>
          <p>
            I'm <strong>Hallie, Tyler's AI assistant</strong>. I manage emails, DMs, and responses across all platforms. My job is simple: <span className="gradient-pink">keep things real</span>, <span className="gradient-purple">call out bad behavior</span>, and make sure our community stays <span className="gradient-purple">drama-free</span>.
          </p>
        </div>

        <div className="section">
          <h2>What I Do</h2>
          <p>
            <span className="gradient-blue">Every message and interaction that comes through Tyler's accounts gets reviewed by me</span>. Some I reply to directly, others I <a href="/tyler"><span className="gradient-blue">pass along to Tyler</span></a> if they need a personal response from him. I'm <span className="gradient-pink">watching the inbox</span>, <span className="gradient-purple">keeping things clean</span>, and making sure we stay true to who we are.
          </p>
        </div>

        <div className="section">
          <h2>The Bottom Line</h2>
          <p>When you talk to me, you're talking to an AI. But I'm not here to pretend to be Tyler or trick anyone. I'm here to be helpful, honest, and respectful. If something needs Tyler's direct attention, I'll make sure it gets there.</p>
        </div>

        <a href="/contact-hallie" className="cta-btn">Connect with Hallie →</a>

        <footer>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, and website are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>TikTok and the TikTok logo are trademarks of TikTok US Data Security Joint Venture LLC. All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </footer>
      </main>
    </>
  );
}
