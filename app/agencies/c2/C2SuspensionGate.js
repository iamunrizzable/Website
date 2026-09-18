'use client';

import { useEffect, useRef, useState } from 'react';
import C2SuspensionNotice from './C2SuspensionNotice';

// Mirrors app/agencies/tiktok/TikTokSuspensionGate.js exactly — same
// fail-open-on-timeout/error design, checking /api/c2-suspension instead.
const CHECK_TIMEOUT_MS = 3000;

export default function C2SuspensionGate({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'suspended' | 'allowed'
  const resolvedRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        setStatus('allowed');
      }
    }, CHECK_TIMEOUT_MS);

    fetch('/api/c2-suspension')
      .then((res) => (res.ok ? res.json() : { suspended: false }))
      .then((result) => {
        if (resolvedRef.current) return;
        resolvedRef.current = true;
        clearTimeout(timeout);
        setStatus(result?.suspended ? 'suspended' : 'allowed');
      })
      .catch(() => {
        if (resolvedRef.current) return;
        resolvedRef.current = true;
        clearTimeout(timeout);
        setStatus('allowed');
      });

    return () => clearTimeout(timeout);
  }, []);

  if (status === 'checking') {
    return (
      <>
        <style>{`
          @keyframes c2sSpin { to { transform: rotate(360deg); } }
        `}</style>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#0f172a',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundImage: 'url(/bg-main.jpeg)',
              backgroundPosition: 'center center',
              backgroundSize: '140%',
              backgroundRepeat: 'no-repeat',
              mixBlendMode: 'lighten',
              opacity: 0.13,
              zIndex: -1,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '3px solid rgba(168,85,247,0.25)',
              borderTopColor: '#a855f7',
              animation: 'c2sSpin 0.8s linear infinite',
            }}
          />
        </div>
      </>
    );
  }

  if (status === 'suspended') {
    return <C2SuspensionNotice />;
  }

  return children;
}
