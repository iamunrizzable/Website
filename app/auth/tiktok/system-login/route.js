import { NextResponse } from 'next/server';
import { getTikTokAccountAuthUrl } from '@/lib/tiktok/business-oauth';
import { generateState } from '@/lib/oauth-state';
import { absoluteUrl } from '@/lib/site-url';
import { safeReturnPath } from '@/lib/return-path';

// ?from=<path> is the page the login started on (the Hallie chat can be
// open on any page). The callback sends them back there.
export async function GET(request) {
  try {
    const state = generateState('system');
    const url = getTikTokAccountAuthUrl(state);
    const response = NextResponse.redirect(url);
    const from = safeReturnPath(new URL(request.url).searchParams.get('from'));
    response.cookies.set('hallie_return', from ?? '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: from ? 600 : 0,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[system-login] Failed to build TikTok auth URL:', err.message);
    return NextResponse.redirect(
      absoluteUrl(`/hallie/tiktok/moderation/system?error=${encodeURIComponent('Connect is temporarily unavailable. Please try again shortly.')}`)
    );
  }
}
