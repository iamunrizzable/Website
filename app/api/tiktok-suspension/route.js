import { NextResponse } from 'next/server';
import { isTikTokSuspended } from '@/lib/tokens';

// Public, unauthenticated — every visitor to /agencies/tiktok/* checks this
// on page load via TikTokSuspensionGate. Fails open (suspended: false) on
// any error, same philosophy as the Fingerprint check: a Redis hiccup
// should never look like an intentional suspension.
export async function GET() {
  let suspended = false;
  try {
    suspended = await isTikTokSuspended();
  } catch {
    // ignore — fail open
  }
  return NextResponse.json({ suspended });
}
