// Consent storage shared by DeviceGate (the gate that blocks all data
// collection until accepted) and ConsentAnalytics (Vercel Analytics /
// Speed Insights only load after acceptance).
//
// Bump CONSENT_VERSION when the data collected changes in a way visitors
// should agree to again — everyone is asked once more.
export const CONSENT_VERSION = 1;
const KEY = 'tjb_consent';
export const CONSENT_EVENT = 'tjb-consent-granted';

export function readConsent() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return false;
    return JSON.parse(raw)?.v === CONSENT_VERSION;
  } catch {
    return false;
  }
}

export function writeConsent() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ v: CONSENT_VERSION, t: new Date().toISOString() }));
  } catch {
    // Storage blocked: consent only lasts for this page session.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
