import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/tiktok/oauth';
import { storeTokens } from '@/lib/tokens';
import { absoluteUrl } from '@/lib/site-url';

const ALLOWED_PATHS = ['/admin'];

function safeRedirect(path) {
  const ok = ALLOWED_PATHS.find(p => path === p || path.startsWith(p + '?'));
  return NextResponse.redirect(absoluteUrl(ok ? path : '/admin'));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return safeRedirect(`/admin?error=${encodeURIComponent(error)}`);
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

    const response = safeRedirect('/admin?connected=1');
    response.cookies.delete('tiktok_oauth_state');
    return response;
  } catch (err) {
    console.error('[callback] Token exchange error:', err.message);
    return safeRedirect(`/admin?error=${encodeURIComponent(err.message)}`);
  }
}
