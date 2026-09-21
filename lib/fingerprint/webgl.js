// WebGL vendor/renderer strings — the one signal enrichment's VM detection
// needs (lib/deviceSignals.js's classifyVm). Device *identity* no longer
// comes from here (or from any browser fingerprint) — see
// lib/fingerprint/persistentMarker.js, the sole identity signal. vendor/
// renderer are increasingly masked to null by browsers (the
// WEBGL_debug_renderer_info extension itself being unavailable, or the
// values it returns being generic) as a documented, deliberate anti-
// fingerprinting default — classifyVm already treats a null/unmatched
// result as "not detected", not an error.
export function collectWebglFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;

    let vendor = null;
    let renderer = null;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }

    return {
      vendor: vendor ? String(vendor) : null,
      renderer: renderer ? String(renderer) : null,
    };
  } catch {
    return null;
  }
}
