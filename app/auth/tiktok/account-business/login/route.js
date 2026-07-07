import { NextResponse } from 'next/server';
import { getBusinessAuthUrl } from '@/lib/tiktok/business-oauth';
import { generateState } from '@/lib/oauth-state';
import { absoluteUrl } from '@/lib/site-url';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const state = generateState('acct');
    const url = getBusinessAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('[account-business/login] Failed to build TikTok auth URL:', err.message);
    return NextResponse.redirect(absoluteUrl(`/admin?error=${encodeURIComponent(err.message)}`));
  }
}
