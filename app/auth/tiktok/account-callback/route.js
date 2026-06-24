import { NextResponse } from 'next/server';
import { exchangeTikTokAccountCode } from '@/lib/tiktok/business-oauth';
import { storeTikTokAccountToken } from '@/lib/tokens';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  // Login Kit flow returns 'code'; Business portal flow returns 'auth_code'
  const code = searchParams.get('code') ?? searchParams.get('auth_code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(error)}`, request.url));
  }

  const savedState = request.cookies.get('tiktok_account_state')?.value;
  if (!state || state !== savedState) {
    return NextResponse.json({ error: 'State mismatch — possible CSRF' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    const tokenData = await exchangeTikTokAccountCode(code);
    // Login Kit wraps errors in tokenData.error; Business API uses tokenData.code
    if (tokenData.error) {
      throw new Error(tokenData.error_description ?? tokenData.error);
    }
    if (tokenData.code && tokenData.code !== 0) {
      throw new Error(tokenData.message ?? 'Account token exchange failed');
    }
    const stored = await storeTikTokAccountToken(tokenData);

    const response = NextResponse.redirect(new URL('/admin?account_connected=1', request.url));
    response.cookies.delete('tiktok_account_state');
    response.cookies.set('acct_token', JSON.stringify(stored), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[account-callback] Error:', err.message);
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
