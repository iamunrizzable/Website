import { NextResponse } from 'next/server';
import { refreshTorList, refreshVpnLists } from '@/lib/reputation/ipLists';
import { isValidCronSecret } from '@/lib/auth';

export const maxDuration = 30;

// GET /api/cron/sync-reputation — runs daily (Vercel's Hobby plan caps
// cron jobs at once per day; hourly would be better and is worth revisiting
// on Pro — see lib/reputation/ipLists.js), refreshing the cached Tor
// exit-node list and X4BNet VPN/datacenter CIDR ranges so
// app/api/fingerprint/check never has to fetch these externally on the
// request path. Each list refreshes independently — one feed being briefly
// unreachable shouldn't stop the other from updating.
// Always returns 200: a feed-refresh failure isn't a cron failure, the
// stale cache from the last successful run just keeps serving until the
// next attempt (same convention as process-blocks' per-item error handling).
export async function GET(request) {
  if (!isValidCronSecret(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = { tor: null, vpn: null, datacenter: null, errors: [] };

  try {
    result.tor = await refreshTorList();
  } catch (err) {
    result.errors.push(`tor: ${err.message}`);
  }

  try {
    const { vpnCount, datacenterCount } = await refreshVpnLists();
    result.vpn = vpnCount;
    result.datacenter = datacenterCount;
  } catch (err) {
    result.errors.push(`vpn: ${err.message}`);
  }

  console.log(`[sync-reputation] tor=${result.tor ?? '-'} vpn=${result.vpn ?? '-'} datacenter=${result.datacenter ?? '-'} errors=${result.errors.length}`);
  return NextResponse.json(result);
}
