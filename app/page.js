export default function Home() {
  return (
    <html>
      <head>
        <title>TJB Management Inc.</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background-color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #fff;
            overflow-x: hidden;
          }
          main {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            background-color: #0f172a;
          }
          .bg-orbs {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
          }
          .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            animation: float 8s ease-in-out infinite;
          }
          .orb1 {
            width: 300px;
            height: 300px;
            background: rgba(168, 85, 247, 0.15);
            top: 20%;
            left: 10%;
          }
          .orb2 {
            width: 400px;
            height: 400px;
            background: rgba(59, 130, 246, 0.1);
            top: 40%;
            right: 5%;
            animation-delay: 1s;
          }
          .orb3 {
            width: 350px;
            height: 350px;
            background: rgba(236, 72, 153, 0.08);
            bottom: 10%;
            left: 30%;
            animation-delay: 2s;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
          }
          .container {
            max-width: 1000px;
            width: 100%;
            z-index: 10;
          }
          .logo-section {
            text-align: center;
            margin-bottom: 50px;
          }
          .logo-wrapper {
            position: relative;
            display: inline-block;
            margin-bottom: 30px;
          }
          .logo-glow {
            position: absolute;
            inset: -15px;
            background: linear-gradient(135deg, #a855f7, #ec4899, #3b82f6);
            border-radius: 30px;
            filter: blur(20px);
            opacity: 0.4;
            z-index: -1;
          }
          .logo-img {
            width: 300px;
            max-width: 100%;
            height: auto;
            display: block;
            filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.5));
          }
          .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin-bottom: 50px;
          }
          .contact-card {
            position: relative;
            padding: 30px 20px;
            border-radius: 15px;
            text-decoration: none;
            color: #fff;
            border: 2px solid rgba(255,255,255,0.1);
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            height: 140px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            gap: 10px;
          }
          .contact-card::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: -1;
          }
          .contact-card.email::before { background: linear-gradient(135deg, #2563eb, #60a5fa); }
          .contact-card.twitter::before { background: linear-gradient(135deg, #3b82f6, #1e40af); }
          .contact-card.snapchat::before { background: linear-gradient(135deg, #fcd34d, #fef3c7); }
          .contact-card.instagram::before { background: linear-gradient(135deg, #ec4899, #fb7185); }
          .contact-card.tiktok::before { background: linear-gradient(135deg, #000, #4b5563); }
          .contact-card.phone::before { background: linear-gradient(135deg, #10b981, #059669); }
          .contact-card:hover {
            transform: translateY(-10px);
            border-color: rgba(255,255,255,0.3);
          }
          .contact-card.email:hover {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
          }
          .contact-card.twitter:hover {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
          }
          .contact-card.snapchat:hover {
            box-shadow: 0 0 30px rgba(250, 204, 21, 0.4);
          }
          .contact-card.instagram:hover {
            box-shadow: 0 0 30px rgba(236, 72, 153, 0.4);
          }
          .contact-card.tiktok:hover {
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
          }
          .contact-card.phone:hover {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
          }
          .contact-icon {
            font-size: 48px;
            display: block;
          }
          .contact-card:hover .contact-icon {
            transform: scale(1.2);
            transition: transform 0.3s ease;
          }
          .contact-name {
            font-size: 16px;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .footer {
            text-align: center;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 30px;
            max-width: 1000px;
            width: 100%;
            font-size: 14px;
            color: #999;
          }
          .footer p {
            margin: 8px 0;
          }
          .footer .hallie {
            color: #a855f7;
            font-weight: bold;
          }
          @media (max-width: 640px) {
            .contact-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .contact-card {
              padding: 20px 15px;
              height: 120px;
              font-size: 14px;
            }
            .contact-icon {
              font-size: 36px;
            }
            .logo-img {
              width: 250px;
            }
            main {
              padding: 15px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="bg-orbs">
          <div className="orb orb1"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
        </div>
        <main>
          <div className="container">
            <div className="logo-section">
              <div className="logo-wrapper">
                <div className="logo-glow"></div>
                <img src="/logo.png" alt="Tyler J. Beasley" className="logo-img" />
              </div>
            </div>

            <div className="contact-grid">
              <a href="mailto:tyler@tjbmanagementinc.com" className="contact-card email">
                <span className="contact-icon">✉️</span>
                <span className="contact-name">Email</span>
              </a>
              <a href="https://x.com/iamunrizzable" target="_blank" rel="noopener noreferrer" className="contact-card twitter">
                <span className="contact-icon">𝕏</span>
                <span className="contact-name">X</span>
              </a>
              <a href="https://snapchat.com/add/iamunrizzabl3" target="_blank" rel="noopener noreferrer" className="contact-card snapchat">
                <span className="contact-icon">👻</span>
                <span className="contact-name">Snapchat</span>
              </a>
              <a href="https://instagram.com/iamunrizzable" target="_blank" rel="noopener noreferrer" className="contact-card instagram">
                <span className="contact-icon">📷</span>
                <span className="contact-name">Instagram</span>
              </a>
              <a href="https://tiktok.com/@iamunrizzable" target="_blank" rel="noopener noreferrer" className="contact-card tiktok">
                <span className="contact-icon">🎵</span>
                <span className="contact-name">TikTok</span>
              </a>
              <a href="tel:+14086696123" className="contact-card phone">
                <span className="contact-icon">☎️</span>
                <span className="contact-name">Phone</span>
              </a>
            </div>

            <div className="footer">
              <p>Responses to my social media DMs and emails are automated by <span className="hallie">Hallie</span> and not reviewed by Tyler Beasley unless escalated.</p>
              <p style={{fontSize: '12px', marginTop: '15px', color: '#666'}}>This site uses Vercel Analytics to collect IP addresses and basic usage data. For more information, see our <a href="/legal" style={{color: '#a855f7', textDecoration: 'none'}}>legal disclaimers and guidelines</a>.</p>
              <p>© 2026 TJB Management Inc.</p>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
