'use client';

import { useEffect, useRef, useState } from 'react';
import '../../GateSpinner.css';
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
      <div className="gate-overlay">
        <div className="gate-overlay-bg" />
        <div className="gate-spinner" />
      </div>
    );
  }

  if (status === 'suspended') {
    return <C2SuspensionNotice />;
  }

  return children;
}
