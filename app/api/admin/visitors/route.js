import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { getAllVisitorHistory, deleteVisitorHistory, isRedisConfigured } from '@/lib/tokens';

// Every visitor the site has fingerprinted (site:visitor_history, written
// on every /api/fingerprint/check call — see lib/tokens.js's
// recordVisitorHistory), not just banned devices or near-misses. Backs
// /admin/visitor/list.
export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const visitors = await getAllVisitorHistory();
  return NextResponse.json({ visitors, redisConfigured: isRedisConfigured() });
}

// Manual per-log delete ("a manual button to delete single logs"). Takes
// either ?id= (the row's actual dedup key, persistentMarker or visitorId —
// what the page already has) or the two underlying fields directly; either
// form resolves to the same lookup deleteVisitorHistory itself does.
export async function DELETE(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await deleteVisitorHistory(id, id);
  return NextResponse.json({ ok: true });
}
