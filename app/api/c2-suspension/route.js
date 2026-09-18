import { NextResponse } from 'next/server';
import { isC2Suspended } from '@/lib/tokens';

// Public, unauthenticated — every visitor to /agencies/c2/* checks this on
// page load via C2SuspensionGate. Fails open (suspended: false) on any
// error, same philosophy as the TikTok equivalent.
export async function GET() {
  let suspended = false;
  try {
    suspended = await isC2Suspended();
  } catch {
    // ignore — fail open
  }
  return NextResponse.json({ suspended });
}
