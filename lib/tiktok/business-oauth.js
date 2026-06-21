const APP_ID = process.env.TIKTOK_BUSINESS_APP_ID;
const SECRET = process.env.TIKTOK_BUSINESS_SECRET;
const REDIRECT_URI = process.env.TIKTOK_BUSINESS_REDIRECT_URI;

export function getBusinessAuthUrl(state) {
  const params = new URLSearchParams({
    app_id: APP_ID,
    state,
    redirect_uri: REDIRECT_URI,
  });
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
