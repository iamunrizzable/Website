const APP_ID = process.env.TIKTOK_BUSINESS_APP_ID;
const SECRET = process.env.TIKTOK_BUSINESS_SECRET;
const REDIRECT_URI = process.env.TIKTOK_BUSINESS_REDIRECT_URI;
const ACCOUNT_REDIRECT_URI = process.env.TIKTOK_ACCOUNT_REDIRECT_URI
  ?? (REDIRECT_URI?.replace('/business/callback', '/account-callback'))
  ?? REDIRECT_URI;

// ── Advertiser token (for comment management, automated rules) ─────────────────

export function getBusinessAuthUrl(state) {
  const portalUrl = process.env.tiktok_advertiser_authorization_url;
  if (portalUrl) {
    const url = new URL(portalUrl);
    url.searchParams.set('state', state);
    return url.toString();
  }
  const params = new URLSearchParams({ app_id: APP_ID, state, redirect_uri: REDIRECT_URI });
  return `https://business-api.tiktok.com/portal/auth?${params}`;
}

export async function exchangeBusinessCode(authCode) {
  const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, secret: SECRET, auth_code: authCode }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Business token exchange failed (${res.status}): ${text}`);
  }
  return res.json();
}

// ── TikTok account token (for /business/get/, /business/video/list/, etc.) ────

export function getTikTokAccountAuthUrl(state) {
  const portalUrl = process.env.tiktok_account_authorization_url;
  if (portalUrl) {
    const url = new URL(portalUrl);
    url.searchParams.set('state', state);
    return url.toString();
  }
  // Fallback: construct the standard TikTok Login Kit URL (same flow, same scopes
  // as shown in the developer portal under "TikTok account holder authorization URL")
  const ACCOUNT_SCOPES = [
    'user.info.basic', 'user.info.profile', 'user.account.type', 'user.insights',
    'video.list', 'video.insights', 'comment.list', 'comment.list.manage',
    'video.publish', 'video.upload', 'biz.spark_auth', 'discovery.search.words',
    'biz.brand_insights',
  ].join(',');
  const params = new URLSearchParams({
    client_key: APP_ID,
    scope: ACCOUNT_SCOPES,
    response_type: 'code',
    redirect_uri: ACCOUNT_REDIRECT_URI,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

export async function exchangeTikTokAccountCode(code) {
  // Account holder flow uses www.tiktok.com/v2/auth/authorize (Login Kit),
  // so the token exchange is the standard Open Platform endpoint (form-encoded).
  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: APP_ID,
      client_secret: SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: ACCOUNT_REDIRECT_URI,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Account token exchange failed (${res.status}): ${text}`);
  }
  return res.json();
}
