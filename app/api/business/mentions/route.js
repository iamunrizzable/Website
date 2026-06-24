import { NextResponse } from 'next/server';
import {
  listMentionVideos,
  listMentionComments,
  listTopMentionWords,
  listTopMentionHashtags,
  listTrackedHashtags,
  addTrackedHashtag,
  removeTrackedHashtag,
} from '@/lib/tiktok/business-api';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'videos';
  try {
    if (type === 'comments') return NextResponse.json(await listMentionComments());
    if (type === 'top_words') return NextResponse.json(await listTopMentionWords());
    if (type === 'top_hashtags') return NextResponse.json(await listTopMentionHashtags());
    if (type === 'tracked_hashtags') return NextResponse.json(await listTrackedHashtags());
    return NextResponse.json(await listMentionVideos());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    if (body.action === 'add_hashtag') return NextResponse.json(await addTrackedHashtag({ hashtag: body.hashtag }));
    if (body.action === 'remove_hashtag') return NextResponse.json(await removeTrackedHashtag({ hashtag: body.hashtag }));
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
