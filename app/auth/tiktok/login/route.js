import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAuthorizationUrl } from '@/lib/tiktok/oauth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const url = getAuthorizationUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
