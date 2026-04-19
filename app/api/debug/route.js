import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/tiktok/oauth';

export async function GET() {
  const url = getAuthorizationUrl('test');
  return NextResponse.json({
    redirect_uri: process.env.TIKTOK_REDIRECT_URI,
    client_key: process.env.TIKTOK_CLIENT_KEY,
    full_oauth_url: url,
  });
}
