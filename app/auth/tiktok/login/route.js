import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAuthorizationUrl } from '@/lib/tiktok/oauth';
import { isValidAdminKey } from '@/lib/auth';

export async function GET(request) {
  if (!isValidAdminKey(request)) {
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
