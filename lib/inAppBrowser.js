// Detects the common in-app WebView browsers (TikTok, Facebook, Instagram)
// via their user-agent tokens — confirmed directly from real production
// traffic (see the persistentMarker investigation: TikTok's in-app browser
// UA carries "musical_ly_X.X.X ... BytedanceWebview", Facebook's carries
// "FBAN/FBIOS;FBAV/..."). These WebViews run in their own storage sandbox
// (WKWebsiteDataStore on iOS), isolated from Safari's — localStorage,
// IndexedDB, and the Cache API set inside one are invisible to the other.
// That's Apple's own app-sandboxing design, not something any client-side
// code can bridge, so a visitor bouncing between an in-app browser and
// Safari legitimately gets a fresh persistentMarker each time.
const IN_APP_PATTERNS = [
  { name: 'TikTok', re: /musical_ly|BytedanceWebview|TikTok/i },
  { name: 'Facebook', re: /FBAN|FBAV|FB_IAB/i },
  { name: 'Instagram', re: /Instagram/i },
];

export function detectInAppBrowser(userAgent) {
  if (!userAgent) return null;
  const match = IN_APP_PATTERNS.find(({ re }) => re.test(userAgent));
  return match ? match.name : null;
}

// Best-effort escape to the device's real browser. Neither iOS nor Android
// gives a webpage a public API to force-launch the user's default browser
// from inside another app's WebView — both techniques below are
// undocumented-but-real conventions that Safari/Chrome register for, and
// NEITHER is guaranteed: an in-app browser can simply decline to hand off
// navigation to a non-http(s) scheme, and apps like TikTok are known to do
// exactly that on purpose (their in-app browser exists to keep visitors
// from leaving). This has not been verified against a live TikTok in-app
// session — needs a real-device test, not something this environment can
// run. If it silently does nothing, the caller should still show the
// manual "tap ... and choose Open in Browser" instructions as a fallback.
export function tryOpenInExternalBrowser() {
  const url = window.location.href;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (isIOS) {
    // Safari registers the x-safari-https/x-safari-http schemes and opens
    // the URL itself when it receives one — but only if the host app's
    // WebView actually hands off navigation to a non-http(s) scheme
    // instead of swallowing it.
    window.location.href = url.replace(/^https?:\/\//, (m) => `x-safari-${m}`);
  } else {
    // Android: an explicit VIEW intent, no package specified so the OS's
    // own default-browser chooser (or default app) handles it rather than
    // hardcoding Chrome.
    const bare = url.replace(/^https?:\/\//, '');
    window.location.href = `intent://${bare}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
  }
}
