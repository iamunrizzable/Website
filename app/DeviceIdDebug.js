'use client';

import { useEffect, useState } from 'react';
import './DeviceIdDebug.css';
import { getFingerprint } from '@/lib/fingerprint/collect';
import { getPersistentMarker } from '@/lib/fingerprint/persistentMarker';

// Mounted once inside app/layout.js — computes the device fingerprint on
// every page load and logs the visitorId for verification. Renders nothing
// UNLESS the URL has ?fpdebug=1, in which case it shows a small on-page
// status bar — lets verification happen on a phone with no way to open a
// devtools console (no computer, no Mac Web Inspector).
export default function DeviceIdDebug() {
  const [state, setState] = useState({ loading: true, error: null, visitorId: null, persistentMarker: null });
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
    Promise.all([getFingerprint(), getPersistentMarker()])
      .then(([{ visitorId }, persistentMarker]) => {
        console.log('[DeviceId] visitorId:', visitorId, 'persistentMarker:', persistentMarker);
        setState({ loading: false, error: null, visitorId, persistentMarker });
      })
      .catch((err) => {
        console.error('[DeviceId] error:', err.message);
        setState({ loading: false, error: err, visitorId: null, persistentMarker: null });
      });
  }, []);

  if (!debug) return null;

  return (
    <div className="device-id-debug">
      {state.loading && 'DeviceId: computing...'}
      {!state.loading && state.error && `DeviceId error: ${state.error.message}`}
      {!state.loading && !state.error && state.visitorId && `visitorId: ${state.visitorId}`}
      {!state.loading && !state.error && state.persistentMarker && <div>marker: {state.persistentMarker}</div>}
      {!state.loading && !state.error && !state.visitorId && 'DeviceId: no id returned'}
      {violations.map((v, i) => (
        <div key={i}>CSP violation: {v}</div>
      ))}
    </div>
  );
}
