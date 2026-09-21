import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import {
  getBlockedDevices, addBlockedDevice, removeBlockedDevice, isRedisConfigured, getVisitorHistory,
} from '@/lib/tokens';

// Loose validation for the manual-entry path (an admin pasting a raw device
// marker they got some other way, e.g. from a support email) — matches the
// shape persistentMarker is actually generated in (16-char lowercase hex,
// see lib/fingerprint/persistentMarker.js) but kept a little looser to also
// accept other lengths without rejecting them outright.
const DEVICE_MARKER_RE = /^[A-Za-z0-9]{10,64}$/;

// Attaches each entry's Visitor History (first-seen/last-seen/visit count,
// lib/tokens.js's recordVisitorHistory/getVisitorHistory — tracked for
// every check, not just banned ones) by persistentMarker, without
// duplicating that data into the blocklist storage itself. This is an
// admin-only, infrequently-loaded endpoint, so the extra per-entry lookup
// is a reasonable cost here even though the same pattern would be wrong
// on the hot /api/fingerprint/check path.
async function attachHistory(entries) {
  return Promise.all(entries.map(async (entry) => ({
    ...entry,
    history: entry.persistentMarker ? await getVisitorHistory(entry.persistentMarker) : null,
  })));
}

export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rawDevices = await getBlockedDevices();
  const devices = await attachHistory(rawDevices);
  return NextResponse.json({ devices, redisConfigured: isRedisConfigured() });
}

export async function POST(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));

  // Manual entry: an admin pasting a raw device marker (from
  // /admin/security, e.g. via ?fpdebug=1) or the /admin/visitor/list "Ban"
  // button sending a row's own persistentMarker. Exact-match is the only
  // way this site matches devices now — see lib/tokens.js's
  // checkDeviceAgainstBlocklist.
  const persistentMarker = body.persistentMarker?.trim();
  if (!persistentMarker || !DEVICE_MARKER_RE.test(persistentMarker)) {
    return NextResponse.json({ error: 'Invalid device marker' }, { status: 400 });
  }
  const banId = await addBlockedDevice({ persistentMarker, note: 'Manually entered' });
  return NextResponse.json({ ok: true, banId });
}

export async function DELETE(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const banId = searchParams.get('banId');
  if (!banId) return NextResponse.json({ error: 'Missing banId' }, { status: 400 });
  await removeBlockedDevice(banId);
  return NextResponse.json({ ok: true });
}
