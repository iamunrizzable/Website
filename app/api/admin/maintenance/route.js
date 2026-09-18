import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { isSiteInMaintenance, setSiteInMaintenance, isRedisConfigured } from '@/lib/tokens';

export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const maintenance = await isSiteInMaintenance();
  return NextResponse.json({ maintenance, redisConfigured: isRedisConfigured() });
}

export async function POST(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.maintenance !== 'boolean') {
    return NextResponse.json({ error: 'Missing maintenance (boolean)' }, { status: 400 });
  }
  await setSiteInMaintenance(body.maintenance);
  return NextResponse.json({ ok: true, maintenance: body.maintenance });
}
