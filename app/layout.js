import './globals.css';

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
