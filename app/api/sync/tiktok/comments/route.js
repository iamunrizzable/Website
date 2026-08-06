import { NextResponse } from 'next/server';
import { getVideoList } from '@/lib/tiktok/api';
import { isValidAdminKey } from '@/lib/auth';

export async function POST(request) {
  if (!isValidAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await getVideoList(0, 20);
    if (res.error?.code && res.error.code !== 'ok') {
      return NextResponse.json({ error: res.error.message ?? 'TikTok API error' }, { status: 500 });
    }
    const videos = res.data?.videos ?? [];
    return NextResponse.json({ synced: videos.length, results: videos });
  } catch (err) {
    if (err.message === 'NOT_AUTHENTICATED') {
      return NextResponse.json({ error: 'Not authenticated with TikTok' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
