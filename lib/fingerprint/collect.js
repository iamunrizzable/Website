import { collectCanvasFingerprint } from './canvas';
import { collectWebglFingerprint } from './webgl';
import { collectAudioFingerprint } from './audio';
import { collectInstalledFonts } from './fonts';
import { collectEnvironmentSignals } from './environment';

// Canonical, stable key ordering so the same device always hashes to the
// same string regardless of object-property insertion order.
function canonicalize(components) {
  return JSON.stringify(components, Object.keys(components).sort());
}

// visitorId is hashed from only the signals confirmed STABLE across
// reloads on the same device — WebGL vendor/renderer/extensions/
// capabilities, fonts, and environment. Deliberately EXCLUDES the raw
// canvas data URL, the WebGL pixel-readback hash, and the audio sum:
// modern Safari (17+, and per WebKit's own blog, on by default from
// Safari 26) injects random per-session noise into Canvas/WebGL/WebAudio
// output specifically to defeat fingerprinting — confirmed via production
// logs showing 100% of requests from the same device/IP/browser over an
// hour getting a different visitorId, and via WebKit's public
// documentation of this as intentional behavior, not a bug on our end.
// Hashing those volatile fields meant the SAME real device got a
// brand-new visitorId on every single visit, which broke both the
// /admin/visitor/list history (every visit looked like a new visitor)
// and, far more seriously, let a banned device silently evade
// re-identification. The raw canvas/webgl/audio values are still
// collected and returned in `components` for lib/deviceMatch.js's
// similarity scoring, which was separately reweighted to stop relying on
// them (see deviceMatch.js).
//
// WebGL's `capabilities` (added after a real production collision:
// two different real devices — one iPhone, one Android, different
// cities — hashed to the same visitorId) are fixed hardware/driver
// constants (max texture size, viewport dims, shader precision limits,
// etc.), not noisy readback output, so they're not subject to the noise
// injection above, and browsers don't randomize them (a page needs the
// real values to render correctly). They're what's left to discriminate
// devices once vendor/renderer are masked, which is increasingly the
// default across browsers, not just Safari — and combined with a
// Windows-biased, self-defeating font candidate list (see fonts.js) that
// returns empty on most real phones, fonts+webgl-vendor/renderer alone
// were often near-worthless on mobile, which is most of this site's
// traffic.
function stableIdentitySignals(components) {
  const { webgl, fonts, environment } = components;
  return {
    webgl: webgl ? { vendor: webgl.vendor, renderer: webgl.renderer, extensions: webgl.extensions, capabilities: webgl.capabilities } : null,
    fonts,
    environment,
  };
}

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// The full SHA-256 digest is 64 hex chars — cryptographic-strength
// collision resistance this ID has no use for (it's a device label for a
// small site's admin panel, not a security credential). Truncated to 16
// hex chars (64 bits) here, at the source, so the shortened value IS the
// visitorId everywhere it's used — generated, stored, and compared as
// this same 16-char string throughout, not a display-only slice of a
// longer value living elsewhere. That distinction matters: slicing only
// the copy/display of an already-64-char stored ID would break exact-match
// banning outright (a truncated paste could never equal the full stored
// value) — truncating the source hash instead keeps generation and
// comparison consistent, so matching still works correctly. 64 bits of a
// well-distributed hash is still astronomically collision-resistant at any
// realistic visitor count for this site (birthday-bound collisions need
// tens of millions of distinct devices before becoming a real risk).
const VISITOR_ID_LENGTH = 16;

let cached;

// Orchestrates every collector in lib/fingerprint/ into one `components`
// object, then hashes it into a stable visitorId (16-char hex — well within
// the existing admin blocklist's [A-Za-z0-9]{10,64} validation). Cached per
// page-session (module-scope) so repeated callers (DeviceGate + the
// ?fpdebug=1 debug bar) share one computation rather than re-running canvas/
// WebGL/audio collection multiple times per load.
export async function getFingerprint() {
  if (!cached) {
    cached = (async () => {
      const [canvas, webgl, audio] = await Promise.all([
        Promise.resolve(collectCanvasFingerprint()),
        Promise.resolve(collectWebglFingerprint()),
        collectAudioFingerprint(),
      ]);
      const fonts = collectInstalledFonts();
      const environment = collectEnvironmentSignals();

      const components = { canvas, webgl, audio, fonts, environment };
      const fullHash = await sha256Hex(canonicalize(stableIdentitySignals(components)));
      const visitorId = fullHash.slice(0, VISITOR_ID_LENGTH);
      return { visitorId, components };
    })();
  }
  return cached;
}
