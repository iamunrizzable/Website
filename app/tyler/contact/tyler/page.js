'use client';

import './page.css';

import { useState, useEffect } from 'react';

export default function Contact() {
  const [menuOpen, setMenuOpen] = useState(false);

  const contacts = [
    { name: 'TJB MGMT TIKTOK AGENCY', href: '/tiktok/agency', icon: '⚡' },
    { name: 'Order TJB MERCH', href: '/tiktok/agency/merch', icon: '👕' },
    { name: 'Contact me on Lark', href: 'https://www.larksuite.com/invitation/page/add_contact/?token=bc7j4483-4472-40fb-ac59-e118aat438m2&unique_id=MgzRHC3OpH2DUUZevnZMKQ==', icon: '💼' },
    { name: 'Phone', href: 'tel:+14086696123', icon: '📱' },
    { name: 'Email', href: 'mailto:tyler@tjbmanagementinc.com', icon: '✉️' },
    { name: 'TikTok', href: 'https://www.tiktok.com/@iamunrizzable?_r=1&_t=ZP-96V2zRaz8BS', icon: '🎵' },
    { name: 'Discord', href: 'https://discord.com/users/1258165634294878208', icon: '💬' },
    { name: 'Instagram', href: 'https://instagram.com/iamunrizzable', icon: '📷' },
    { name: 'Snapchat', href: 'https://snapchat.com/add/iamunrizzabl3', icon: '👻' },
    { name: 'X', href: 'https://x.com/iamunrizzable', icon: '𝕏' },
    { name: 'Buy TikTok Coins (Cheaper)', href: 'https://www.tiktok.com/coin/', icon: '🪙' },
    { name: 'Add me on PlayStation', href: 'https://profile.playstation.com/iamunrizzable', icon: '🎮' },
    { name: 'Hip Hop & R&B Apple Music Playlist', href: 'https://music.apple.com/us/playlist/hip-hop-r-b/pl.u-EdAVzMesDKZopjV', icon: '🎵' },
    { name: 'Club Music Playlist', href: 'https://music.apple.com/us/playlist/club-music/pl.u-r2yB1JGTRG6W3ly', icon: '🎵' },
    { name: 'Rock Playlist', href: 'https://music.apple.com/us/playlist/rock/pl.u-r2yB16YFRG6W3ly', icon: '🎵' },
    { name: 'Pop Playlist', href: 'https://music.apple.com/us/playlist/pop/pl.u-r2yB1a4TRG6W3ly', icon: '🎵' },
    { name: 'Country Playlist', href: 'https://music.apple.com/us/playlist/country/pl.u-qxylEYlt35ZbepN', icon: '🎵' },
    { name: 'Social Battery Recharge Playlist', href: 'https://music.apple.com/us/playlist/social-battery-recharge/pl.u-MDAWv8qTAK57EBN', icon: '🎵' },
  ];

  const internalLinks = ['Email', 'Phone', 'Buy TikTok Coins (Cheaper)', 'TJB MGMT TIKTOK AGENCY', 'Order TJB MERCH'];

  useEffect(() => {

    const cards = Array.from(document.querySelectorAll('.contact-card'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const idx = cards.indexOf(entry.target);
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${idx * 0.05}s`;
          entry.target.classList.add('visible');
        } else {
          entry.target.style.transitionDelay = '0s';
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(card => observer.observe(card));
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
        <a href="/tiktok/agency" onClick={() => setMenuOpen(false)}>TikTok Agency</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <main>
        <a href="/" className="back-link">← Back to Home</a>
        <h1>Connect with Tyler</h1>

        <div className="contact-grid">
          {contacts.map((contact) => (
            <a
              key={contact.name}
              href={contact.href}
              target={!internalLinks.includes(contact.name) ? '_blank' : undefined}
              rel={!internalLinks.includes(contact.name) ? 'noopener noreferrer' : undefined}
              className={`contact-card ${contact.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            >
              {contact.iconSrc
                ? <img src={contact.iconSrc} alt={contact.name} className="contact-icon-img" />
                : <span className="contact-icon">{contact.icon}</span>
              }
              <span className="contact-name">{contact.name}</span>
            </a>
          ))}
        </div>

        <div className="footer">
          <p>© 2026 TJB Management Inc. All rights reserved.</p>
          <p>The TJB Management Inc. name, logo, website, and Hallie™ are the property of TJB Management Inc. and may not be copied, reproduced, or reused without prior written permission.</p>
          <p>TikTok and the TikTok logo are trademarks of TikTok US Data Security Joint Venture LLC. All other logos and trademarks are the property of their respective owners and are not affiliated with or endorsed by TJB Management Inc.</p>
          <p>All rights not expressly granted herein are reserved by TJB Management Inc.</p>
        </div>
      </main>
    </>
  );
}
