import { NextResponse } from 'next/server';
import { listVideos } from '@/lib/tiktok/business-api';
import { isValidAdminKey as requireAdmin } from '@/lib/auth';

// Walk the cursor so the Videos panel gets every video, not one page.
// MAX_PAGES bounds the loop for the function timeout.
const MAX_PAGES = 50;

export async function GET(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  try {
    // An explicit cursor means the caller is paging by hand: one page only.
    if (searchParams.has('cursor')) {
      return NextResponse.json(await listVideos({
        cursor: Number(searchParams.get('cursor')),
        pageSize: Number(searchParams.get('page_size') ?? 20),
      }));
    }
    const videos = [];
    let cursor = 0;
    let first = null;
    for (let page = 0; page < MAX_PAGES; page++) {
      const json = await listVideos({ cursor, pageSize: 20 });
      if (page === 0) first = json;
      // Open Platform success still carries error: { code: 'ok' }.
      const code = json.error?.code;
      if (code && code !== 'ok' && code !== 'success') {
        if (page === 0) return NextResponse.json(json);
        break;
      }
      const batch = json.data?.videos ?? [];
      videos.push(...batch);
      if (!json.data?.has_more || batch.length === 0) break;
      cursor = json.data.cursor;
    }
    return NextResponse.json({ ...first, data: { ...first?.data, videos, has_more: false } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
