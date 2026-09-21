// Six independent, individually weak private-browsing probes. The classic
// single-signal technique (navigator.storage.estimate() quota under
// ~120MB) is confirmed BROKEN as of Chrome's 2026 storage-quota changes —
// Chrome now allocates far more by default and ships a "predictable
// reported storage quota" mitigation specifically to defeat it. Current
// best practice (per research done for this feature) is multiple
// independent probes instead of one strong signal — see
// lib/deviceSignals.js's scorePrivacySignals() for how these combine.
// Deliberately independent of device *identification* (persistentMarker,
// lib/fingerprint/persistentMarker.js) — these probes can vary session-to-
// session for the same physical device (a private window vs. a normal
// one), which would corrupt identification rather than inform it. Feeds
// enrichment only (lib/deviceSignals.js's scorePrivacySignals).
const PROBE_DB_NAME = '__tjb_privacy_probe__';
const PROBE_CACHE_NAME = '__tjb_privacy_probe__';

async function probeServiceWorker() {
  try {
    if (!('serviceWorker' in navigator)) return true;
    await navigator.serviceWorker.getRegistrations();
    return false;
  } catch {
    return true;
  }
}

async function probeIndexedDb() {
  try {
    if (!window.indexedDB) return true;
    await new Promise((resolve, reject) => {
      const req = indexedDB.open(PROBE_DB_NAME, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore('probe'); };
      req.onsuccess = () => { req.result.close(); resolve(); };
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('blocked'));
    });
    // Throwaway probe database — clean it up immediately rather than
    // leaving it sitting on the origin.
    indexedDB.deleteDatabase(PROBE_DB_NAME);
    return false;
  } catch {
    return true;
  }
}

async function probeCacheStorage() {
  try {
    if (!window.caches) return true;
    await caches.open(PROBE_CACHE_NAME);
    await caches.delete(PROBE_CACHE_NAME);
    return false;
  } catch {
    return true;
  }
}

async function probeOpfs() {
  try {
    if (!navigator.storage?.getDirectory) return true;
    await navigator.storage.getDirectory();
    return false;
  } catch {
    return true;
  }
}

function probeBroadcastChannel() {
  try {
    if (typeof BroadcastChannel === 'undefined') return true;
    const ch = new BroadcastChannel(PROBE_CACHE_NAME);
    ch.close();
    return false;
  } catch {
    return true;
  }
}

// Existence-only, deliberately never instantiated — SharedWorker needs a
// same-origin script URL, and a data: URL (the only script-less option)
// would trip this site's own CSP (script-src has no data: allowance by
// design — see middleware.js). A weaker check, but one that can't regress
// the CSP hardening done elsewhere in this app.
function probeSharedWorker() {
  return typeof SharedWorker === 'undefined';
}

export async function collectPrivacySignals() {
  try {
    const [serviceWorkerBlocked, indexedDbBlocked, cacheStorageBlocked, opfsBlocked] = await Promise.all([
      probeServiceWorker(),
      probeIndexedDb(),
      probeCacheStorage(),
      probeOpfs(),
    ]);
    return {
      serviceWorkerBlocked,
      indexedDbBlocked,
      cacheStorageBlocked,
      opfsBlocked,
      broadcastChannelBlocked: probeBroadcastChannel(),
      sharedWorkerBlocked: probeSharedWorker(),
    };
  } catch {
    return null;
  }
}
