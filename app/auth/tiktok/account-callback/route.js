import { NextResponse } from 'next/server';
import { exchangeTikTokAccountCode } from '@/lib/tiktok/business-oauth';
import { storeTikTokAccountToken } from '@/lib/tokens';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
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
    if (tokenData.error) {
      throw new Error(tokenData.error_description ?? tokenData.error);
    }

    // Initial store so we have an access_token to make the next call
    let stored = await storeTikTokAccountToken(tokenData);

    // Resolve the real numeric business_id — Login Kit open_id is rejected by action endpoints
    try {
      const bizRes = await fetch(
        `https://business-api.tiktok.com/open_api/v1.3/business/get/?business_id=${encodeURIComponent(stored.business_id)}`,
        { headers: { 'Access-Token': stored.access_token, 'Content-Type': 'application/json' } }
      );
      const bizJson = await bizRes.json();
      if (bizJson.code === 0 && bizJson.data?.business_id) {
        stored = await storeTikTokAccountToken({ ...tokenData, business_id: bizJson.data.business_id });
      }
    } catch (e) {
      console.error('[account-callback] business/get failed:', e.message);
    }

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
