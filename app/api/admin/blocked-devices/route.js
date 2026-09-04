import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { getBlockedVisitorIds, addBlockedVisitorId, removeBlockedVisitorId, isRedisConfigured } from '@/lib/tokens';

// Loose validation matching Fingerprint's visitor_id shape (alphanumeric,
// no separators) — just enough to reject obvious typos/garbage.
const VISITOR_ID_RE = /^[A-Za-z0-9]{10,64}$/;

export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const visitorIds = await getBlockedVisitorIds();
  return NextResponse.json({ visitorIds, redisConfigured: isRedisConfigured() });
}

export async function POST(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const visitorId = body.visitorId?.trim();
  if (!visitorId || !VISITOR_ID_RE.test(visitorId)) {
    return NextResponse.json({ error: 'Invalid visitor ID' }, { status: 400 });
  }
  await addBlockedVisitorId(visitorId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const visitorId = searchParams.get('visitorId');
  if (!visitorId) return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
  await removeBlockedVisitorId(visitorId);
  return NextResponse.json({ ok: true });
}
