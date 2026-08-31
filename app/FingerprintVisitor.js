'use client';

import { useVisitorData } from '@fingerprint/react';

// Mounted once inside FingerprintClient — fires the Fingerprint identify
// call on every page load and logs the visitor/event IDs for verification.
// Renders nothing; visitorId isn't surfaced in the UI anywhere yet.
export default function FingerprintVisitor() {
  const { isLoading, error, data } = useVisitorData({ immediate: true });

  if (!isLoading && !error && data) {
    console.log('[Fingerprint] visitor_id:', data.visitor_id, 'event_id:', data.event_id);
  }
  if (error) {
    console.error('[Fingerprint] error:', error.message);
  }

  return null;
}
