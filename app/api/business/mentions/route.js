import { NextResponse } from 'next/server';
import {
  listMentionVideos,
  listMentionComments,
  listTopMentionWords,
  listTopMentionHashtags,
  listTrackedHashtags,
  addTrackedHashtag,
  removeTrackedHashtag,
  verifyHashtag,
} from '@/lib/tiktok/business-api';

import { isValidAdminKey as requireAdmin } from '@/lib/auth';

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'videos';
  const username = searchParams.get('username') ?? '';
  try {
    if (type === 'comments') return NextResponse.json(await listMentionComments());
    if (type === 'top_words') return NextResponse.json(await listTopMentionWords());
    if (type === 'top_hashtags') return NextResponse.json(await listTopMentionHashtags());
    if (type === 'tracked_hashtags') {
      if (!username) return NextResponse.json({ error: 'A TikTok username is required' }, { status: 400 });
      return NextResponse.json(await listTrackedHashtags({ username }));
    }
    if (type === 'verify_hashtag') {
      if (!username) return NextResponse.json({ error: 'A TikTok username is required' }, { status: 400 });
      return NextResponse.json(await verifyHashtag({ username }));
    }
    return NextResponse.json(await listMentionVideos());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    if (body.action === 'add_hashtag') {
      if (!body.username) return NextResponse.json({ error: 'A TikTok username is required' }, { status: 400 });
      return NextResponse.json(await addTrackedHashtag({ hashtag: body.hashtag, username: body.username }));
    }
    if (body.action === 'remove_hashtag') {
      if (!body.username) return NextResponse.json({ error: 'A TikTok username is required' }, { status: 400 });
      return NextResponse.json(await removeTrackedHashtag({ hashtag: body.hashtag, username: body.username }));
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
