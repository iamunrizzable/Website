'use client';

import { usePathname } from 'next/navigation';
import './GtaViBanner.css';

// Site-wide notice for the Nov 19 – Nov 30 office closure (full letter at
// /news/closed/for/grand/theft/auto/vi). Shown on every page except
// /admin, per Tyler's explicit scoping — /admin is his own internal tool
// surface, not something a visitor needs this notice on.
const LETTER_PATH = '/news/closed/for/grand/theft/auto/vi';

export default function GtaViBanner() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  if (pathname === LETTER_PATH) return null;

  return (
    <a href="/news/closed/for/grand/theft/auto/vi" className="gta-banner">
      TJB Inc is closing soon for the release of GTA VI. <span className="gta-banner-cta">Learn more →</span>
    </a>
  );
}
