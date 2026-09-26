'use client';

import { usePathname } from 'next/navigation';
import './EmailBanner.css';

// Site-wide notice for the ongoing email deliverability issue (full
// letter at /news/email/services/unavailable). Standing in for
// GtaViBanner for now — GtaViBanner.js is untouched and still wired to
// swap back in once email service is confirmed restored. Shown on every
// page except /admin, matching GtaViBanner's scoping.
const LETTER_PATH = '/news/email/services/unavailable';

export default function EmailBanner() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  if (pathname === LETTER_PATH) return null;

  return (
    <div className="email-banner">
      <a href={LETTER_PATH} className="email-banner-link">
        Some email services are unavailable. <span className="email-banner-cta">Learn more →</span>
      </a>
    </div>
  );
}
