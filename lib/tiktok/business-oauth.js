const APP_ID = process.env.TIKTOK_BUSINESS_APP_ID;
const SECRET = process.env.TIKTOK_BUSINESS_SECRET;
const REDIRECT_URI = process.env.TIKTOK_BUSINESS_REDIRECT_URI;
const ACCOUNT_REDIRECT_URI = process.env.TIKTOK_ACCOUNT_REDIRECT_URI ?? REDIRECT_URI;

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
  const params = new URLSearchParams({ app_id: APP_ID, state, redirect_uri: ACCOUNT_REDIRECT_URI });
  return `https://business-api.tiktok.com/portal/auth/tt_user/?${params}`;
}

export async function exchangeTikTokAccountCode(authCode) {
  const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/tt_user/oauth2/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, secret: SECRET, auth_code: authCode }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Account token exchange failed (${res.status}): ${text}`);
  }
  return res.json();
}
