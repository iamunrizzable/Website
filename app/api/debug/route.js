import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/tiktok/oauth';

export async function GET(request) {
  const adminKey = new URL(request.url).searchParams.get('key');
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = getAuthorizationUrl('test');
  return NextResponse.json({
    redirect_uri: process.env.TIKTOK_REDIRECT_URI,
    client_key: process.env.TIKTOK_CLIENT_KEY,
    full_oauth_url: url,
  });
}
