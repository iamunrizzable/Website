import { randomBytes } from 'crypto';
import { getRedis } from '@/lib/tokens';
import { MEMORY_SEED } from '@/lib/hallie-memory-seed';

// Hallie's long-term memory and daily log (her MEMORY.md and
// memory/YYYY-MM-DD.md from OpenClaw). "My permanent memory is Tyler's
// only": nothing here is reachable without an admin session — the only
// callers are app/api/admin/hallie-memory and the admin chat tools.
//
// Stored as two JSON documents (plain get/set works on every Redis client
// this project supports). Seed entries live in code; an edit or delete is
// saved under the same id and wins.

const ENTRIES_KEY = 'hallie:memory:entries';
const LOG_KEY = 'hallie:memory:log';
const MAX_ENTRIES = 300;
const MAX_TEXT = 6000;
const MAX_LOG = 600;
const LOG_DAYS = 30;
const mem = new Map();

// "NEVER write tokens into memory": anything that looks like a credential
// is replaced before it is stored.
const SECRET_PATTERNS = [
  /\b(ghp|gho|ghu|ghs|github_pat|vcp|gsk|xox[abp]|sk|pk|rk)[-_][A-Za-z0-9_\-]{16,}/g,
  /\b(eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{6,})/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\b((?:pass(?:word|wd)?|secret|token|api[_ -]?key)\s*(?:is|=|:)\s*)(?!\[|<|not |never |in |stored|the |\()\S{6,}/gi,
  /\b[A-Za-z0-9_\-]{40,}\b/g,
];

export function redactSecrets(text) {
  let out = String(text ?? '');
  let count = 0;
  for (const re of SECRET_PATTERNS) {
    out = out.replace(re, (m, prefix) => { count++; return (typeof prefix === 'string' && /[=:]|is\s*$/i.test(prefix) ? prefix : '') + '[redacted secret]'; });
  }
  return { text: out, count };
}

const cleanTags = (tags) => [...new Set((Array.isArray(tags) ? tags : String(tags ?? '').split(','))
  .map((t) => String(t).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32))
  .filter(Boolean))].slice(0, 8);

async function read(key, fallback) {
  const redis = getRedis();
  const raw = redis ? await redis.get(key) : mem.get(key);
  if (!raw) return fallback;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return fallback; }
}

async function write(key, value) {
  const redis = getRedis();
  if (redis) await redis.set(key, JSON.stringify(value));
  else mem.set(key, JSON.stringify(value));
}

