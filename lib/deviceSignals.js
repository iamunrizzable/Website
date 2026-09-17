// Pure classifiers, no I/O — same "documented starting point, not tuned
// against real traffic" style as lib/deviceMatch.js. These turn raw
// collected/looked-up data into the Smart Signals / Suspect Score shown in
// /admin/security's detail view. NONE of these gate access — see
// lib/tokens.js's checkDeviceAgainstBlocklist, which never calls into this
// file; enrichment is informational only, attached after a block/near-miss
// verdict already exists from the (separately tuned) similarity matcher.

// Software/virtualized renderer strings. "medium" confidence, not "high" —
// swiftshader/llvmpipe also show up on legitimate headless CI browsers and
// some real low-power devices with broken GPU drivers, not just VMs.
const VM_SIGNATURES = [
  'swiftshader', 'llvmpipe', 'vmware', 'virtualbox', 'vbox',
  'parallels', 'microsoft basic render driver', 'virtio', 'qemu',
];

export function classifyVm(webgl) {
  if (!webgl) return { detected: false, confidence: 'low', matchedSignature: null };
  const haystack = `${webgl.vendor ?? ''} ${webgl.renderer ?? ''}`.toLowerCase();
  const matched = VM_SIGNATURES.find((sig) => haystack.includes(sig));
  return {
    detected: !!matched,
    confidence: matched ? 'medium' : 'low',
    matchedSignature: matched ?? null,
  };
}

// Every one of these is individually trivial to evade (a single Chrome
// launch flag defeats navigator.webdriver, for instance) — this is a weak
// corroborating signal, never proof. Always 'low' confidence.
export function scoreBotSignals(botSignals) {
  if (!botSignals) return { suspected: false, confidence: 'low', reasons: [] };
  const reasons = [];
  if (botSignals.webdriver) reasons.push('navigator.webdriver is true');
  if (botSignals.missingChromeObject) reasons.push('Chrome-looking UA but window.chrome is missing');
  if (botSignals.emptyPlugins) reasons.push('navigator.plugins is empty');
  if (botSignals.emptyLanguages) reasons.push('navigator.languages is empty');
  if (botSignals.notificationPermissionMismatch) reasons.push('Notification.permission inconsistency');
  return { suspected: reasons.length > 0, confidence: 'low', reasons };
}

// The classic single-signal storage-quota incognito check is confirmed
// broken as of Chrome's 2026 quota changes (source: current research, see
// plan). This uses several independent weaker probes instead and only
// calls it "suspected" at 2+ blocked probes, to cut down on a single
// privacy extension (which blocks one API, not all of them) reading as
// incognito. Still always 'low' confidence — never presented as proof.
const PRIVACY_PROBE_KEYS = [
  'serviceWorkerBlocked', 'indexedDbBlocked', 'cacheStorageBlocked',
  'opfsBlocked', 'broadcastChannelBlocked', 'sharedWorkerBlocked',
];

export function scorePrivacySignals(privacySignals) {
  if (!privacySignals) return { suspected: false, confidence: 'low', blockedProbeCount: 0 };
  const blockedProbeCount = PRIVACY_PROBE_KEYS.filter((k) => privacySignals[k]).length;
  return { suspected: blockedProbeCount >= 2, confidence: 'low', blockedProbeCount };
}

// Multiple distinct IPs or countries for the same device in 24h is a real
// anomaly signal (rotation, account/device sharing, travel) — thresholds
// are a starting point, not tuned against real traffic.
export function isVelocityAnomalous(velocity) {
  if (!velocity) return false;
  return (velocity.ipCount24h ?? 0) >= 5 || (velocity.countryCount24h ?? 0) >= 2;
}

// Fixed weights, capped at 100. Deliberately NO percentile framing (see
// plan) — Fingerprint's percentile was computed against their cross-
// customer population; ours would be computed against a tiny, adversarial-
// only blocklist, which isn't a meaningful population to rank against.
const SCORE_WEIGHTS = { tor: 35, vpnOrDatacenter: 15, bot: 20, vm: 10, incognito: 5, velocityAnomaly: 15 };

export function computeSuspectScore({ tor, vpnOrDatacenter, vm, bot, incognito, velocityAnomaly }) {
  let value = 0;
  if (tor) value += SCORE_WEIGHTS.tor;
  if (vpnOrDatacenter) value += SCORE_WEIGHTS.vpnOrDatacenter;
  if (bot) value += SCORE_WEIGHTS.bot;
  if (vm) value += SCORE_WEIGHTS.vm;
  if (incognito) value += SCORE_WEIGHTS.incognito;
  if (velocityAnomaly) value += SCORE_WEIGHTS.velocityAnomaly;
  value = Math.min(100, value);
  const label = value >= 60 ? 'High' : value >= 30 ? 'Medium' : 'Low';
  return { value, label };
}

// Lightweight regex-based UA parsing — best-effort display labels only,
// not authoritative (UA strings are self-reported and trivially spoofed).
// No new dependency; covers the major browsers/OSes/device classes.
const BROWSER_PATTERNS = [
  { name: 'Edge', re: /Edg\/([\d.]+)/ },
  { name: 'Samsung Internet', re: /SamsungBrowser\/([\d.]+)/ },
  { name: 'Opera', re: /(?:OPR|Opera)\/([\d.]+)/ },
  { name: 'Chrome', re: /Chrome\/([\d.]+)/ },
  { name: 'Firefox', re: /Firefox\/([\d.]+)/ },
  { name: 'Safari', re: /Version\/([\d.]+).*Safari/ },
];

const OS_PATTERNS = [
  { name: 'iOS', re: /iPhone OS ([\d_]+)/ },
  { name: 'iPadOS', re: /CPU OS ([\d_]+)/ },
  { name: 'Mac OS X', re: /Mac OS X ([\d_]+)/ },
  { name: 'Android', re: /Android ([\d.]+)/ },
  { name: 'Windows', re: /Windows NT ([\d.]+)/ },
  { name: 'ChromeOS', re: /CrOS \S+ ([\d.]+)/ },
  { name: 'Linux', re: /(Linux)/ },
];

function detectBrowser(ua) {
  for (const { name, re } of BROWSER_PATTERNS) {
    const m = ua.match(re);
    if (m) return `${name} ${m[1]}`;
  }
  return 'Unknown browser';
}

function detectOS(ua) {
  for (const { name, re } of OS_PATTERNS) {
    const m = ua.match(re);
    if (m) return m[1] && m[1] !== name ? `${name} ${m[1].replace(/_/g, '.')}` : name;
  }
  return 'Unknown OS';
}

function detectDevice(ua) {
  if (/iPad|Tablet/i.test(ua)) return 'Tablet';
  if (/Mobile|iPhone|Android/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

export function parseUserAgent(userAgent) {
  if (!userAgent) return { browser: 'Unknown browser', os: 'Unknown OS', device: 'Other' };
  return {
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
    device: detectDevice(userAgent),
  };
}
