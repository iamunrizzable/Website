import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getTikTokAccountAuthUrl } from '@/lib/tiktok/business-oauth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const isPortal = !!(process.env.tiktok_account_authorization_url ?? process.env.TIKTOK_ACCOUNT_AUTHORIZATION_URL);
  const url = getTikTokAccountAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set('tiktok_account_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  // Track whether we used the Business Portal URL so the callback knows which exchange to use
  response.cookies.set('tiktok_account_flow', isPortal ? 'portal' : 'login_kit', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
