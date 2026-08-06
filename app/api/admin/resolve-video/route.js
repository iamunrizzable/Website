import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';

// Extract the [A-Za-z0-9] share code from a TikTok short link. Returns null
// for anything that isn't a recognized tiktok.com short-link shape.
function shareCode(raw) {
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
    return m ? { host: 'www.tiktok.com', path: 't/', code: m[1] } : null;
  }
  if (host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
    const m = u.pathname.match(/^\/([A-Za-z0-9]+)\/?$/);
    return m ? { host, path: '', code: m[1] } : null;
  }
  return null;
}

export async function GET(request) {
  if (!isValidAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  const parsed = shareCode(url);
  // Re-assert the code charset so it cannot contain '/', ':' or '@' — the
  // request URL below is a string literal plus this constrained token, so
  // it can never be pointed at a host other than the ones hardcoded here.
  if (!parsed || !/^[A-Za-z0-9]+$/.test(parsed.code)) {
    return NextResponse.json({ error: 'Only TikTok share links (tiktok.com/t/…) can be resolved' }, { status: 400 });
  }

  let target;
  if (parsed.host === 'www.tiktok.com') {
    target = `https://www.tiktok.com/t/${parsed.code}`;
  } else if (parsed.host === 'vm.tiktok.com') {
    target = `https://vm.tiktok.com/${parsed.code}`;
  } else {
    target = `https://vt.tiktok.com/${parsed.code}`;
  }

  try {
    // One request to the constant-host URL above. The redirect target is read
    // from the Location header as a string and parsed for the post ID — it is
    // never fetched, so no user- or response-derived value reaches a request.
    const res = await fetch(target, {
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TJBBot/1.0)' },
    });
    const location = res.headers.get('location');
    if (!location) {
      return NextResponse.json({ error: 'Link did not resolve to a TikTok post' }, { status: 422 });
    }
    const idMatch = location.match(/\/(?:video|photo)\/(\d+)/);
    if (!idMatch) {
      return NextResponse.json({ error: 'Could not find a video or photo ID. Paste the full post link instead.' }, { status: 422 });
    }
    return NextResponse.json({ video_id: idMatch[1], resolved_url: location });
  } catch (err) {
    return NextResponse.json({ error: `Failed to resolve URL: ${err.message}` }, { status: 502 });
  }
}
