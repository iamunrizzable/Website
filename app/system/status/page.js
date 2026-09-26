'use client';

import './page.css';

import { useEffect, useState } from 'react';

const STATUS_COLORS = {
  operational: '#10b981',
  degraded: '#f59e0b',
  down: '#ef4444',
};

const STATUS_TEXT = {
  operational: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
};

function statusBadge(status) {
  const color = STATUS_COLORS[status] ?? '#64748b';
  return {
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 999,
    background: color + '22',
    border: `1px solid ${color}`,
    color,
  };
}

export default function SystemStatus() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e.message));
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
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
        <a href="/system/status" onClick={() => setMenuOpen(false)}>System Status</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>
        <h1>System Status</h1>
        <p className="subtitle">Live status for TJB Management Inc.'s tools and services.</p>

        <div className="status-card">
          {error ? (
            <p style={{ fontSize: 13, color: '#f59e0b' }}>Couldn't load status: {error}</p>
          ) : !data ? (
            <p style={{ fontSize: 13, color: '#64748b' }}>Checking…</p>
          ) : (
            <>
              <p className="checked-at">Last checked {new Date(data.checkedAt).toLocaleString()}</p>
              {data.services.map((svc) => (
                <div key={svc.name} className="status-row">
                  <span className="status-name">{svc.name}</span>
                  <span style={statusBadge(svc.status)}>{svc.label ?? STATUS_TEXT[svc.status] ?? svc.status}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
