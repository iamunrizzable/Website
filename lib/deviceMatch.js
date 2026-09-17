// Weighted similarity comparator for device fingerprints. Exact-hash
// equality (lib/fingerprint/collect.js's visitorId) is too brittle on its
// own — a routine browser/OS update shifts rendering output just enough
// to change the hash entirely, even though every other signal still
// matches the same physical device. This compares the underlying
// `components` instead and produces a 0–1 similarity score, so a banned
// device is still recognized after drift in one or two signals, without
// needing a perfect match.
//
// Canvas and audio are excluded entirely, and WebGL's pixel-readback hash
// is excluded from its own sub-score (see scoreWebgl) — confirmed via
// production logs (100% of requests from the same device/IP/browser over
// an hour got completely different canvas/audio/webgl-pixel output) and
// WebKit's own documentation that Safari 17+ (default from Safari 26)
// deliberately injects random per-session noise into exactly these three
// APIs to defeat fingerprinting. Scoring them let a banned Safari device
// come back as totally unrelated to its own ban record — a real evasion
// bug, not just a cosmetic ID problem. WebGL vendor/renderer/extensions,
// fonts, and environment aren't subject to that noise (it only touches
// pixel/audio-buffer readback, not plain string/navigator properties), so
// they now carry the full weight. Weights sum to 1.0.
const WEIGHTS = {
  webgl: 0.45,
  fonts: 0.35,
  environment: 0.20,
};

function jaccard(a, b) {
  const setA = new Set(a ?? []);
  const setB = new Set(b ?? []);
  if (setA.size === 0 && setB.size === 0) return 1;
  let intersection = 0;
  for (const item of setA) if (setB.has(item)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

// pixelHash deliberately excluded — it's a WebGL readPixels() readback,
// subject to the same per-session noise injection as canvas/audio (see
// WEIGHTS comment above). vendor/renderer/extensions are plain
// string/array properties, not pixel readback, and aren't affected.
function scoreWebgl(a, b) {
  if (a == null || b == null) return a === b ? 1 : 0;
  let matched = 0;
  let total = 0;
  total++; if (a.vendor === b.vendor) matched++;
  total++; if (a.renderer === b.renderer) matched++;
  total++; matched += jaccard(a.extensions, b.extensions);
  return total === 0 ? 0 : matched / total;
}

function scoreFonts(a, b) {
  return jaccard(a, b);
}

function scoreEnvironment(a, b) {
  if (!a || !b) return a === b ? 1 : 0;
  const fields = ['screenWidth', 'screenHeight', 'colorDepth', 'pixelDepth', 'hardwareConcurrency', 'deviceMemory', 'maxTouchPoints', 'timezone', 'language', 'platform'];
  let matched = 0;
  for (const field of fields) if (a[field] === b[field]) matched++;
  matched += jaccard(a.languages, b.languages);
  return matched / (fields.length + 1);
}

// Returns a 0–1 similarity score between two `components` objects (the
// shape produced by lib/fingerprint/collect.js's getFingerprint()).
export function similarityScore(componentsA, componentsB) {
  if (!componentsA || !componentsB) return 0;
  const webgl = scoreWebgl(componentsA.webgl, componentsB.webgl);
  const fonts = scoreFonts(componentsA.fonts, componentsB.fonts);
  const environment = scoreEnvironment(componentsA.environment, componentsB.environment);

  return (
    webgl * WEIGHTS.webgl +
    fonts * WEIGHTS.fonts +
    environment * WEIGHTS.environment
  );
}

// Starting-point thresholds — NOT tuned against real traffic yet. These
// need real-world calibration after shipping (see CLAUDE.md's "never guess
// at a fix" — the same discipline applies to tuning these blind). Until
// then, err toward the near-miss queue over auto-blocking on an unproven
// threshold.
export const AUTO_BLOCK_THRESHOLD = 0.92;
export const NEAR_MISS_THRESHOLD = 0.75;

// Finds the best-matching banned profile (if any) for a given components
// object among a list of stored profiles. Returns { profile, score } for
// the highest-scoring match, or null if the list is empty.
export function findBestMatch(components, profiles) {
  let best = null;
  for (const profile of profiles) {
    const score = similarityScore(components, profile.components);
    if (!best || score > best.score) best = { profile, score };
  }
  return best;
}
