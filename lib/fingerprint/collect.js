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
      const visitorId = await sha256Hex(canonicalize(components));
      return { visitorId, components };
    })();
  }
  return cached;
}
