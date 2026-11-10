import { NextResponse } from 'next/server';
import {
  getVideoSettings,
  getPublishStatus,
  searchPublishLocations,
  publishVideo,
  publishPhoto,
  getPostAuthorization,
  authorizePost,
  deletePostAuthorization,
  setPostPromotable,
} from '@/lib/tiktok/business-api';
import { isValidAdminKey as requireAdmin } from '@/lib/auth';

export async function GET(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'settings';
  try {
    if (type === 'status') {
      const publishId = searchParams.get('publish_id') ?? '';
      if (!publishId) return NextResponse.json({ error: 'publish_id is required' }, { status: 400 });
      return NextResponse.json(await getPublishStatus({ publishId }));
    }
    if (type === 'locations') {
      const keyword = searchParams.get('keyword') ?? '';
      if (!keyword) return NextResponse.json({ error: 'keyword is required' }, { status: 400 });
      return NextResponse.json(await searchPublishLocations({ keyword }));
    }
    if (type === 'authorize_status') {
      const itemId = searchParams.get('item_id') ?? '';
      if (!itemId) return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
      return NextResponse.json(await getPostAuthorization({ itemId }));
    }
    return NextResponse.json(await getVideoSettings());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    if (body.action === 'video') {
      return NextResponse.json(await publishVideo({
        videoUrl: body.video_url,
        caption: body.caption ?? '',
        disableComment: !!body.disable_comment,
        disableDuet: !!body.disable_duet,
        disableStitch: !!body.disable_stitch,
        uploadToDraft: !!body.upload_to_draft,
        isAiGenerated: !!body.is_ai_generated,
        locationId: body.location_id,
        locationName: body.location_name,
      }));
    }
    if (body.action === 'photo') {
      return NextResponse.json(await publishPhoto({
        photoUrls: body.photo_urls,
        caption: body.caption ?? '',
        title: body.title ?? '',
        privacyLevel: body.privacy_level,
        disableComment: !!body.disable_comment,
        autoAddMusic: body.auto_add_music !== false,
        coverIndex: Number.isInteger(body.cover_index) ? body.cover_index : 0,
      }));
    }
    if (body.action === 'authorize') {
      return NextResponse.json(await authorizePost({ itemId: body.item_id, authorizationDays: body.authorization_days }));
    }
    if (body.action === 'delete_authorization') {
      return NextResponse.json(await deletePostAuthorization({ itemId: body.item_id }));
    }
    if (body.action === 'promotable') {
      return NextResponse.json(await setPostPromotable({ itemId: body.item_id, promotable: !!body.promotable }));
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
