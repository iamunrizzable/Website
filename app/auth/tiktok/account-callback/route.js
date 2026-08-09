import { NextResponse } from 'next/server';
import { exchangeBusinessPortalAccountCode, exchangeTikTokAccountCode } from '@/lib/tiktok/business-oauth';
import { storeTikTokAccountToken } from '@/lib/tokens';
import { verifyState, getStateType } from '@/lib/oauth-state';
import { absoluteUrl } from '@/lib/site-url';

const ALLOWED_PATHS = ['/admin/internal/hallie/tiktok-moderation/system', '/hallie/tiktok-moderation/system'];

function safeRedirect(path) {
  const ok = ALLOWED_PATHS.find(p => path === p || path.startsWith(p + '?'));
  return NextResponse.redirect(absoluteUrl(ok ? path : '/admin/internal/hallie/tiktok-moderation/system'));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const authCode = searchParams.get('auth_code'); // Business Portal flow → numeric business_id
  const code = searchParams.get('code');           // Login Kit fallback → open_id only
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const isSystem = getStateType(state) === 'system';
  const errorDest = isSystem ? '/hallie/tiktok-moderation/system' : '/admin/internal/hallie/tiktok-moderation/system';

  if (error) {
    return safeRedirect(`${errorDest}?error=${encodeURIComponent(error)}`);
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

    // For system flow: store cookie only (not shared Redis) to preserve per-user isolation
    let stored;
    if (isSystem) {
      const inner = tokenData.data ?? tokenData;
      const expiresIn = inner.expires_in ?? 86400;
      stored = {
        access_token: inner.access_token,
        refresh_token: inner.refresh_token ?? null,
        open_id: inner.open_id ?? null,
        business_id: tokenData.business_id ?? inner.business_id ?? inner.open_id ?? null,
        scope: inner.scope ?? null,
        expires_at: Date.now() + expiresIn * 1000,
        stored_at: Date.now(),
      };
    } else {
      stored = await storeTikTokAccountToken(tokenData);
    }

    // For Login Kit flow only: try /business/get/ to get numeric business_id
    if (!authCode) {
      try {
        const bizRes = await fetch(
          `https://business-api.tiktok.com/open_api/v1.3/business/get/?business_id=${encodeURIComponent(stored.business_id)}&fields=business_id`,
          { headers: { 'Access-Token': stored.access_token, 'Content-Type': 'application/json' } }
        );
        const bizJson = await bizRes.json();
        if (bizJson.code === 0 && bizJson.data?.business_id) {
          stored.business_id = bizJson.data.business_id;
          if (!isSystem) stored = await storeTikTokAccountToken({ ...tokenData, business_id: bizJson.data.business_id });
        }
      } catch (e) {
        console.error('[account-callback] business/get failed:', e.message);
      }
    }

    const dest = isSystem ? '/hallie/tiktok-moderation/system?connected=1' : '/admin/internal/hallie/tiktok-moderation/system?account_connected=1';
    const response = safeRedirect(dest);
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
    return safeRedirect(`${errorDest}?error=${encodeURIComponent(err.message)}`);
  }
}
