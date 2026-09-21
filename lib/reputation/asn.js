import dns from 'node:dns';

// Team Cymru's free, no-API-key IP-to-ASN service — plain DNS TXT lookups,
// no HTTP client, no account. Data is refreshed every 4h from 50+ BGP
// peers. Now runs for every visitor's first-ever visit (not just near-
// miss/block enrichment — see lib/tokens.js's recordVisitorHistory), but
// only once per device: cached on that visitor's history record and
// never looked up again on repeat visits, same principle as
// touchBlockedDevice never recomputing a ban's enrichment. Still, a
// brand-new visitor's very first page load can be delayed by up to
// ~1.6s worst-case (two chained 800ms-timeout DNS lookups) if this
// resolves slowly — a real, deliberate tradeoff, not an oversight.
//
// IPv4 only for v1 (Team Cymru also has an IPv6 service — origin6.asn.cymru.com
// — but this mirrors lib/reputation/cidrMatch.js's IPv4-only scope decision).
// Always returns null rather than throwing — an ASN lookup timing out or
// failing must never affect anything upstream.
const TIMEOUT_MS = 800;

function reverseIpv4(ip) {
  return ip.split('.').reverse().join('.');
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('asn-lookup-timeout')), ms)),
  ]);
}

export async function getAsnInfo(ip) {
  if (!ip || ip.includes(':')) return null;
  try {
    const reversed = reverseIpv4(ip);
    const originRecords = await withTimeout(
      dns.promises.resolveTxt(`${reversed}.origin.asn.cymru.com`),
      TIMEOUT_MS
    );
    const originLine = originRecords[0]?.join('');
    if (!originLine) return null;

    // Format: "ASN | BGP Prefix | Country | Registry | Allocated"
    const [asnStr, , countryStr] = originLine.split('|').map((s) => s.trim());
    const asn = Number(asnStr);
    if (!Number.isInteger(asn)) return null;

    let name = null;
    try {
      const nameRecords = await withTimeout(
        dns.promises.resolveTxt(`AS${asn}.asn.cymru.com`),
        TIMEOUT_MS
      );
      // Format: "ASN | Country | Registry | Allocated | AS Name"
      const parts = nameRecords[0]?.join('').split('|').map((s) => s.trim());
      name = parts?.[4] ?? null;
    } catch {
      // Name lookup is best-effort on top of the ASN/country we already have.
    }

    return { asn, name, country: countryStr || null };
  } catch {
    return null;
  }
}
