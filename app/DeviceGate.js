'use client';

import { useEffect, useRef, useState } from 'react';
import './GateSpinner.css';
import './DeviceGate.css';
import { getPersistentMarker, setPersistentMarker } from '@/lib/fingerprint/persistentMarker';
import { collectWebglFingerprint } from '@/lib/fingerprint/webgl';
import { collectBotSignals } from '@/lib/fingerprint/botSignals';
import { collectPrivacySignals } from '@/lib/fingerprint/privacySignals';
import OpenInBrowserNotice from './OpenInBrowserNotice';
import GtaViBanner from './GtaViBanner';
import { readConsent, writeConsent } from './consent';

// How long to wait for our OWN local identification — the persistent
// storage marker (lib/fingerprint/persistentMarker.js), the sole device
// identity signal — before concluding it failed. There's no remote script/
// network round-trip anymore (everything is bundled same-origin), so this
// is now just a watchdog against a hung or blocked browser API (a locked-
// down privacy browser can still disable localStorage/IndexedDB/the Cache
// API outright). This path fails CLOSED: if we can never even compute an
// identity to check, letting the visitor through unconditionally would make
// blocking those APIs an unintentional bypass of every device ban on the
// site.
const IDENTIFY_TIMEOUT_MS = 2000;

// Consent screen copy. Matches the data described in the Privacy Policy
// (app/legal/privacy/policy/page.js, Section 2). Edit the text HERE only.
const CONSENT_TEXT = {
  title: 'Before you continue',
  intro: 'TJB Management Inc. collects and uses the following data when you visit this website:',
  items: [
    'Your IP address and approximate location (city, region, country).',
    "A device identifier built from your browser and device signals (browser, operating system, screen, fonts, timezone, language, graphics and audio characteristics), plus a random marker stored in your browser's local storage, IndexedDB and Cache.",
    'A network and risk assessment (your network provider, and whether you appear to be using a VPN, Tor, a datacenter, a virtual machine, or automated or private browsing).',
    "Your device's visit history on this website (first visit, most recent visit, and number of visits).",
    'Traffic and performance analytics from Vercel Analytics and Speed Insights.',
  ],
  purpose: 'This data is used to operate and secure the website and to block devices that violate our policies. Visit records are deleted automatically 30 days after your most recent visit. It is not used for advertising.',
  policyNote: 'The full Privacy Policy is at tjbmanagementinc.com/legal/privacy/policy.',
  accept: 'I Consent',
  decline: 'Decline',
  declinedTitle: 'Consent required',
  declinedBody: 'You cannot use this website without agreeing to the data collection described on the previous screen. No data has been collected from you.',
  review: 'Review again',
};

// How long to wait for OUR OWN /api/fingerprint/check call once a
// fingerprint IS available, before giving up. Fails CLOSED — any activity
// this can't verify (Redis error, a slow response, a network failure) is
// treated as unverified and blocked, not let through.
const CHECK_TIMEOUT_MS = 5000;

// Friendly labels for the 'unverified' screen's reason line. A purposeful
// block (device-blocklist match, or a high-confidence similarity match)
// shows 'blocked' instead — this map only covers cases where we couldn't
// actually complete verification.
const REASON_LABELS = {
  'fingerprint-error': "We couldn't compute a device identifier in your browser.",
  'check-timeout': 'Our verification service took too long to respond.',
  'check-api-error': 'Our verification service returned an error.',
  'network-error': "We couldn't reach our verification service.",
  'device-blocklist-check-error': "We couldn't confirm your device's status.",
  'no-marker': 'Verification data was missing from your request.',
};

function reasonLabel(reason) {
  return REASON_LABELS[reason] ?? reason ?? 'We were unable to complete verification.';
}

// Specific, user-facing reason shown on the 'blocked' screen — every
// auto-ban (and manual bans going forward) carries a reasonCode (see
// lib/tokens.js's checkDeviceAgainstBlocklist), so a blocked visitor sees
// a real reason instead of one generic "Access Denied" for every kind of
// block. Each reason gets its own distinct wording — naming the country
// for a plain non-US/CA visit is fine, but for vpn/datacenter/tor the
// country shown can itself be US/CA (that's the whole point of the
// "blanket VPN ban" — it catches a VPN/datacenter/Tor connection
// regardless of what location it reports), so reusing the country-only
// phrasing there just reads as "we banned you for being in an allowed
// country," which is confusing, not more secure: the country name is, if
// anything, MORE evasion-enabling than naming the mechanism, since it
// tells a visitor exactly which location to fake next. An older ban with
// no reasonCode, or a country-dependent reason with no resolved country,
// omits the reason line rather than fabricating one.
const BLOCK_REASON_LABELS = {
  vpn: "Our automated systems permanently banned you because they detected you're using a VPN.",
  datacenter: "Our automated systems permanently banned you because they detected you're connecting from a hosting/datacenter network, not a residential or mobile connection.",
  tor: "Our automated systems permanently banned you because they detected you're using the Tor network.",
  manual: 'Your device was manually blocked by an administrator.',
};

