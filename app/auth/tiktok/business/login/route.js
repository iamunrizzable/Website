import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getBusinessAuthUrl } from '@/lib/tiktok/business-oauth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const url = getBusinessAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set('tiktok_business_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 600,
    path: '/',
  });
  return response;
}
