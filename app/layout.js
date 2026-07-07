import './globals.css';

// Force per-request rendering so Next.js applies the CSP nonce from
// middleware to its inline scripts. Static prerendering would bake in
// nonce-less inline scripts, which the strict CSP would then block.
export const dynamic = 'force-dynamic';

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
