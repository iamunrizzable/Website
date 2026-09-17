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
// reloads on the same device — WebGL vendor/renderer/extensions, fonts,
// and environment. Deliberately EXCLUDES the raw canvas data URL, the
// WebGL pixel-readback hash, and the audio sum: modern Safari (17+, and
// per WebKit's own blog, on by default from Safari 26) injects random
// per-session noise into Canvas/WebGL/WebAudio output specifically to
// defeat fingerprinting — confirmed via production logs showing 100% of
// requests from the same device/IP/browser over an hour getting a
// different visitorId, and via WebKit's public documentation of this as
// intentional behavior, not a bug on our end. Hashing those volatile
// fields meant the SAME real device got a brand-new visitorId on every
// single visit, which broke both the /admin/visitor/list history (every
// visit looked like a new visitor) and, far more seriously, let a banned
// device silently evade re-identification. The raw canvas/webgl/audio
// values are still collected and returned in `components` for
// lib/deviceMatch.js's similarity scoring, which was separately
// reweighted to stop relying on them (see deviceMatch.js).
function stableIdentitySignals(components) {
  const { webgl, fonts, environment } = components;
  return {
    webgl: webgl ? { vendor: webgl.vendor, renderer: webgl.renderer, extensions: webgl.extensions } : null,
    fonts,
    environment,
  };
}

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

let cached;

// Orchestrates every collector in lib/fingerprint/ into one `components`
// object, then hashes it into a stable visitorId (64-char hex — well within
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
      const visitorId = await sha256Hex(canonicalize(stableIdentitySignals(components)));
      return { visitorId, components };
    })();
  }
  return cached;
}
