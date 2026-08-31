'use client';

import { useVisitorData } from '@fingerprint/react';

// Mounted once inside FingerprintClient — fires the Fingerprint identify
// call on every page load and logs the visitor/event IDs for verification.
// Renders nothing UNLESS the URL has ?fpdebug=1, in which case it shows a
// small on-page status bar — lets verification happen on a phone with no
// way to open a devtools console (no computer, no Mac Web Inspector).
export default function FingerprintVisitor() {
  const { isLoading, error, data } = useVisitorData({ immediate: true });
  const debug = typeof window !== 'undefined' && window.location.search.includes('fpdebug=1');

  if (!isLoading && !error && data) {
    console.log('[Fingerprint] visitor_id:', data.visitor_id, 'event_id:', data.event_id);
  }
  if (error) {
    console.error('[Fingerprint] error:', error.message);
  }

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
      {isLoading && 'Fingerprint: loading...'}
      {!isLoading && error && `Fingerprint error: ${error.message}`}
      {!isLoading && !error && data && `visitor_id: ${data.visitor_id} | event_id: ${data.event_id}`}
      {!isLoading && !error && !data && 'Fingerprint: no data returned'}
    </div>
  );
}
