// Authenticator-app codes for the admin login (RFC 6238 TOTP: HMAC-SHA1,
// 30-second steps, 6 digits), compatible with Oracle Mobile Authenticator,
// Google Authenticator, 1Password, etc. The shared secret is the base32
// ADMIN_TOTP_SECRET env var. Node runtime only (route handlers).
import crypto from 'node:crypto';
import { timingSafeEqual } from '@/lib/auth';

const STEP_SECONDS = 30;

function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = String(input).toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) throw new Error('ADMIN_TOTP_SECRET is not valid base32');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function totpCode(key, counter) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', key).update(msg).digest();
  const offset = h[h.length - 1] & 0xf;
  const n = (h.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(n).padStart(6, '0');
}

// Accepts the current code and one step either side (clock drift).
export function verifyTotp(code, secret = process.env.ADMIN_TOTP_SECRET, now = Date.now()) {
  if (!secret || typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) return false;
  const key = base32Decode(secret);
  const counter = Math.floor(now / 1000 / STEP_SECONDS);
  let ok = false;
  for (let w = -1; w <= 1; w++) ok = timingSafeEqual(totpCode(key, counter + w), code.trim()) || ok;
  return ok;
}

export { base32Decode };