// Seed + stored, minus deleted. Newest first.
export async function listMemory() {
  const stored = await read(ENTRIES_KEY, {});
  const out = [];
  for (const s of MEMORY_SEED) {
    const o = stored[s.id];
    if (o?.deleted) continue;
    out.push(o ?? { ...s, source: 'backup', updatedAt: 0 });
  }
  for (const [id, e] of Object.entries(stored)) {
    if (!e.deleted && !MEMORY_SEED.some((s) => s.id === id)) out.push(e);
  }
  return out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getMemory(id) {
  return (await listMemory()).find((e) => e.id === id) ?? null;
}

const terms = (q) => [...new Set((String(q ?? '').toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? []).filter((w) => w.length > 2))];

export async function searchMemory({ query = '', tags = [], limit = 6 } = {}) {
  const want = cleanTags(tags);
  const words = terms(query);
  const all = await listMemory();
  if (!want.length && !words.length) return all.slice(0, limit);
  return all
    .map((e) => {
      const hay = `${e.section}\n${e.text}`.toLowerCase();
      let score = want.filter((t) => e.tags?.includes(t)).length * 5;
      for (const w of words) {
        if (e.tags?.some((t) => t.includes(w))) score += 3;
        if (e.section.toLowerCase().includes(w)) score += 3;
        score += Math.min(hay.split(w).length - 1, 5);
      }
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(20, limit)))
    .map((x) => x.e);
}

// Create (no id) or update (id). Returns { entry, redacted }.
export async function rememberMemory({ id, section, tags, text, source = 'tyler' }) {
  const stored = await read(ENTRIES_KEY, {});
  const existing = id ? (await getMemory(id)) : null;
  if (id && !existing) throw new Error('No memory with that id.');
  const r = redactSecrets(String(text ?? '').trim().slice(0, MAX_TEXT));
  const sec = redactSecrets(String(section ?? existing?.section ?? '').replace(/\s+/g, ' ').trim().slice(0, 120));
  if (!r.text) throw new Error('Nothing to remember: text is empty.');
  if (!sec.text) throw new Error('A memory needs a section (a short title).');
  if (!existing && Object.values(stored).filter((e) => !e.deleted).length >= MAX_ENTRIES) {
    throw new Error(`Memory is full (${MAX_ENTRIES} entries). Forget something first.`);
  }
  const now = Date.now();
  const entry = {
    id: existing?.id ?? `m-${randomBytes(6).toString('hex')}`,
    section: sec.text,
    tags: cleanTags(tags ?? existing?.tags ?? []),
    text: r.text,
    source: existing?.source === 'backup' ? 'backup (edited)' : (existing?.source ?? source),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  stored[entry.id] = entry;
  await write(ENTRIES_KEY, stored);
  return { entry, redacted: r.count + sec.count };
}

export async function forgetMemory(id) {
  const existing = await getMemory(id);
  if (!existing) return false;
  const stored = await read(ENTRIES_KEY, {});
  if (MEMORY_SEED.some((s) => s.id === id)) stored[id] = { id, deleted: true, updatedAt: Date.now() };
  else delete stored[id];
  await write(ENTRIES_KEY, stored);
  return true;
}

// Daily log. Dates are Tyler's (Eastern) days.
const easternDay = (ts) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date(ts));

export async function logNote(text, source = 'hallie') {
  const r = redactSecrets(String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, 1000));
  if (!r.text) throw new Error('Nothing to log: text is empty.');
  const cutoff = Date.now() - LOG_DAYS * 86400_000;
  const log = (await read(LOG_KEY, [])).filter((n) => n.ts >= cutoff);
  const note = { id: `n-${randomBytes(5).toString('hex')}`, ts: Date.now(), day: easternDay(Date.now()), text: r.text, source };
  log.unshift(note);
  await write(LOG_KEY, log.slice(0, MAX_LOG));
  return { note, redacted: r.count };
}

export async function readLog(days = 7) {
  const d = Math.max(1, Math.min(LOG_DAYS, Number(days) || 7));
  const cutoff = Date.now() - d * 86400_000;
  return (await read(LOG_KEY, [])).filter((n) => n.ts >= cutoff);
}

export async function forgetNote(id) {
  const log = await read(LOG_KEY, []);
  const next = log.filter((n) => n.id !== id);
  if (next.length === log.length) return false;
  await write(LOG_KEY, next);
  return true;
}

// Split a MEMORY.md-style file into entries: "## Heading" starts one, a
// "**Tags:** a, b" line sets its tags. Nothing is stored here.
export function parseMemoryMarkdown(markdown) {
  const out = [];
  let cur = null;
  for (const line of String(markdown ?? '').slice(0, 400_000).split(/\r?\n/)) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) { cur = { section: h[1].replace(/[*_`]/g, '').slice(0, 120), tags: [], lines: [] }; out.push(cur); continue; }
    if (!cur) continue;
    const t = line.match(/^\*\*Tags:\*\*\s*(.+)$/i);
    if (t) { cur.tags = cleanTags(t[1]); continue; }
    if (/^---+\s*$/.test(line)) continue;
    cur.lines.push(line.replace(/<!--[\s\S]*?-->/g, '').trimEnd());
  }
  return out
    .map((e) => {
      const r = redactSecrets(e.lines.join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_TEXT));
      return { section: e.section, tags: e.tags, text: r.text, redacted: r.count };
    })
    .filter((e) => e.text);
}
