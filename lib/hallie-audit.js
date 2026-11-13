import { createHash } from 'crypto';
import { getRedis, countHit } from '@/lib/tokens';
import { sendSecurityAlert } from '@/lib/email/alerts';

// Hallie's security log, moved here from the VM relay (its audit.log).
// From her SOUL.md: "Audit logging on all forbidden access attempts. If
// someone tries to access protected resources, log it and notify Tyler
// immediately." What is stored matches the Hallie Terms ("Security logs"):
// a short excerpt of the triggering message and an identifier derived from
// the connection's IP address. Never the raw IP, never the whole chat.

const KEY = 'hallie:audit';
const MAX = 200;
const mem = [];

// The relay's INJECTION_HINTS, plus the things her soul says only Tyler may
// ask for: her instructions, memory, backups, model, and secrets.
const HINTS = [
  ['injection', /ignore (all |any |the |your )?(previous|prior|above|earlier)|system prompt|developer mode|jailbreak|you are now|act as (an? )?(admin|developer|root)|(reveal|show|print|repeat|output|tell me) (me )?(your|the) (rules|prompt|instructions)|disregard (your|all|the) (rules|instructions)/i],
  ['impersonation', /\b(i am|i'm|im|this is|it's) (tyler|the (site )?(owner|admin|administrator|developer)|your (owner|creator|developer|boss|admin))\b[\s\S]{0,200}\b(password|override|unlock|access|memory|instructions|rules|disable|ignore|give me|show me|let me|admin)\b/i],
  ['memory', /\b(show|give|dump|export|print|read|send|tell)\b[\s\S]{0,30}\byour (memory|memories|shadowdb|soul|memory file|long.?term memory)\b|\b(other|another) (user|visitor|person|people)('s|s')? (chat|conversation|message)s?\b/i],
  ['backup', /\b(backup|copy|export|dump) of your (files|memory|soul|config|data)\b|\bsend me your (files|backup|config)\b/i],
  ['model', /\b(change|swap|switch|replace) your (model|llm|ai model)\b/i],
  ['secrets', /\b(your|the site'?s?|the admin|tyler'?s|tjb'?s?) [\w ]{0,20}(password|api key|api keys|token|tokens|secret|secrets|credentials|env(ironment)? variables?)\b|\badmin (password|login code|authenticator code)\b/i],
];

export function detectForbidden(message) {
  const text = String(message ?? '').slice(0, 4000);
  return HINTS.filter(([, re]) => re.test(text)).map(([name]) => name);
}

export const ipTag = (ip) => createHash('sha256').update(`hallie-audit:${ip}`).digest('hex').slice(0, 12);

async function push(entry) {
  const redis = getRedis();
  if (redis) {
    await redis.lpush(KEY, JSON.stringify(entry));
    await redis.ltrim(KEY, 0, MAX - 1);
  } else {
    mem.unshift(entry);
    mem.length = Math.min(mem.length, MAX);
  }
}

export async function getAuditLog(count = 50) {
  const n = Math.max(1, Math.min(MAX, Number(count) || 50));
  const redis = getRedis();
  const rows = redis ? await redis.lrange(KEY, 0, n - 1) : mem.slice(0, n);
  return (rows ?? []).map((r) => { try { return typeof r === 'string' ? JSON.parse(r) : r; } catch { return null; } }).filter(Boolean);
}

// Call for every non-admin chat message. Never throws, never blocks a reply.
export async function auditChatMessage({ message, ip, surface }) {
  try {
    const kinds = detectForbidden(message);
    if (!kinds.length) return null;
    const tag = ipTag(ip || 'unknown');
    const entry = { t: new Date().toISOString(), event: 'forbidden_attempt', kinds, surface, ip: tag, preview: String(message).replace(/\s+/g, ' ').slice(0, 200) };
    // One person hammering the chat fills neither the log nor Tyler's inbox.
    if ((await countHit(`audit:log:${tag}`, 3600)) <= 20) await push(entry);
    const perVisitor = await countHit(`audit:mail:${tag}`, 3600);
    const perDay = perVisitor === 1 ? await countHit('audit:mail:all', 86400) : 99;
    if (perVisitor === 1 && perDay <= 10) await sendSecurityAlert(entry);
    return entry;
  } catch (err) {
    console.error('[hallie-audit] failed:', err?.message ?? err);
    return null;
  }
}
