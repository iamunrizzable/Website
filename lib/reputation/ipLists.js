import { getRedis } from '../tokens.js';
import { parseCidr, isIpInRanges } from './cidrMatch.js';

// Free, public, no-API-key IP reputation feeds — refreshed hourly by
// app/api/cron/sync-reputation/route.js, never fetched inline on a request
// (an inline fetch here would add latency to every near-miss/block, and
// risk this becoming a new fail point for the site-wide gate).
//
// Tor: official Tor Project bulk exit list. They explicitly allow
// unauthenticated, unrate-limited access and ask for hourly refresh — we
// refresh DAILY instead (see app/api/cron/sync-reputation/route.js), not
// because hourly wouldn't be better, but because this project is on
// Vercel's Hobby plan, which caps cron jobs at once per day (an hourly
// schedule fails deployment outright). Worth revisiting if this project
// ever moves to Pro.
const TOR_EXIT_LIST_URL = 'https://check.torproject.org/torbulkexitlist';

// VPN/datacenter: X4BNet/lists_vpn — free, open-source, auto-rebuilt from
// ASN data by GitHub Actions. `vpn` is VPN providers only; `datacenter`
// additionally covers general hosting/cloud ranges (broader, noisier).
const VPN_LIST_URL = 'https://raw.githubusercontent.com/X4BNet/lists_vpn/main/output/vpn/ipv4.txt';
const DATACENTER_LIST_URL = 'https://raw.githubusercontent.com/X4BNet/lists_vpn/main/output/datacenter/ipv4.txt';

const TOR_KEY = 'reputation:tor_exit_nodes';
const VPN_KEY = 'reputation:vpn_ranges';
const DATACENTER_KEY = 'reputation:datacenter_ranges';
// A bit more than the daily refresh cadence, so a single missed cron run
// degrades to "unknown" rather than serving indefinitely stale data.
const CACHE_TTL_SECONDS = 26 * 60 * 60;
const FETCH_TIMEOUT_MS = 15000;

const mem = { torNodes: null, vpnRanges: null, datacenterRanges: null };

async function fetchLines(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
  const text = await res.text();
  return text.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

export async function refreshTorList() {
  const ips = await fetchLines(TOR_EXIT_LIST_URL);
  const redis = getRedis();
  if (redis) {
    await redis.del(TOR_KEY);
    if (ips.length) await redis.sadd(TOR_KEY, ...ips);
    await redis.expire(TOR_KEY, CACHE_TTL_SECONDS);
  } else {
    mem.torNodes = new Set(ips);
  }
  return ips.length;
}

async function refreshRangeList(url, redisKey, memField) {
  const lines = await fetchLines(url);
  const ranges = lines.map(parseCidr).filter(Boolean);
  const redis = getRedis();
  if (redis) {
    await redis.set(redisKey, JSON.stringify(ranges), { ex: CACHE_TTL_SECONDS });
  } else {
    mem[memField] = ranges;
  }
  return ranges.length;
}

export async function refreshVpnLists() {
  const [vpnCount, datacenterCount] = await Promise.all([
    refreshRangeList(VPN_LIST_URL, VPN_KEY, 'vpnRanges'),
    refreshRangeList(DATACENTER_LIST_URL, DATACENTER_KEY, 'datacenterRanges'),
  ]);
  return { vpnCount, datacenterCount };
}

export async function isTorExitNode(ip) {
  if (!ip) return false;
  try {
    const redis = getRedis();
    if (redis) return (await redis.sismember(TOR_KEY, ip)) === 1;
    return mem.torNodes?.has(ip) ?? false;
  } catch {
    return false;
  }
}

export async function checkVpnReputation(ip) {
  if (!ip) return { vpn: false, datacenter: false };
  try {
    const redis = getRedis();
    let vpnRanges;
    let datacenterRanges;
    if (redis) {
      const [vpnRaw, dcRaw] = await Promise.all([redis.get(VPN_KEY), redis.get(DATACENTER_KEY)]);
      vpnRanges = vpnRaw ? (typeof vpnRaw === 'string' ? JSON.parse(vpnRaw) : vpnRaw) : [];
      datacenterRanges = dcRaw ? (typeof dcRaw === 'string' ? JSON.parse(dcRaw) : dcRaw) : [];
    } else {
      vpnRanges = mem.vpnRanges ?? [];
      datacenterRanges = mem.datacenterRanges ?? [];
    }
    return {
      vpn: isIpInRanges(ip, vpnRanges),
      datacenter: isIpInRanges(ip, datacenterRanges),
    };
  } catch {
    return { vpn: false, datacenter: false };
  }
}
