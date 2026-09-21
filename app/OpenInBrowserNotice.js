'use client';

import { useEffect, useState } from 'react';
import './OpenInBrowserNotice.css';
import { detectInAppBrowser, tryOpenInExternalBrowser } from '@/lib/inAppBrowser';

const DISMISS_KEY = 'tjb_oibn_dismissed';

// Slim, dismissible banner — not a gate, never blocks the page — shown
// only inside an in-app browser (TikTok/Facebook/Instagram's own WebView).
// Exists because that WebView's storage is sandboxed from Safari's: the
// device's persistentMarker (lib/fingerprint/persistentMarker.js) can't
// carry over, so a visitor who taps a TikTok bio link and later opens the
// site in Safari looks like two different people. The button is
// best-effort (see lib/inAppBrowser.js) — neither iOS nor Android lets a
// page force a handoff to the real browser, and TikTok's WebView may
// simply decline it — so manual instructions stay visible underneath as a
// fallback that always works regardless of whether the button does
// anything.
export default function OpenInBrowserNotice() {
  const [appName, setAppName] = useState(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const detected = detectInAppBrowser(navigator.userAgent);
    if (!detected) return;
    setAppName(detected);
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!appName || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
  };

  return (
    <div className="oibn-bar">
      <div className="oibn-text">
        <strong>You're viewing this inside {appName}.</strong> Some features work
        better in your regular browser.
      </div>
      <div className="oibn-actions">
        <button className="oibn-btn" onClick={tryOpenInExternalBrowser}>Open in Browser</button>
        <span className="oibn-hint">Didn&apos;t work? Tap ⋯ or the share icon above and choose &quot;Open in Browser.&quot;</span>
        <button className="oibn-dismiss" onClick={dismiss} aria-label="Dismiss">✕</button>
      </div>
    </div>
  );
}
