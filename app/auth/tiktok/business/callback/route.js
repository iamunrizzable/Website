import { NextResponse } from 'next/server';
import { exchangeBusinessCode } from '@/lib/tiktok/business-oauth';
import { storeBusinessTokens } from '@/lib/tokens';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const authCode = searchParams.get('auth_code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(error)}`, request.url));
  }

  const savedState = request.cookies.get('tiktok_business_state')?.value;
  if (!state || state !== savedState) {
    return NextResponse.json({ error: 'State mismatch — possible CSRF' }, { status: 400 });
  }

  if (!authCode) {
    return NextResponse.json({ error: 'Missing auth_code' }, { status: 400 });
  }

  try {
    const tokenData = await exchangeBusinessCode(authCode);
    if (tokenData.code && tokenData.code !== 0) {
      throw new Error(tokenData.message ?? 'Token exchange failed');
    }
    await storeBusinessTokens(tokenData);

    const response = NextResponse.redirect(new URL('/admin?business_connected=1', request.url));
    response.cookies.delete('tiktok_business_state');
    return response;
  } catch (err) {
    console.error('[business/callback] Error:', err.message);
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(err.message)}`, request.url));
  }
}
