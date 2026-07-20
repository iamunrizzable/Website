import './globals.css';

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
  description: 'TJB Management Inc. is a TikTok LIVE creator agency founded by Tyler J. Beasley. Free to join — RTMP access, ban appeals, growth strategy, and more.',
  openGraph: {
    title: 'TJB Management Inc. | TikTok LIVE Creator Agency',
    description: 'TJB Management Inc. is a TikTok LIVE creator agency founded by Tyler J. Beasley.',
    url: 'https://tjbmanagementinc.com',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
