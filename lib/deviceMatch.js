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
// WEIGHTS comment above). vendor/renderer/extensions/capabilities are
// plain string/array/number properties, not pixel readback, and aren't
// affected.
//
// Returns null (not 0) when neither side has real data for a sub-signal —
// e.g. both vendor AND renderer are null because WEBGL_debug_renderer_info
// is masked on both. That's the fix for a real bug this scorer had: two
// devices both missing the same signal used to score as if that missing
// signal were a PERFECT MATCH (null === null, or jaccard([],[]) === 1 by
// convention), when "neither device gave us data" is the opposite of
// evidence they're the same device. A null sub-score is excluded from the
// weighted average in similarityScore below (weights renormalize across
// whatever signals actually had data) instead of silently counting as
// full confidence.
function scoreWebgl(a, b) {
  if (a == null && b == null) return null;
  if (a == null || b == null) return 0;
  let matched = 0;
  let total = 0;
  if (a.vendor != null || b.vendor != null) { total++; if (a.vendor === b.vendor) matched++; }
  if (a.renderer != null || b.renderer != null) { total++; if (a.renderer === b.renderer) matched++; }
  if ((a.extensions?.length ?? 0) > 0 || (b.extensions?.length ?? 0) > 0) { total++; matched += jaccard(a.extensions, b.extensions); }
  const capFields = ['maxTextureSize', 'maxRenderbufferSize', 'maxCubeMapTextureSize', 'maxVertexAttribs', 'maxVertexUniformVectors', 'maxFragmentUniformVectors', 'maxVaryingVectors', 'maxCombinedTextureImageUnits', 'shadingLanguageVersion', 'version'];
  const capA = a.capabilities ?? {};
  const capB = b.capabilities ?? {};
  for (const field of capFields) {
    if (capA[field] != null || capB[field] != null) { total++; if (capA[field] === capB[field]) matched++; }
  }
  return total === 0 ? null : matched / total;
}

// Same null-when-no-data fix as scoreWebgl — a font candidate list that's
// mostly Windows-only fonts (see fonts.js) commonly returns [] on real
// mobile devices regardless of OS, so two unrelated phones both getting []
// must not score as a perfect fonts match.
function scoreFonts(a, b) {
  const aEmpty = !a || a.length === 0;
  const bEmpty = !b || b.length === 0;
  if (aEmpty && bEmpty) return null;
  return jaccard(a, b);
}

function scoreEnvironment(a, b) {
  if (!a || !b) return a === b ? 1 : 0;
  const fields = ['screenWidth', 'screenHeight', 'colorDepth', 'pixelDepth', 'devicePixelRatio', 'hardwareConcurrency', 'deviceMemory', 'maxTouchPoints', 'timezone', 'language', 'platform'];
  let matched = 0;
  for (const field of fields) if (a[field] === b[field]) matched++;
  matched += jaccard(a.languages, b.languages);
  return matched / (fields.length + 1);
}

// Returns a 0–1 similarity score between two `components` objects (the
// shape produced by lib/fingerprint/collect.js's getFingerprint()). Each
// sub-signal that had no real data on either side (see scoreWebgl/
// scoreFonts above) is excluded and the remaining weights renormalize to
// sum to 1 — so, for example, two devices that both failed to produce a
// font list are scored purely on webgl+environment instead of fonts
// silently contributing a false "identical" 35%.
export function similarityScore(componentsA, componentsB) {
  if (!componentsA || !componentsB) return 0;
  const parts = [
    { score: scoreWebgl(componentsA.webgl, componentsB.webgl), weight: WEIGHTS.webgl },
    { score: scoreFonts(componentsA.fonts, componentsB.fonts), weight: WEIGHTS.fonts },
    { score: scoreEnvironment(componentsA.environment, componentsB.environment), weight: WEIGHTS.environment },
  ].filter((p) => p.score !== null);

  const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) return 0; // no usable signal from either device at all

  return parts.reduce((sum, p) => sum + p.score * p.weight, 0) / totalWeight;
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
