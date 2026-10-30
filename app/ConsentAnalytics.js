'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CONSENT_EVENT, readConsent } from './consent';

// Vercel Analytics and Speed Insights collect visitor data, so they only
// load after the visitor has accepted the consent screen in DeviceGate.
export default function ConsentAnalytics() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (readConsent()) setGranted(true);
    const onGranted = () => setGranted(true);
    window.addEventListener(CONSENT_EVENT, onGranted);
    return () => window.removeEventListener(CONSENT_EVENT, onGranted);
  }, []);

  if (!granted) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
