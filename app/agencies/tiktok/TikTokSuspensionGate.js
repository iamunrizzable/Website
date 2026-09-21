'use client';

import { useEffect, useRef, useState } from 'react';
import '../../GateSpinner.css';
import SuspensionNotice from './SuspensionNotice';

// How long to wait for the suspension-status check before giving up and
// showing the site anyway. This is a same-origin API call (not a
// third-party script like Fingerprint), so it should resolve almost
// instantly — the timeout only exists so a hung request can never take
// this whole section of the site down. Fails open: an error or timeout
// here means "not suspended," never "suspended."
const CHECK_TIMEOUT_MS = 3000;

// Manual kill switch for /agencies/tiktok and every page under it, flipped
// from /admin/security. When on, this replaces the real page with a
// full-screen notice instead of a 404 or empty page — visitors always get
// an explanation and a way back to the rest of the site. The notice itself
// lives in SuspensionNotice.js, shared with the always-on preview at
// /tiktok/notice.
export default function TikTokSuspensionGate({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'suspended' | 'allowed'
  const resolvedRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        setStatus('allowed');
      }
    }, CHECK_TIMEOUT_MS);

    fetch('/api/tiktok-suspension')
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
    return <SuspensionNotice />;
  }

  return children;
}
