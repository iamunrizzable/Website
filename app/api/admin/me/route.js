import { NextResponse } from 'next/server';

// Admin pages call this to confirm the session (middleware already
// requires a valid admin_session to reach it). Admin API calls are
// authorized by that cookie, so no secret is handed to the browser.
export async function GET() {
  return NextResponse.json({ key: 'session' });
}
