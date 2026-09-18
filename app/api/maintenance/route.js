import { NextResponse } from 'next/server';
import { isSiteInMaintenance } from '@/lib/tokens';

// Public, unauthenticated — checked on every page load via MaintenanceGate
// (app/layout.js, wraps the whole site). Fails open (maintenance: false)
// on any error — a Redis hiccup must never look like an intentional
// site-wide shutdown.
export async function GET() {
  let maintenance = false;
  try {
    maintenance = await isSiteInMaintenance();
  } catch {
    // ignore — fail open
  }
  return NextResponse.json({ maintenance });
}
