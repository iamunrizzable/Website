import { NextResponse } from 'next/server';
import { getEvents, getBusinessTokens, isRedisConfigured } from '@/lib/tokens';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [events, businessTokens] = await Promise.all([
    getEvents(20),
    getBusinessTokens(),
  ]);

  return NextResponse.json({
    business_connected: !!businessTokens,
    business_stored_at: businessTokens?.stored_at ?? null,
    business_expires_at: businessTokens?.expires_at ?? null,
    business_advertiser_id: businessTokens?.advertiser_id ?? null,
    redis_configured: isRedisConfigured(),
    events,
  });
}
