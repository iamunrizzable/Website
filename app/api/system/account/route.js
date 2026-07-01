import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function getToken(cookieStore) {
  const raw = cookieStore.get('acct_token')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });

  const businessId = token.business_id ?? token.open_id;
  const fields = encodeURIComponent(JSON.stringify(['display_name', 'profile_image', 'follower_count', 'likes_count', 'video_count']));
  const res = await fetch(
    `https://business-api.tiktok.com/open_api/v1.3/business/get/?business_id=${encodeURIComponent(businessId)}&fields=${fields}`,
    { headers: { 'Access-Token': token.access_token } }
  );
  const json = await res.json();
  return NextResponse.json(json);
}
