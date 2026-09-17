import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import {
  getBlockedDevices, addBlockedDevice, removeBlockedDevice,
  getNearMisses, promoteNearMiss, removeNearMiss, isRedisConfigured,
} from '@/lib/tokens';

// Loose validation for the manual-entry path (an admin pasting a raw
// visitorId they got some other way, e.g. from a support email) — matches
// our own fingerprint hash shape (64-char lowercase hex, see
// lib/fingerprint/collect.js) but kept a little looser to also accept
// shorter/legacy-style ids without rejecting them outright.
const VISITOR_ID_RE = /^[A-Za-z0-9]{10,64}$/;

export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [devices, nearMisses] = await Promise.all([getBlockedDevices(), getNearMisses()]);
  return NextResponse.json({ devices, nearMisses, redisConfigured: isRedisConfigured() });
}

export async function POST(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));

  // Promote an existing near-miss (a visit that scored close to a banned
  // profile but wasn't auto-blocked) into a full ban.
  if (body.promoteNearMissId) {
    const banId = await promoteNearMiss(body.promoteNearMissId);
    if (!banId) return NextResponse.json({ error: 'Near-miss not found' }, { status: 404 });
    return NextResponse.json({ ok: true, banId });
  }

  // Manual entry: an admin pasting a raw visitorId with no captured
  // components. Exact-match fast path still works against this; similarity
  // matching won't (no components to compare), which is an inherent
  // limitation of a manually-typed ID rather than a captured visit.
  const visitorId = body.visitorId?.trim();
  if (!visitorId || !VISITOR_ID_RE.test(visitorId)) {
    return NextResponse.json({ error: 'Invalid visitor ID' }, { status: 400 });
  }
  const banId = await addBlockedDevice({ visitorId, components: null, note: 'Manually entered' });
  return NextResponse.json({ ok: true, banId });
}

export async function DELETE(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const banId = searchParams.get('banId');
  const nearMissId = searchParams.get('nearMissId');

  if (banId) {
    await removeBlockedDevice(banId);
    return NextResponse.json({ ok: true });
  }
  if (nearMissId) {
    await removeNearMiss(nearMissId);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Missing banId or nearMissId' }, { status: 400 });
}
