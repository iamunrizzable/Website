import { NextResponse } from 'next/server';
import { exchangeBusinessCode, exchangeBusinessPortalAccountCode } from '@/lib/tiktok/business-oauth';
import { storeBusinessTokens, storeTikTokAccountToken } from '@/lib/tokens';
import { verifyState, getStateType } from '@/lib/oauth-state';
import { absoluteUrl } from '@/lib/site-url';

const ALLOWED_PATHS = ['/admin'];

function safeRedirect(path) {
  const ok = ALLOWED_PATHS.find(p => path === p || path.startsWith(p + '?'));
  return NextResponse.redirect(absoluteUrl(ok ? path : '/admin'));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const authCode = searchParams.get('auth_code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return safeRedirect(`/admin?error=${encodeURIComponent(error)}`);
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
      const response = safeRedirect('/admin?account_connected=1');
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
    const response = safeRedirect('/admin?business_connected=1');
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
    return safeRedirect(`/admin?error=${encodeURIComponent(err.message)}`);
  }
}
