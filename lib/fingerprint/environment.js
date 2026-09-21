// Cheap, low-entropy-but-useful signals read directly off navigator/screen/
// Intl. Not discriminative alone (thousands of devices share the same
// timezone or screen resolution), but cheap corroborating evidence for the
// weighted similarity comparator in lib/deviceMatch.js.
export function collectEnvironmentSignals() {
  try {
    return {
      screenWidth: window.screen?.width ?? null,
      screenHeight: window.screen?.height ?? null,
      colorDepth: window.screen?.colorDepth ?? null,
      pixelDepth: window.screen?.pixelDepth ?? null,
      // Physical-pixel-density ratio (2, 2.625, 2.75, 3, 3.5, etc.) —
      // varies by real device model even when CSS screenWidth/Height
      // happen to coincide across two different phones, unlike the other
      // fields in this object which are individually low-entropy (see
      // this file's own top comment).
      devicePixelRatio: window.devicePixelRatio ?? null,
      hardwareConcurrency: navigator.hardwareConcurrency ?? null,
      deviceMemory: navigator.deviceMemory ?? null,
      maxTouchPoints: navigator.maxTouchPoints ?? null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      language: navigator.language ?? null,
      languages: navigator.languages ? [...navigator.languages] : [],
      platform: navigator.platform ?? null,
    };
  } catch {
    return {};
  }
}
