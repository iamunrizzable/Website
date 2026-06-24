import { NextResponse } from 'next/server';
import { exchangeBusinessCode, exchangeBusinessPortalAccountCode } from '@/lib/tiktok/business-oauth';
import { storeBusinessTokens, storeTikTokAccountToken } from '@/lib/tokens';
import { verifyState, getStateType } from '@/lib/oauth-state';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const authCode = searchParams.get('auth_code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(error)}`, request.url));
  }

  if (!verifyState(state)) {
    return NextResponse.json({ error: 'State mismatch — possible CSRF' }, { status: 400 });
  }

  if (!authCode) {
    return NextResponse.json({ error: 'Missing auth_code' }, { status: 400 });
  }

  const isAccountAuth = getStateType(state) === 'acct';

  try {
    if (isAccountAuth) {
      // Account OAuth via Business Portal — store as account token
      const raw = await exchangeBusinessPortalAccountCode(authCode);
      if (raw.code !== 0) throw new Error(raw.message ?? 'Account token exchange failed');
      const stored = await storeTikTokAccountToken(raw.data ?? raw);
      const response = NextResponse.redirect(new URL('/admin?account_connected=1', request.url));
      response.cookies.set('acct_token', JSON.stringify(stored), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      return response;
    }

    // Advertiser OAuth — store as business token
    const tokenData = await exchangeBusinessCode(authCode);
    if (tokenData.code && tokenData.code !== 0) {
      throw new Error(tokenData.message ?? 'Token exchange failed');
    }
    const stored = await storeBusinessTokens(tokenData);
    const response = NextResponse.redirect(new URL('/admin?business_connected=1', request.url));
    response.cookies.set('biz_token', JSON.stringify(stored), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[business/callback] Error:', err.message);
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
