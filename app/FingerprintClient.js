'use client';

import { FingerprintProvider } from '@fingerprint/react';
import FingerprintVisitor from './FingerprintVisitor';

// apiKey/region are read server-side in layout.js (a Server Component can
// see any env var name, regardless of the NEXT_PUBLIC_ prefix Next.js
// requires for client-side process.env access) and passed in as plain
// string props — that's what actually gets the value into the browser
// bundle here, not the env var name itself.
//
// If apiKey is missing/falsy, this renders children directly with no
// FingerprintProvider at all. A previous version passed a possibly-empty
// apiKey straight into FingerprintProvider, which throws synchronously
// when apiKey is falsy — since that wrapped the entire <body>, the crash
// took down every page on the site. This guard makes a misconfigured or
// missing key degrade to "Fingerprint is off," never a site-wide outage.
export default function FingerprintClient({ apiKey, region, children }) {
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Fingerprint] apiKey missing — skipping initialization; site renders normally without it.');
    }
    return children;
  }

  return (
    <FingerprintProvider apiKey={apiKey} region={region}>
      <FingerprintVisitor />
      {children}
    </FingerprintProvider>
  );
}
