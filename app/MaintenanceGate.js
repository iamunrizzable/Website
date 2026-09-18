'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import MaintenanceNotice from './MaintenanceNotice';

// Wraps the ENTIRE site (app/layout.js, outside DeviceGate) — unlike the
// TikTok/C2 kill switches, which each only gate their own agency subtree
// via a segment layout, "for the entire site" means every route, so this
// lives at the root instead.
//
// /admin/* is deliberately EXEMPTED, checked via the current pathname
// before this ever calls the API: if it weren't, turning maintenance mode
// ON would also lock the admin out of /admin/security/kill/switches — the
// only place to turn it back OFF — with no way back in short of clearing
// Redis by hand. The API routes under /api/admin/* still work regardless
// (they're separate serverless functions, never touched by this
// client-side layout gate), so the toggle itself was never actually at
// risk — only the PAGE that calls it would have been unreachable.
const CHECK_TIMEOUT_MS = 3000;

export default function MaintenanceGate({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const [status, setStatus] = useState(isAdminRoute ? 'allowed' : 'checking');
  const resolvedRef = useRef(isAdminRoute);

  useEffect(() => {
    if (isAdminRoute) return;
    resolvedRef.current = false;
    setStatus('checking');

    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        setStatus('allowed');
      }
    }, CHECK_TIMEOUT_MS);

    fetch('/api/maintenance')
      .then((res) => (res.ok ? res.json() : { maintenance: false }))
      .then((result) => {
        if (resolvedRef.current) return;
        resolvedRef.current = true;
        clearTimeout(timeout);
        setStatus(result?.maintenance ? 'suspended' : 'allowed');
      })
      .catch(() => {
        if (resolvedRef.current) return;
        resolvedRef.current = true;
        clearTimeout(timeout);
        setStatus('allowed');
      });

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminRoute]);

  if (isAdminRoute) return children;

  if (status === 'checking') {
    return (
      <>
        <style>{`
          @keyframes mgSpin { to { transform: rotate(360deg); } }
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
              animation: 'mgSpin 0.8s linear infinite',
            }}
          />
        </div>
      </>
    );
  }

  if (status === 'suspended') {
    return <MaintenanceNotice />;
  }

  return children;
}
