import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/tiktok/oauth';
import { storeTokens } from '@/lib/tokens';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Verify CSRF state
  const savedState = request.cookies.get('tiktok_oauth_state')?.value;
  if (!state || state !== savedState) {
    return NextResponse.json({ error: 'State mismatch — possible CSRF' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    const tokenData = await exchangeCodeForTokens(code);
    if (tokenData.error) {
      throw new Error(tokenData.error_description ?? tokenData.error);
    }
    await storeTokens(tokenData);

    const response = NextResponse.redirect(new URL('/admin?connected=1', request.url));
    response.cookies.delete('tiktok_oauth_state');
    return response;
  } catch (err) {
    console.error('[callback] Token exchange error:', err.message);
    return NextResponse.redirect(
      new URL(`/admin?error=${encodeURIComponent(err.message)}`, request.url)
    );
  }
}
