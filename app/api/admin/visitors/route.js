import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { getAllVisitorHistory, isRedisConfigured } from '@/lib/tokens';

// Every visitor the site has fingerprinted (site:visitor_history, written
// on every /api/fingerprint/check call — see lib/tokens.js's
// recordVisitorHistory), not just banned devices or near-misses. Backs
// /admin/visitor/list.
export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const visitors = await getAllVisitorHistory();
  return NextResponse.json({ visitors, redisConfigured: isRedisConfigured() });
}
