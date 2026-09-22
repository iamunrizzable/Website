import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { refreshTorList, refreshVpnLists } from '@/lib/reputation/ipLists';

// TEMPORARY: one-time manual trigger for the Tor/VPN/datacenter reputation
// sync, gated by the admin key instead of CRON_SECRET (which was just
// added — this bypasses needing to know that value to confirm the fix
// works right now, rather than waiting for tomorrow's 2am UTC cron). Calls
// the exact same refresh functions app/api/cron/sync-reputation/route.js
// does. Meant to be deleted after confirming the lists populate.
export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  return NextResponse.json(result);
}
