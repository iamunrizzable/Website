import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'TJB Management Inc.',
  description: 'Contact and connect with TJB Management Inc.',
  openGraph: {
    title: 'TJB Management Inc.',
    description: 'Contact and connect with TJB Management Inc.',
    url: 'https://tjbmanagementinc.com',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
