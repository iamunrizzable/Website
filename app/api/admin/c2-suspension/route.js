import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { isC2Suspended, setC2Suspended, isRedisConfigured } from '@/lib/tokens';

export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const suspended = await isC2Suspended();
  return NextResponse.json({ suspended, redisConfigured: isRedisConfigured() });
}

export async function POST(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.suspended !== 'boolean') {
    return NextResponse.json({ error: 'Missing suspended (boolean)' }, { status: 400 });
  }
  await setC2Suspended(body.suspended);
  return NextResponse.json({ ok: true, suspended: body.suspended });
}
