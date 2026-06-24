import { NextResponse } from 'next/server';
import { exchangeBusinessPortalAccountCode, exchangeTikTokAccountCode } from '@/lib/tiktok/business-oauth';
import { storeTikTokAccountToken } from '@/lib/tokens';
import { verifyState } from '@/lib/oauth-state';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const authCode = searchParams.get('auth_code'); // Business Portal flow → numeric business_id
  const code = searchParams.get('code');           // Login Kit fallback → open_id only
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(error)}`, request.url));
  }

  if (!verifyState(state)) {
    return NextResponse.json({ error: 'State mismatch — possible CSRF' }, { status: 400 });
  }

  if (!authCode && !code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    let tokenData;
    if (authCode) {
      // Business Portal OAuth — exchange at tt_user/oauth2/token, returns numeric business_id
      const raw = await exchangeBusinessPortalAccountCode(authCode);
      if (raw.code !== 0) {
        throw new Error(raw.message ?? 'Business Portal token exchange failed');
      }
      tokenData = raw.data ?? raw;
    } else {
      // Login Kit fallback — returns open_id, not numeric business_id
      tokenData = await exchangeTikTokAccountCode(code);
      if (tokenData.error) {
        throw new Error(tokenData.error_description ?? tokenData.error);
      }
    }

    let stored = await storeTikTokAccountToken(tokenData);

    // For Login Kit flow only: try /business/get/ with fields=business_id to get numeric ID
    if (!authCode) {
      try {
        const bizRes = await fetch(
          `https://business-api.tiktok.com/open_api/v1.3/business/get/?business_id=${encodeURIComponent(stored.business_id)}&fields=business_id`,
          { headers: { 'Access-Token': stored.access_token, 'Content-Type': 'application/json' } }
        );
        const bizJson = await bizRes.json();
        if (bizJson.code === 0 && bizJson.data?.business_id) {
          stored = await storeTikTokAccountToken({ ...tokenData, business_id: bizJson.data.business_id });
        }
      } catch (e) {
        console.error('[account-callback] business/get failed:', e.message);
      }
    }

    const response = NextResponse.redirect(new URL('/admin?account_connected=1', request.url));
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
