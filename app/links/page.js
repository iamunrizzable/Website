'use client';

export default function Links() {
  return (
    <>
      <style>{`
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("/bg-tyler.png");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          z-index: -1;
          pointer-events: none;
        }
        body {
          margin: 0;
          padding: 0;
          background: transparent;
        }
        @keyframes glowPulse {
          0%, 100% {
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.3);
          }
          50% {
            text-shadow: 0 0 40px rgba(168, 85, 247, 1), 0 0 60px rgba(236, 72, 153, 0.8), 0 0 80px rgba(59, 130, 246, 0.5);
          }
        }
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 24px;
          padding: 40px 20px;
        }
        h1 {
          color: #d4a5ff;
          font-size: 28px;
          margin: 0 0 16px;
          animation: glowPulse 3s ease-in-out infinite;
          text-align: center;
        }
        .btn {
          display: block;
          width: 100%;
          max-width: 360px;
          padding: 22px 40px;
          font-size: 20px;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          border-radius: 14px;
          transition: all 0.3s ease;
          color: #fff;
        }
        .btn-tyler {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
        }
        .btn-tyler:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.7);
        }
        .btn-agency {
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
        }
        .btn-agency:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 40px rgba(99, 102, 241, 0.7);
        }
      `}</style>

      <div className="page">
        <h1>TJB Management Inc.</h1>
        <a href="/contact-tyler" className="btn btn-tyler">Tyler's Link Tree</a>
        <a href="/tyler" className="btn btn-agency">About the Agency</a>
      </div>
    </>
  );
}
