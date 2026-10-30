'use client';

import { useEffect, useState } from 'react';
import './DeviceIdDebug.css';
import { getPersistentMarker } from '@/lib/fingerprint/persistentMarker';
import { CONSENT_EVENT, readConsent } from './consent';

// Mounted once inside app/layout.js — computes the device's persistentMarker
// on every page load and logs it for verification. Renders nothing UNLESS
// the URL has ?fpdebug=1, in which case it shows a small on-page status bar
// — lets verification happen on a phone with no way to open a devtools
// console (no computer, no Mac Web Inspector).
export default function DeviceIdDebug() {
  const [state, setState] = useState({ loading: true, error: null, persistentMarker: null });
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

  // Computing the marker writes it to browser storage, so wait for consent
  // (accepted in DeviceGate) before doing it.
  const [consented, setConsented] = useState(false);
  useEffect(() => {
    if (readConsent()) setConsented(true);
    const onGranted = () => setConsented(true);
    window.addEventListener(CONSENT_EVENT, onGranted);
    return () => window.removeEventListener(CONSENT_EVENT, onGranted);
  }, []);

  useEffect(() => {
    if (!consented) return;
    getPersistentMarker()
      .then((persistentMarker) => {
        console.log('[DeviceId] persistentMarker:', persistentMarker);
        setState({ loading: false, error: null, persistentMarker });
      })
      .catch((err) => {
        console.error('[DeviceId] error:', err.message);
        setState({ loading: false, error: err, persistentMarker: null });
      });
  }, [consented]);

  if (!debug) return null;

  return (
    <div className="device-id-debug">
      {state.loading && 'DeviceId: computing...'}
      {!state.loading && state.error && `DeviceId error: ${state.error.message}`}
      {!state.loading && !state.error && state.persistentMarker && `marker: ${state.persistentMarker}`}
      {!state.loading && !state.error && !state.persistentMarker && 'DeviceId: no id returned'}
      {violations.map((v, i) => (
        <div key={i}>CSP violation: {v}</div>
      ))}
    </div>
  );
}
