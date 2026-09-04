import { NextResponse } from 'next/server';

// Diagnostic-only: reports the IP address exactly as middleware.js derives
// it, so a mismatch between "IP entered in /admin/security" and "IP the
// server actually sees for this device right now" can be confirmed instead
// of guessed (mobile carriers commonly rotate the public IP behind CGNAT).
export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;
  return NextResponse.json({ ip });
}
