import { NextResponse } from 'next/server';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  try {
    // Follow redirects server-side to get the final URL
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TJBBot/1.0)' },
    });
    const finalUrl = res.url;
    const match = finalUrl.match(/\/video\/(\d+)/);
    if (!match) {
      return NextResponse.json({ error: `Could not extract video ID from resolved URL: ${finalUrl}` }, { status: 422 });
    }
    return NextResponse.json({ video_id: match[1], resolved_url: finalUrl });
  } catch (err) {
    return NextResponse.json({ error: `Failed to resolve URL: ${err.message}` }, { status: 502 });
  }
}