function blockReasonLabel(reason, countryName) {
  if (BLOCK_REASON_LABELS[reason]) return BLOCK_REASON_LABELS[reason];
  if (reason === 'non-us' && countryName) {
    return `Our automated systems permanently banned you because they detected you're attempting to access them from ${countryName}.`;
  }
  return null;
}

// Blocks the whole site for visitors whose persistentMarker matches the
// blocklist at /admin/security — an exact match only ('blocked' — a
// purposeful, confirmed block). Anything else we can't actually verify —
// local marker computation failing, our own check call timing out/
// erroring, a Redis error, etc — shows the 'unverified' screen instead,
// with `reason` naming specifically why, since none of those are us
// blocking someone on purpose. The verdict is checked BEFORE showing any
// page content — a loading screen covers the page until it resolves (or
// times out), so nobody sees a flash of real content first.
export default function DeviceGate({ children }) {
  // Consent comes BEFORE any data collection: nothing below (fingerprint,
  // /api/fingerprint/check, IP/visit record) runs until the visitor has
  // accepted — see app/consent.js. null = still reading storage,
  // 'needed' = show the consent card, 'declined' = show the declined card,
  // 'granted' = run the normal verification flow.
  const [consent, setConsent] = useState(null);
  const [status, setStatus] = useState('checking'); // 'checking' | 'blocked' | 'unverified' | 'allowed'
  const [reason, setReason] = useState(null);
  const [blockReason, setBlockReason] = useState(null);
  const [blockCountryName, setBlockCountryName] = useState(null);
  const [deviceMarker, setDeviceMarker] = useState(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    setConsent(readConsent() ? 'granted' : 'needed');
  }, []);

  useEffect(() => {
    if (consent !== 'granted') return;
    let cancelled = false;

    const watchdog = setTimeout(() => {
      if (!cancelled && !resolvedRef.current) {
        resolvedRef.current = true;
        setReason('fingerprint-error');
        setStatus('unverified');
      }
    }, IDENTIFY_TIMEOUT_MS);

    Promise.all([getPersistentMarker(), Promise.resolve(collectWebglFingerprint()), collectBotSignals(), collectPrivacySignals()])
      .then(([persistentMarker, webgl, botSignals, privacySignals]) => {
        if (cancelled || resolvedRef.current) return;
        clearTimeout(watchdog);
        setDeviceMarker(persistentMarker);

        const checkTimeout = setTimeout(() => {
          if (!cancelled && !resolvedRef.current) {
            resolvedRef.current = true;
            setReason('check-timeout');
            setStatus('unverified');
          }
        }, CHECK_TIMEOUT_MS);

        fetch('/api/fingerprint/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ persistentMarker, webgl, botSignals, privacySignals }),
        })
          .then((res) => (res.ok ? res.json() : { verdict: 'unverified', reason: 'check-api-error' }))
          .then((result) => {
            if (cancelled || resolvedRef.current) return;
            resolvedRef.current = true;
            // A visitor whose browser still holds a pre-shortening 32-char
            // marker gets told the server-side rename via reassignMarker —
            // overwrite local storage so future visits send the current
            // short ID directly (see lib/tokens.js's resolveMarkerAlias).
            // Fire-and-forget: never blocks showing the page.
            if (result?.reassignMarker && result.reassignMarker !== persistentMarker) {
              setDeviceMarker(result.reassignMarker);
              setPersistentMarker(result.reassignMarker);
            }
            if (result?.verdict === 'blocked') {
              setBlockReason(result.reason ?? null);
              setBlockCountryName(result.countryName ?? null);
              setStatus('blocked');
            } else if (result?.verdict === 'unverified') {
              setReason(result.reason ?? 'check-api-error');
              setStatus('unverified');
            } else {
              setStatus('allowed');
            }
          })
          .catch(() => {
            if (cancelled || resolvedRef.current) return;
            resolvedRef.current = true;
            setReason('network-error');
            setStatus('unverified');
          })
          .finally(() => clearTimeout(checkTimeout));
      })
      .catch(() => {
        if (cancelled || resolvedRef.current) return;
        resolvedRef.current = true;
        clearTimeout(watchdog);
        setReason('fingerprint-error');
        setStatus('unverified');
      });

    return () => { cancelled = true; clearTimeout(watchdog); };
  }, [consent]);

  if (consent === null) {
    return (
      <div className="gate-overlay">
        <div className="gate-overlay-bg" />
        <div className="gate-spinner" />
      </div>
    );
  }

  if (consent === 'needed' || consent === 'declined') {
    return (
      <div className="fp-screen">
        <div className="fp-screen-bg" />
        <div className="fp-card fp-card--consent">
          {consent === 'needed' ? (
            <>
              <h1 className="fp-h1--consent">{CONSENT_TEXT.title}</h1>
              <p className="fp-p">{CONSENT_TEXT.intro}</p>
              <ul className="fp-consent-list">
                {CONSENT_TEXT.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="fp-p">{CONSENT_TEXT.purpose}</p>
              <p className="fp-p--small">{CONSENT_TEXT.policyNote}</p>
              <div className="fp-consent-buttons">
                <button
                  className="fp-consent-accept"
                  onClick={() => { writeConsent(); setConsent('granted'); }}
                >
                  {CONSENT_TEXT.accept}
                </button>
                <button className="fp-consent-decline" onClick={() => setConsent('declined')}>
                  {CONSENT_TEXT.decline}
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="fp-h1--consent">{CONSENT_TEXT.declinedTitle}</h1>
              <p className="fp-p">{CONSENT_TEXT.declinedBody}</p>
              <div className="fp-consent-buttons">
                <button className="fp-consent-accept" onClick={() => setConsent('needed')}>
                  {CONSENT_TEXT.review}
                </button>
              </div>
              <p className="fp-p--small">
                Questions? Email{' '}
                <a href="mailto:support@tjbmanagementinc.com" className="fp-gradient-link">
                  support@tjbmanagementinc.com
                </a>
                .
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (status === 'checking') {
    return (
      <div className="gate-overlay">
        <div className="gate-overlay-bg" />
        <div className="gate-spinner" />
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div className="fp-screen">
        <div className="fp-screen-bg" />
        <div className="fp-card fp-card--blocked">
          <h1 className="fp-h1--blocked">Access Denied</h1>
          <p className="fp-banned-line">You have been permanently banned</p>
          <p className="fp-p">
            <span className="fp-c-cyan">from accessing</span><br />
            <span className="fp-c-pink">TJB Management Inc.'s</span><br />
            <span className="fp-c-purple">social media accounts and systems.</span>
          </p>
          {blockReasonLabel(blockReason, blockCountryName) && (
            <p className="fp-p">
              <span className="fp-reason-label">Reason: </span>
              <span className="fp-c-pink">{blockReasonLabel(blockReason, blockCountryName)}</span>
            </p>
          )}
          <p className="fp-p--final">
            <span className="fp-c-magenta">If you believe this was done in error,</span><br />
            <span className="fp-email-wrap">
              email{' '}
              <a href="mailto:support@tjbmanagementinc.com" className="fp-gradient-link">
                support@tjbmanagementinc.com
              </a>
            </span><br />
            <span className="fp-c-pink">for assistance.</span>
          </p>
          {deviceMarker && (
            <p className="fp-id-block">
              Your ID: <span className="fp-id-mono">{deviceMarker}</span>
              <br />
              <span className="fp-c-pink">(make sure to include this in your email,</span><br />
              <span className="fp-c-pink">otherwise we won&apos;t be able to identify you)</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === 'unverified') {
    return (
      <div className="fp-screen">
        <div className="fp-screen-bg" />
        <div className="fp-card fp-card--unverified">
          <h1 className="fp-h1--unverified">
            We are unable<br />
            to verify you.
          </h1>
          <p className="fp-p">
            <span className="fp-reason-label">Reason: </span>
            <span className="fp-c-pink">{reasonLabel(reason)}</span>
          </p>
          <button onClick={() => window.location.reload()} className="fp-reload">
            reload this page.
          </button>
          <p className="fp-p--small">
            Still not working?<br />
            Email{' '}
            <a href="mailto:support@tjbmanagementinc.com" className="fp-gradient-link">
              support@tjbmanagementinc.com
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GtaViBanner />
      <OpenInBrowserNotice />
      {children}
    </>
  );
}
