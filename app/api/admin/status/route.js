import { NextResponse } from 'next/server';
import { getTokens, getEvents } from '@/lib/tokens';
import { getUserInfo } from '@/lib/tiktok/api';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tokens = await getTokens();
  const events = await getEvents(20);

  if (!tokens) {
    return NextResponse.json({ connected: false, events });
  }

  const expired = Date.now() > tokens.expires_at;
  const refreshExpired = Date.now() > tokens.refresh_expires_at;

  let userInfo = null;
  if (!expired && !refreshExpired) {
    userInfo = await getUserInfo().catch(() => null);
  }

  return NextResponse.json({
    connected: true,
    expired,
    refresh_expired: refreshExpired,
    open_id: tokens.open_id,
    scope: tokens.scope,
    stored_at: tokens.stored_at,
    expires_at: tokens.expires_at,
    user: userInfo?.data?.user ?? null,
    events,
  });
}
