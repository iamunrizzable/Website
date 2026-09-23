'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import './GateSpinner.css';
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
//
// /system/status is also EXEMPTED (Tyler's explicit call) — it needs to
// stay checkable during a declared maintenance window, not disappear
// behind the same notice it would otherwise be reporting on. It still
// sits inside DeviceGate below (see app/layout.js), so geo/VPN/Tor/
// datacenter blocking still fully applies — only the maintenance check
// is skipped.
const EXEMPT_PATHS = ['/admin', '/system/status'];
const CHECK_TIMEOUT_MS = 3000;

function isExempt(pathname) {
  return EXEMPT_PATHS.some((p) => pathname?.startsWith(p));
}

export default function MaintenanceGate({ children }) {
  const pathname = usePathname();
  const exempt = isExempt(pathname);
  const [status, setStatus] = useState(exempt ? 'allowed' : 'checking');
  const resolvedRef = useRef(exempt);

  useEffect(() => {
    if (exempt) return;
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
  }, [exempt]);

  if (exempt) return children;

  if (status === 'checking') {
    return (
      <div className="gate-overlay">
        <div className="gate-overlay-bg" />
        <div className="gate-spinner" />
      </div>
    );
  }

  if (status === 'suspended') {
    return <MaintenanceNotice />;
  }

  return children;
}
