import crypto from 'crypto';

// Chat widget (connected-account path): every tool that CHANGES the
// visitor's account state stops and asks for an on-screen Confirm tap
// before it runs. Flip this to false to let change tools run immediately.
// Read-only tools never ask, regardless of this setting.
export const REQUIRE_CONFIRMATION_FOR_CHANGES = true;

export function needsConfirmation(tool) {
  return REQUIRE_CONFIRMATION_FOR_CHANGES && Boolean(tool?.changesAccount);
}

// Pending-action tokens are stateless and tamper-proof:
//   base64url(JSON {tool, args, exp, nonce}) + "." + HMAC-SHA256 hex
// The HMAC (keyed by ADMIN_SECRET, never sent to the client) covers the
// payload AND the visitor's TikTok identity from their acct_token cookie.
// The identity is not in the payload — it's re-read from the cookie at
// confirm time, so a token only verifies for the same connected account.
const ACTION_TTL_MS = 5 * 60 * 1000;
const DOMAIN = 'hallie-chat-action:v1';

function sign(payloadB64, identity) {
  return crypto
    .createHmac('sha256', process.env.ADMIN_SECRET)
    .update(`${DOMAIN}\n${payloadB64}\n${identity}`)
    .digest('hex');
}

export function canSignActions() {
  return Boolean(process.env.ADMIN_SECRET);
}

export function signPendingAction({ tool, args, identity, now = Date.now() }) {
  if (!canSignActions()) throw new Error('Action signing is not configured');
  if (!identity) throw new Error('Missing account identity');
  const payload = { tool, args, exp: now + ACTION_TTL_MS, nonce: crypto.randomBytes(8).toString('hex') };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64, identity)}`;
}

// Returns { tool, args } when valid; otherwise { error } with one of
// 'invalid' (malformed, tampered, or a different account) or 'expired'.
export function verifyPendingAction(token, identity, now = Date.now()) {
  if (typeof token !== 'string' || !identity || !canSignActions()) return { error: 'invalid' };
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return { error: 'invalid' };
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payloadB64, identity);
  let ok = false;
  try {
    ok = sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    ok = false;
  }
  if (!ok) return { error: 'invalid' };

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return { error: 'invalid' };
  }
  if (!payload || typeof payload.tool !== 'string' || typeof payload.exp !== 'number') return { error: 'invalid' };
  if (now > payload.exp) return { error: 'expired' };
  return { tool: payload.tool, args: payload.args ?? {} };
}
