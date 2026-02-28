'use client';

import { useState } from 'react';

export default function Contact() {
  const [menuOpen, setMenuOpen] = useState(false);

  const contacts = [
    { name: 'Email', href: 'mailto:tyler@tjbmanagementinc.com', icon: '✉️', color: 'from-blue-600 to-blue-400' },
    { name: 'X (Twitter)', href: 'https://x.com/iamunrizzable', icon: '𝕏', color: 'from-blue-600 to-blue-400' },
    { name: 'Snapchat', href: 'https://snapchat.com/add/iamunrizzabl3', icon: '👻', color: 'from-yellow-300 to-yellow-100' },
    { name: 'Instagram', href: 'https://instagram.com/iamunrizzable', icon: '📷', color: 'from-pink-500 to-rose-400' },
    { name: 'TikTok', href: 'https://tiktok.com/@iamunrizzable', icon: '🎵', color: 'from-black to-gray-600' },
    { name: 'Phone', href: 'tel:+14086696123', icon: '📱', color: 'from-green-500 to-emerald-400' },
  ];

  return (
    <html>
      <head>
        <title>Contact - Tyler J. Beasley</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #fff; text-shadow: 0 0 10px rgba(168, 85, 247, 0.4), 0 0 20px rgba(236, 72, 153, 0.2); }
          main { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; position: relative; background-color: #0f172a; }
          .bg-orbs { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; }
          .orb { position: absolute; border-radius: 50%; filter: blur(60px); animation: float 8s ease-in-out infinite; }
          .orb1 { width: 300px; height: 300px; background: rgba(168, 85, 247, 0.15); top: 20%; left: 10%; }
          .orb2 { width: 400px; height: 400px; background: rgba(59, 130, 246, 0.1); top: 40%; right: 5%; animation-delay: 1s; }
          .orb3 { width: 350px; height: 350px; background: rgba(236, 72, 153, 0.08); bottom: 10%; left: 30%; animation-delay: 2s; }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-30px); } }
          .menu-button { position: fixed; top: 20px; right: 20px; background-color: #a855f7; color: #fff; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; z-index: 100; font-size: 16px; }
          .menu-button:hover { background-color: #9333ea; }
          .menu-dropdown { display: none; position: fixed; top: 60px; right: 20px; background-color: #0f172a; border: 2px solid #a855f7; border-radius: 5px; padding: 10px 0; min-width: 200px; z-index: 101; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
          .menu-dropdown.active { display: block; }
          .menu-dropdown a { display: block; padding: 10px 20px; color: #a855f7; text-decoration: none; border-bottom: 1px solid rgba(168, 85, 247, 0.2); }
          .menu-dropdown a:last-child { border-bottom: none; }
          .menu-dropdown a:hover { background-color: rgba(168, 85, 247, 0.1); }
          .container { max-width: 1000px; width: 100%; z-index: 10; }
          .logo-section { text-align: center; margin-bottom: 50px; }
          .logo-img { width: 300px; max-width: 100%; height: auto; filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.5)); }
          .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 50px; }
          .contact-card { position: relative; padding: 30px 20px; border-radius: 15px; text-decoration: none; color: #fff; border: 2px solid rgba(255,255,255,0.15); overflow: hidden; transition: all 0.3s ease; cursor: pointer; height: 140px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 10px; }
          .contact-card::before { content: ''; position: absolute; inset: 0; z-index: -1; }
          .contact-card.email::before { background: linear-gradient(135deg, #2563eb, #60a5fa); }
          .contact-card.twitter::before { background: linear-gradient(135deg, #3b82f6, #1e40af); }
          .contact-card.snapchat::before { background: linear-gradient(135deg, #fcd34d, #fef3c7); }
          .contact-card.instagram::before { background: linear-gradient(135deg, #ec4899, #fb7185); }
          .contact-card.tiktok::before { background: linear-gradient(135deg, #000, #4b5563); }
          .contact-card.phone::before { background: linear-gradient(135deg, #10b981, #059669); }
          .contact-card:hover { transform: translateY(-12px) scale(1.02); border-color: rgba(255,255,255,0.5); box-shadow: 0 12px 24px rgba(0,0,0,0.5), 0 0 40px currentColor; filter: brightness(1.1); }
          .contact-icon { font-size: 64px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)); transition: all 0.3s ease; }
          .contact-card:hover .contact-icon { transform: scale(1.3) rotate(5deg); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6)); }
          .contact-name { font-size: 16px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.2); letter-spacing: 0.5px; }
          .footer { text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px; font-size: 14px; color: #999; }
          .hallie { color: #a855f7; font-weight: bold; cursor: pointer; text-decoration: none; }
          .hallie:hover { text-decoration: underline; }
        `}</style>
      </head>
      <body>
        <div className="bg-orbs">
          <div className="orb orb1"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
        </div>

        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
        <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/hallie" onClick={() => setMenuOpen(false)}>Meet Hallie</a>
          <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a href="/legal" onClick={() => setMenuOpen(false)}>Legal & Guidelines</a>
        </div>

        <main>
          <div className="container">
            <div className="logo-section">
              <img src="/logo-new.png" alt="Tyler J. Beasley" className="logo-img" />
            </div>

            <div className="contact-grid">
              {contacts.map((contact) => (
                <a
                  key={contact.name}
                  href={contact.href}
                  target={contact.name !== 'Email' && contact.name !== 'Phone' ? '_blank' : undefined}
                  rel={contact.name !== 'Email' && contact.name !== 'Phone' ? 'noopener noreferrer' : undefined}
                  className={`contact-card ${contact.name.toLowerCase().replace(/[()]/g, '')}`}
                >
                  <span className="contact-icon">{contact.icon}</span>
                  <span className="contact-name">{contact.name}</span>
                </a>
              ))}
            </div>

            <div className="footer">
              <p>Responses to my social media DMs and emails are automated by <a href="/hallie" className="hallie">Hallie, Tyler's AI assistant</a> and not reviewed by Tyler Beasley unless escalated.</p>
              <p style={{fontSize: '12px', marginTop: '15px', color: '#666'}}>This site uses Vercel Analytics to collect IP addresses and basic usage data. For more information, see our <a href="/legal" style={{color: '#a855f7', textDecoration: 'none'}}>legal disclaimers and guidelines</a>.</p>
              <p>© 2026 TJB Management Inc.</p>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
