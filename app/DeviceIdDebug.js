'use client';

import { useEffect, useState } from 'react';
import { getFingerprint } from '@/lib/fingerprint/collect';

// Mounted once inside app/layout.js — computes the device fingerprint on
// every page load and logs the visitorId for verification. Renders nothing
// UNLESS the URL has ?fpdebug=1, in which case it shows a small on-page
// status bar — lets verification happen on a phone with no way to open a
// devtools console (no computer, no Mac Web Inspector).
export default function DeviceIdDebug() {
  const [state, setState] = useState({ loading: true, error: null, visitorId: null });
  const debug = typeof window !== 'undefined' && window.location.search.includes('fpdebug=1');
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    if (!debug) return;
    const onViolation = (e) => {
      setViolations((prev) => [...prev, `${e.violatedDirective} blocked ${e.blockedURI}`]);
    };
    document.addEventListener('securitypolicyviolation', onViolation);
    return () => document.removeEventListener('securitypolicyviolation', onViolation);
  }, [debug]);

  useEffect(() => {
    getFingerprint()
      .then(({ visitorId }) => {
        console.log('[DeviceId] visitorId:', visitorId);
        setState({ loading: false, error: null, visitorId });
      })
      .catch((err) => {
        console.error('[DeviceId] error:', err.message);
        setState({ loading: false, error: err, visitorId: null });
      });
  }, []);

  if (!debug) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999999,
        background: '#000',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: 12,
        padding: '8px 10px',
        wordBreak: 'break-all',
      }}
    >
      {state.loading && 'DeviceId: computing...'}
      {!state.loading && state.error && `DeviceId error: ${state.error.message}`}
      {!state.loading && !state.error && state.visitorId && `visitorId: ${state.visitorId}`}
      {!state.loading && !state.error && !state.visitorId && 'DeviceId: no id returned'}
      {violations.map((v, i) => (
        <div key={i}>CSP violation: {v}</div>
      ))}
    </div>
  );
}
