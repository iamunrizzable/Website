// Costa City game build storage. The game is a private single HTML file, so it
// lives in Redis (gzipped, base64) and is never committed to this public repo.
import { gzipSync, gunzipSync } from 'node:zlib';
import { getRedis } from '@/lib/tokens';

const KEY = 'costa-city:build';
const mem = new Map();

export async function saveBuild(html) {
  const packed = JSON.stringify({ at: Date.now(), size: html.length, gz: gzipSync(Buffer.from(html, 'utf8')).toString('base64') });
  const redis = getRedis();
  if (redis) await redis.set(KEY, packed); else mem.set(KEY, packed);
}

async function raw() {
  const redis = getRedis();
  const v = redis ? await redis.get(KEY) : mem.get(KEY);
  if (!v) return null;
  try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return null; }
}

export async function loadBuild() {
  const d = await raw();
  return d ? gunzipSync(Buffer.from(d.gz, 'base64')).toString('utf8') : null;
}

export async function buildInfo() {
  const d = await raw();
  return d ? { at: d.at, size: d.size } : null;
}
