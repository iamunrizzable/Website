// Pure IPv4 CIDR-range utilities — no I/O. Used to check a visitor's IP
// against the cached Tor/VPN/datacenter lists in lib/reputation/ipLists.js.
//
// IPv6 is deliberately out of scope for v1: the source feeds (X4BNet, Team
// Cymru) publish separate IPv6 data, but 128-bit range arithmetic is a lot
// more code for a feature that's informational-only (see lib/tokens.js —
// IP has never been the primary key for blocking here). An IPv6 visitor
// just gets no Tor/VPN classification (null), never a crash.

export function ipv4ToInt(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const part of parts) {
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) return null;
    n = (n << 8) | octet;
  }
  return n >>> 0;
}

// '203.0.113.0/24' -> { start, end } as uint32 (inclusive range).
export function parseCidr(cidr) {
  const [base, bitsStr] = cidr.trim().split('/');
  const baseInt = ipv4ToInt(base);
  const bits = bitsStr !== undefined ? Number(bitsStr) : 32;
  if (baseInt === null || !Number.isInteger(bits) || bits < 0 || bits > 32) return null;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  const start = (baseInt & mask) >>> 0;
  const end = (start | (~mask >>> 0)) >>> 0;
  return { start, end };
}

export function isIpInRanges(ip, ranges) {
  const target = ipv4ToInt(ip);
  if (target === null) return false;
  for (const { start, end } of ranges) {
    if (target >= start && target <= end) return true;
  }
  return false;
}
