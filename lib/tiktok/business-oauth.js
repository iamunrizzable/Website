const APP_ID = process.env.TIKTOK_BUSINESS_APP_ID;
const SECRET = process.env.TIKTOK_BUSINESS_SECRET;
const REDIRECT_URI = process.env.TIKTOK_BUSINESS_REDIRECT_URI;
const ACCOUNT_REDIRECT_URI = process.env.TIKTOK_ACCOUNT_REDIRECT_URI
  ?? (REDIRECT_URI?.replace('/business/callback', '/account-callback'))
  ?? REDIRECT_URI;

// ── Advertiser token (for automated rules, optimizer rules) ───────────────────

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

// ── TikTok account token (Login Kit — for business content endpoints) ─────────

export function getTikTokAccountAuthUrl(state) {
  const portalUrl = process.env.tiktok_account_authorization_url
    ?? process.env.TIKTOK_ACCOUNT_AUTHORIZATION_URL;
  if (portalUrl) {
    const url = new URL(portalUrl);
    url.searchParams.set('state', state);
    return url.toString();
  }
  // Fallback with full scope set matching the developer portal authorization URL
  const params = new URLSearchParams({
    client_key: APP_ID,
    scope: [
      'user.info.basic',
      'user.info.username',
      'user.info.stats',
      'user.info.profile',
      'user.account.type',
      'user.insights',
      'video.list',
      'video.insights',
      'comment.list',
      'comment.list.manage',
      'video.publish',
      'video.upload',
      'biz.spark.auth',
      'discovery.search.words',
      'biz.brand.insights',
    ].join(','),
    response_type: 'code',
    redirect_uri: ACCOUNT_REDIRECT_URI,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

// Business Portal account token exchange — returns numeric business_id
export async function exchangeBusinessPortalAccountCode(authCode) {
  const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/tt_user/oauth2/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, secret: SECRET, auth_code: authCode }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Business Portal account token exchange failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function exchangeTikTokAccountCode(code) {
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
