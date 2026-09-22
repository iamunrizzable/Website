import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { checkDeviceAgainstBlocklist, deleteVisitorHistory } from '@/lib/tokens';

// TEMPORARY: confirms Canada is allowed on real production after the
// ALLOWED_COUNTRIES change, using the real deployed checkDeviceAgainstBlocklist.
// Cleans up the visitor-history entry it creates. Meant to be deleted
// right after confirming.
export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const marker = `testcanada${Date.now().toString(36)}`;
  const result = await checkDeviceAgainstBlocklist({
    persistentMarker: marker, ip: '99.224.1.1', country: 'CA', userAgent: 'test-canada',
  });
  await deleteVisitorHistory(marker);

  return NextResponse.json({ verdict: result.verdict, reason: result.blockReason ?? null });
}
