// A device marker stored redundantly across localStorage, IndexedDB, and
// the Cache API, so a banned device stays identifiable even if some (but
// not all) of that storage gets cleared. This is a genuinely different
// mechanism from the passive canvas/WebGL/audio fingerprint in
// collect.js — it's an actively-stored value, not a derived signal — and
// exists purely to give checkDeviceAgainstBlocklist (lib/tokens.js) a
// fast, exact match against a device that's already been confirmed bad.
// It is NOT a substitute for the fingerprint: someone who wipes all three
// storages at once still gets a fresh marker, same as clearing cookies
// always has. Disclosed by name in app/legal/privacy/policy/page.js —
// keep that page in sync with what this file actually does.

const STORAGE_KEY = 'tjb_device_marker';
const IDB_NAME = 'tjb-device-marker-db';
const IDB_STORE = 'markers';
const CACHE_NAME = 'tjb-device-marker-cache';
const CACHE_URL = '/__device_marker__';

// 8 random bytes -> 16 hex characters. Well within the admin blocklist's
// [A-Za-z0-9]{10,64} validation, and 64 bits of a well-distributed random
// value is still astronomically collision-resistant at any realistic
// visitor count for this site (birthday-bound collisions need billions of
// distinct devices before becoming a real risk) — this is a device label
// for a small site's admin panel, not a security credential, so it has no
// use for cryptographic-strength length.
function generateMarker() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readLocalStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLocalStorage(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore — private-browsing/storage-blocked browsers just don't get
    // this layer; the fingerprint in collect.js still applies.
  }
}

function openIdb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error('no indexedDB')); return; }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) {
        req.result.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readIdb() {
  try {
    const db = await openIdb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(STORAGE_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function writeIdb(value) {
  try {
    const db = await openIdb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, STORAGE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

async function readCache() {
  try {
    if (!window.caches) return null;
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match(CACHE_URL);
    return res ? (await res.text()) || null : null;
  } catch {
    return null;
  }
}

async function writeCache(value) {
  try {
    if (!window.caches) return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(CACHE_URL, new Response(value));
  } catch {
    // ignore
  }
}

let cached;

// Returns the device marker, generating one on first call and self-healing
// any storage that's missing it (e.g. localStorage was cleared but
// IndexedDB wasn't). Cached per page-session so repeated callers (DeviceGate
// + the ?fpdebug=1 debug bar) share one read/write pass.
export async function getPersistentMarker() {
  if (!cached) {
    cached = (async () => {
      const [ls, idb, cache] = await Promise.all([
        Promise.resolve(readLocalStorage()),
        readIdb(),
        readCache(),
      ]);
      const marker = ls || idb || cache || generateMarker();

      const writes = [];
      if (ls !== marker) writes.push(Promise.resolve(writeLocalStorage(marker)));
      if (idb !== marker) writes.push(writeIdb(marker));
      if (cache !== marker) writes.push(writeCache(marker));
      await Promise.all(writes);

      return marker;
    })();
  }
  return cached;
}

// Forces the marker to a server-provided value across all three storage
// layers — used by app/DeviceGate.js when /api/fingerprint/check responds
// with `reassignMarker`, for a visitor whose browser still holds a
// pre-shortening 32-char marker that's since been renamed server-side (see
// lib/tokens.js's resolveMarkerAlias). Updates the same module-level cache
// getPersistentMarker() reads, so any later call in this page-session
// (e.g. the ?fpdebug=1 debug bar) sees the new value immediately, and every
// future visit sends it directly without needing the alias lookup again.
export async function setPersistentMarker(marker) {
  cached = Promise.resolve(marker);
  await Promise.all([
    Promise.resolve(writeLocalStorage(marker)),
    writeIdb(marker),
    writeCache(marker),
  ]);
}
