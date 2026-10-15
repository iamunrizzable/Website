'use client';

import './page.css';

import { useState } from 'react';

export default function TikTokAgencyContract() {
  const [menuOpen, setMenuOpen] = useState(false);

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
        <a href="/legal/external/contracts" className="back-link">← Back to External Contracts</a>

        <h1>TikTok Agency Contract</h1>
        <p className="subtitle">
          The TikTok Agency contract governing TJB Management Inc.'s participation in TikTok's agency program, reproduced here as the original signed document.
        </p>

        <div className="download-row">
          <a href="/legal/contracts/tiktok-agency-contract.pdf" className="download-btn" target="_blank" rel="noopener noreferrer">📄 View PDF</a>
          <a href="/legal/contracts/tiktok-agency-contract.pdf" className="download-btn download-btn--secondary" download>⬇ Download PDF</a>
        </div>

        <p className="pdf-fallback">
          View PDF opens the document in your browser's own PDF viewer — the most reliable way to read it on any
          device, including Safari on iPhone and iPad. Download PDF saves a copy instead.
        </p>

        <footer>
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </footer>
      </main>
    </>
  );
}
