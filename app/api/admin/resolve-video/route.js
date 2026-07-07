import { NextResponse } from 'next/server';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

// This endpoint exists only to resolve TikTok share links (tiktok.com/t/…),
// so outgoing requests are restricted to https URLs on tiktok.com hosts.
// Anything else is refused before any request is made (SSRF guard).
const ALLOWED_HOST = /^(?:[a-z0-9-]+\.)*tiktok\.com$/i;

function parseAllowedUrl(raw, base) {
  let parsed;
  try {
    parsed = base ? new URL(raw, base) : new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') return null;
  if (!ALLOWED_HOST.test(parsed.hostname)) return null;
  return parsed;
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

  let current = parseAllowedUrl(url);
  if (!current) {
    return NextResponse.json({ error: 'Only https tiktok.com links can be resolved' }, { status: 400 });
  }

  try {
    // Follow redirects manually so every hop stays on an allowed host
    let finalUrl = null;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const res = await fetch(current, {
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TJBBot/1.0)' },
      });
      const location = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && location) {
        const next = parseAllowedUrl(location, current);
        if (!next) {
          return NextResponse.json({ error: 'Link redirected off tiktok.com — refusing to follow' }, { status: 422 });
        }
        current = next;
        continue;
      }
      finalUrl = current.toString();
      break;
    }
    if (!finalUrl) {
      return NextResponse.json({ error: 'Too many redirects' }, { status: 422 });
    }

    const match = finalUrl.match(/\/(?:video|photo)\/(\d+)/);
    if (!match) {
      return NextResponse.json({ error: `Could not extract video ID from resolved URL: ${finalUrl}` }, { status: 422 });
    }
    return NextResponse.json({ video_id: match[1], resolved_url: finalUrl });
  } catch (err) {
    return NextResponse.json({ error: `Failed to resolve URL: ${err.message}` }, { status: 502 });
  }
}
