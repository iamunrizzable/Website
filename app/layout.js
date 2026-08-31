import './globals.css';

import FingerprintClient from './FingerprintClient';

// Force per-request rendering so Next.js applies the CSP nonce from
// middleware to its inline scripts. Static prerendering would bake in
// nonce-less inline scripts, which the strict CSP would then block.
export const dynamic = 'force-dynamic';

// Paints iOS Safari's own chrome (status-bar area at top, toolbar area
// at bottom) to match the site background. Without this, Safari guesses
// a tint by sampling the page and gets it slightly wrong — the
// "colors cut and mismatch at the top and bottom of every page" bug.
// Those bands are browser chrome, not page pixels; page CSS can't fix
// them, only this meta tag can. #0f172a = the site-wide overlay color.
export const viewport = {
  themeColor: '#0f172a',
};

export const metadata = {
  title: 'TJB Management Inc. | TikTok LIVE Creator Agency',
  description: 'TJB Management Inc. is a TikTok LIVE creator agency founded by Tyler. Free to join — RTMP access, ban appeals, growth strategy, and more.',
  openGraph: {
    title: 'TJB Management Inc. | TikTok LIVE Creator Agency',
    description: 'TJB Management Inc. is a TikTok LIVE creator agency founded by Tyler.',
    url: 'https://tjbmanagementinc.com',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  // Read server-side so the value reaches the client regardless of the env
  // var's exact name (Vercel's Fingerprint integration provisions
  // NEXT_FPJS_PUBLIC_API_KEY, which — unlike NEXT_PUBLIC_-prefixed vars —
  // Next.js does NOT auto-inline into client bundles). Falls back to the
  // NEXT_PUBLIC_ name too in case that's what's set locally.
  const fpApiKey = process.env.NEXT_FPJS_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_FPJS_PUBLIC_API_KEY || '';
  const fpRegion = process.env.NEXT_FPJS_REGION || process.env.NEXT_PUBLIC_FPJS_REGION || 'us';

  return (
    <html lang="en">
      <body>
        <FingerprintClient apiKey={fpApiKey} region={fpRegion}>
          {children}
        </FingerprintClient>
      </body>
    </html>
  );
}
