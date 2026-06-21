import { NextResponse } from 'next/server';
import { getTokens, getEvents, getBusinessTokens } from '@/lib/tokens';
import { getUserInfo } from '@/lib/tiktok/api';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [tokens, events, businessTokens] = await Promise.all([
    getTokens(),
    getEvents(20),
    getBusinessTokens(),
  ]);

  let userInfo = null;
  if (tokens && Date.now() <= tokens.expires_at && Date.now() <= tokens.refresh_expires_at) {
    userInfo = await getUserInfo().catch(() => null);
  }

  return NextResponse.json({
    connected: !!tokens,
    expired: tokens ? Date.now() > tokens.expires_at : false,
    refresh_expired: tokens ? Date.now() > tokens.refresh_expires_at : false,
    open_id: tokens?.open_id ?? null,
    scope: tokens?.scope ?? null,
    stored_at: tokens?.stored_at ?? null,
    expires_at: tokens?.expires_at ?? null,
    user: userInfo?.data?.user ?? null,
    events,
    business_connected: !!businessTokens,
    business_stored_at: businessTokens?.stored_at ?? null,
    business_advertiser_id: businessTokens?.advertiser_id ?? null,
  });
}
