import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { getBlockedIps, addBlockedIp, removeBlockedIp, isRedisConfigured } from '@/lib/tokens';

// Loose but real IPv4/IPv6 validation — just enough to reject obvious
// typos/garbage before they sit uselessly in the blocklist forever.
const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^[0-9a-fA-F:]+$/;

function isValidIp(ip) {
  if (typeof ip !== 'string') return false;
  if (IPV4_RE.test(ip)) return ip.split('.').every(n => Number(n) <= 255);
  return IPV6_RE.test(ip) && ip.includes(':');
}

export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ips = await getBlockedIps();
  return NextResponse.json({ ips, redisConfigured: isRedisConfigured() });
}

export async function POST(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const ip = body.ip?.trim();
  if (!isValidIp(ip)) return NextResponse.json({ error: 'Invalid IP address' }, { status: 400 });
  await addBlockedIp(ip);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');
  if (!ip) return NextResponse.json({ error: 'Missing ip' }, { status: 400 });
  await removeBlockedIp(ip);
  return NextResponse.json({ ok: true });
}
