import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { getBlockedDevices, removeBlockedDevice } from '@/lib/tokens';
import { isPrivateRelayIp } from '@/lib/reputation/ipLists';

// One-time cleanup tool for bans created before the Private Relay
// exemption shipped (see lib/tokens.js's checkDeviceAgainstBlocklist) —
// a visitor using iCloud+ Private Relay could get auto-banned with
// reasonCode 'vpn' or 'datacenter' before that fix existed, since
// Private Relay egress ranges legitimately overlap the X4BNet feeds.
// This only ever re-checks bans with those two reasonCodes specifically
// — a 'non-us', 'tor', or 'manual' ban is never touched, since those
// have nothing to do with the bug being cleaned up here.
async function findFalsePositives() {
  const devices = await getBlockedDevices();
  const candidates = devices.filter((d) => d.reasonCode === 'vpn' || d.reasonCode === 'datacenter');
  const checked = await Promise.all(candidates.map(async (d) => ({
    ...d,
    isPrivateRelay: d.ip ? await isPrivateRelayIp(d.ip) : false,
  })));
  return checked.filter((d) => d.isPrivateRelay);
}

// GET: dry run — lists what would be cleared, without deleting anything.
export async function GET(request) {
  if (!(await isValidAdminKey(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const falsePositives = await findFalsePositives();
  return NextResponse.json({
    count: falsePositives.length,
    devices: falsePositives.map((d) => ({
      id: d.id, ip: d.ip, reasonCode: d.reasonCode, country: d.country, bannedAt: d.bannedAt,
    })),
  });
}

// POST: actually removes every matched ban.
export async function POST(request) {
  if (!(await isValidAdminKey(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const falsePositives = await findFalsePositives();
  await Promise.all(falsePositives.map((d) => removeBlockedDevice(d.id)));
  return NextResponse.json({
    cleared: falsePositives.length,
    ids: falsePositives.map((d) => d.id),
  });
}
