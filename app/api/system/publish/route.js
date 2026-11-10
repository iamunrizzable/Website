import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';

function getToken(cookieStore) {
  const raw = cookieStore.get('acct_token')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function GET(request) {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });
  const businessId = token.business_id ?? token.open_id;
  const headers = { 'Access-Token': token.access_token };
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'settings';
  let url;
  if (type === 'status') {
    const publishId = searchParams.get('publish_id') ?? '';
    if (!publishId) return NextResponse.json({ error: 'publish_id is required' }, { status: 400 });
    url = `${BASE}/business/publish/status/?business_id=${encodeURIComponent(businessId)}&publish_id=${encodeURIComponent(publishId)}`;
  } else if (type === 'locations') {
    const keyword = searchParams.get('keyword') ?? '';
    if (!keyword) return NextResponse.json({ error: 'keyword is required' }, { status: 400 });
    url = `${BASE}/business/publish/location/?business_id=${encodeURIComponent(businessId)}&keyword=${encodeURIComponent(keyword)}`;
  } else if (type === 'authorize_status') {
    const itemId = searchParams.get('item_id') ?? '';
    if (!itemId) return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
    url = `${BASE}/business/post/authorize/status/?business_id=${encodeURIComponent(businessId)}&item_id=${encodeURIComponent(itemId)}`;
  } else {
    url = `${BASE}/business/video/settings/?business_id=${encodeURIComponent(businessId)}`;
  }
  const res = await fetch(url, { headers });
  return NextResponse.json(await res.json());
}

export async function POST(request) {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });
  const businessId = token.business_id ?? token.open_id;
  const headers = { 'Access-Token': token.access_token, 'Content-Type': 'application/json' };
  const body = await request.json();
  let endpoint;
  let payload;
  if (body.action === 'video') {
    endpoint = `${BASE}/business/video/publish/`;
    const postInfo = {
      caption: body.caption ?? '',
      disable_comment: !!body.disable_comment,
      disable_duet: !!body.disable_duet,
      disable_stitch: !!body.disable_stitch,
      upload_to_draft: !!body.upload_to_draft,
      is_ai_generated: !!body.is_ai_generated,
    };
    if (body.location_id && body.location_name) {
      postInfo.location_id = body.location_id;
      postInfo.location_name = body.location_name;
    }
    payload = { business_id: businessId, video_url: body.video_url, post_info: postInfo };
  } else if (body.action === 'photo') {
    endpoint = `${BASE}/business/photo/publish/`;
    payload = {
      business_id: businessId,
      photo_images: body.photo_urls,
      photo_cover_index: Number.isInteger(body.cover_index) ? body.cover_index : 0,
      post_info: {
        title: body.title ?? '',
        caption: body.caption ?? '',
        privacy_level: body.privacy_level,
        disable_comment: !!body.disable_comment,
        auto_add_music: body.auto_add_music !== false,
      },
    };
  } else if (body.action === 'authorize') {
    endpoint = `${BASE}/business/post/authorize/`;
    payload = { business_id: businessId, item_id: body.item_id, authorization_days: body.authorization_days };
  } else if (body.action === 'delete_authorization') {
    endpoint = `${BASE}/business/post/authorize/delete/`;
    payload = { business_id: businessId, item_id: body.item_id };
  } else if (body.action === 'promotable') {
    endpoint = `${BASE}/business/post/authorize/setting/`;
    payload = { business_id: businessId, item_id: body.item_id, is_ad_promotable: !!body.promotable };
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
  return NextResponse.json(await res.json());
}
