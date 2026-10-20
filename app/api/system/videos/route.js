import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function getToken(cookieStore) {
  const raw = cookieStore.get('acct_token')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// One call returns a single page (TikTok's default size), so walk the cursor
// like /api/system/sync does. MAX_PAGES bounds the loop for the function timeout.
const PAGE_SIZE = 20;
const MAX_PAGES = 50;

export async function GET() {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });

  const businessId = token.business_id ?? token.open_id;
  const fields = encodeURIComponent(JSON.stringify(['item_id', 'caption', 'create_time', 'thumbnail_url', 'video_views', 'likes', 'comments', 'shares']));
  const videos = [];
  let cursor = 0;
  let first = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await fetch(
      `https://business-api.tiktok.com/open_api/v1.3/business/video/list/?business_id=${encodeURIComponent(businessId)}&fields=${fields}&cursor=${cursor}&page_size=${PAGE_SIZE}`,
      { headers: { 'Access-Token': token.access_token } }
    );
    // Quote 16+ digit integers before parsing so IDs keep every digit.
    const json = JSON.parse((await res.text()).replace(/:\s*(\d{16,})(?=\s*[,}\]])/g, ': "$1"'));
    if (page === 0) first = json;
    if (json.code && json.code !== 0) {
      // Failure on page one is the caller's error to see; later, keep what we have.
      if (page === 0) return NextResponse.json(json);
      break;
    }
    const batch = json.data?.videos ?? [];
    videos.push(...batch);
    if (!json.data?.has_more || batch.length === 0) break;
    cursor = json.data.cursor;
  }
  return NextResponse.json({ ...first, data: { ...first?.data, videos, has_more: false } });
}
