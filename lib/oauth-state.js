import crypto from 'crypto';

export function generateState() {
  const nonce = crypto.randomBytes(16).toString('hex');
  const sig = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET)
    .update(nonce)
    .digest('hex');
  return `${nonce}.${sig}`;
}

export function verifyState(state) {
  if (!state) return false;
  const dot = state.lastIndexOf('.');
  if (dot === -1) return false;
  const nonce = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET)
    .update(nonce)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}
