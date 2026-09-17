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
