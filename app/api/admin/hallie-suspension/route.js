import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { isHallieSuspended, setHallieSuspended, isRedisConfigured } from '@/lib/tokens';

export async function GET(request) {
  if (!(await isValidAdminKey(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const suspended = await isHallieSuspended();
  return NextResponse.json({ suspended, redisConfigured: isRedisConfigured() });
}

export async function POST(request) {
  if (!(await isValidAdminKey(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.suspended !== 'boolean') {
    return NextResponse.json({ error: 'Missing suspended (boolean)' }, { status: 400 });
  }
  await setHallieSuspended(body.suspended);
  return NextResponse.json({ ok: true, suspended: body.suspended });
}
