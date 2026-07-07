import { NextResponse } from 'next/server';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

// Turn a TikTok short link into a request URL built from a constant literal
// prefix plus a strictly [A-Za-z0-9] share code. Because the host lives in a
// string literal and the only variable can't contain '/', ':' or '@', the
// outgoing request can never be redirected to another host (SSRF-safe, and
// recognized as sanitized by CodeQL's request-forgery query).
function shareRequestUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.toLowerCase();

  if (host === 'tiktok.com' || host === 'www.tiktok.com' || host === 'm.tiktok.com') {
    const m = u.pathname.match(/^\/t\/([A-Za-z0-9]+)\/?$/);
    return m ? `https://www.tiktok.com/t/${m[1]}` : null;
  }
  if (host === 'vm.tiktok.com') {
    const m = u.pathname.match(/^\/([A-Za-z0-9]+)\/?$/);
    return m ? `https://vm.tiktok.com/${m[1]}` : null;
  }
  if (host === 'vt.tiktok.com') {
    const m = u.pathname.match(/^\/([A-Za-z0-9]+)\/?$/);
    return m ? `https://vt.tiktok.com/${m[1]}` : null;
  }
  return null;
}

const MAX_REDIRECTS = 5;

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  let target = shareRequestUrl(url);
  if (!target) {
    return NextResponse.json({ error: 'Only TikTok share links (tiktok.com/t/…) can be resolved' }, { status: 400 });
  }

  try {
    // Follow redirects manually. Every fetched URL is rebuilt from a literal
    // prefix by shareRequestUrl; the redirect Location is only string-parsed
    // (for the video/photo ID or the next share code), never fetched directly.
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const res = await fetch(target, {
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TJBBot/1.0)' },
      });
      const location = res.headers.get('location');
      if (!location) {
        return NextResponse.json({ error: 'Link did not resolve to a TikTok post' }, { status: 422 });
      }

      const idMatch = location.match(/\/(?:video|photo)\/(\d+)/);
      if (idMatch) {
        return NextResponse.json({ video_id: idMatch[1], resolved_url: location });
      }

      // Not a post yet — expect another TikTok short link to follow
      const next = shareRequestUrl(location);
      if (!next) {
        return NextResponse.json({ error: 'Link redirected off TikTok — refusing to follow' }, { status: 422 });
      }
      target = next;
    }
    return NextResponse.json({ error: 'Too many redirects' }, { status: 422 });
  } catch (err) {
    return NextResponse.json({ error: `Failed to resolve URL: ${err.message}` }, { status: 502 });
  }
}
