import { createHash, randomBytes, createPrivateKey, sign, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/site-url';
import { safeReturnPath } from '@/lib/return-path';
import { generateState, verifyState } from '@/lib/oauth-state';
import { applySessionCookie, connectProvider, SESSION_COOKIE } from '@/lib/hallie-identity';

const PKCE_COOKIE = 'hallie_pkce';
const X_STATE_COOKIE = 'hallie_x_state';

export const LOGIN_PROVIDERS = {
  google: {
    label: 'Google',
    ready: () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },
  apple: {
    label: 'Apple',
    ready: () => Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY),
  },
  x: {
    label: 'X',
    ready: () => Boolean(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET),
  },
};

function callbackUrl(provider) {
  return absoluteUrl(`/auth/hallie/${provider}/callback`).toString();
}

function cookieBase(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  };
}

export function redirectBack(request, { error, sessionId } = {}) {
  const from = safeReturnPath(request.cookies.get('hallie_return')?.value)
    || safeReturnPath(new URL(request.url).searchParams.get('from'))
    || '/hallie/chat';
  const url = absoluteUrl(from);
  if (error) url.searchParams.set('error', String(error).slice(0, 180));
  const response = NextResponse.redirect(url);
  response.cookies.set('hallie_return', '', cookieBase(0));
  response.cookies.set(PKCE_COOKIE, '', cookieBase(0));
  response.cookies.set(X_STATE_COOKIE, '', cookieBase(0));
  if (sessionId) applySessionCookie(response, sessionId);
  return response;
}

export function beginLogin(request, provider) {
  const spec = LOGIN_PROVIDERS[provider];
  if (!spec) return NextResponse.json({ error: 'Unknown connection' }, { status: 404 });
  const from = safeReturnPath(new URL(request.url).searchParams.get('from'));
  if (!spec.ready()) {
    const url = absoluteUrl(from || '/hallie/chat');
    url.searchParams.set('error', `${spec.label} sign-in isn't set up yet.`);
    return NextResponse.redirect(url);
  }
  const state = provider === 'x' ? randomBytes(16).toString('hex') : generateState(`hallie-${provider}`);
  const { url, verifier } = authorizeUrl(provider, state);
  const response = NextResponse.redirect(url);
  response.cookies.set('hallie_return', from ?? '', cookieBase(from ? 600 : 0));
  if (provider === 'x') response.cookies.set(X_STATE_COOKIE, state, cookieBase(600));
  if (verifier) response.cookies.set(PKCE_COOKIE, verifier, cookieBase(600));
  return response;
}

function authorizeUrl(provider, state) {
  if (provider === 'google') {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
    url.searchParams.set('redirect_uri', callbackUrl('google'));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);
    url.searchParams.set('prompt', 'select_account');
    return { url };
  }
  if (provider === 'apple') {
    const url = new URL('https://appleid.apple.com/auth/authorize');
    url.searchParams.set('client_id', process.env.APPLE_CLIENT_ID);
    url.searchParams.set('redirect_uri', callbackUrl('apple'));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('response_mode', 'form_post');
    url.searchParams.set('scope', 'name email');
    url.searchParams.set('state', state);
    return { url };
  }
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const url = new URL('https://x.com/i/oauth2/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', process.env.X_CLIENT_ID);
  url.searchParams.set('redirect_uri', callbackUrl('x'));
  url.searchParams.set('scope', 'tweet.read users.read');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return { url, verifier };
}

async function postForm(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', ...headers },
    body: new URLSearchParams(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_description || data.error || 'Sign-in was rejected.');
  return data;
}

function jwtPayload(token) {
  const part = String(token ?? '').split('.')[1];
  if (!part) return {};
  return JSON.parse(Buffer.from(part, 'base64url').toString());
}

function appleClientSecret() {
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: process.env.APPLE_KEY_ID })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: process.env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 60 * 60 * 24 * 150,
    aud: 'https://appleid.apple.com',
    sub: process.env.APPLE_CLIENT_ID,
  })).toString('base64url');
  const pem = process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const key = createPrivateKey(pem);
  const sig = sign('SHA256', Buffer.from(`${header}.${payload}`), { key, dsaEncoding: 'ieee-p1363' });
  return `${header}.${payload}.${sig.toString('base64url')}`;
}

async function profileFor(provider, code, request, appleUser) {
  if (provider === 'google') {
    const token = await postForm('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: callbackUrl('google'),
      grant_type: 'authorization_code',
    });
    const info = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    }).then((r) => r.json());
    if (!info.sub) throw new Error('Google did not return an account.');
    return { subject: info.sub, label: info.email || info.name || 'Google' };
  }
  if (provider === 'apple') {
    const token = await postForm('https://appleid.apple.com/auth/token', {
      code,
      client_id: process.env.APPLE_CLIENT_ID,
      client_secret: appleClientSecret(),
      redirect_uri: callbackUrl('apple'),
      grant_type: 'authorization_code',
    });
    const claims = jwtPayload(token.id_token);
    if (!claims.sub) throw new Error('Apple did not return an account.');
    let label = claims.email || 'Apple';
    const posted = appleUser;
    if (posted?.name) {
      const name = [posted.name.firstName, posted.name.lastName].filter(Boolean).join(' ');
      if (name) label = name;
    }
    return { subject: claims.sub, label };
  }
  const verifier = request.cookies.get(PKCE_COOKIE)?.value;
  if (!verifier) throw new Error('Sign-in expired. Try again.');
  const basic = Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString('base64');
  const token = await postForm('https://api.x.com/2/oauth2/token', {
    code,
    grant_type: 'authorization_code',
    redirect_uri: callbackUrl('x'),
    code_verifier: verifier,
  }, { Authorization: `Basic ${basic}` });
  const me = await fetch('https://api.x.com/2/users/me', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  }).then((r) => r.json());
  const user = me.data;
  if (!user?.id) throw new Error('X did not return an account.');
  return { subject: user.id, label: user.username ? `@${user.username}` : 'X' };
}

export function xStateMatches(request, state) {
  const saved = request.cookies.get(X_STATE_COOKIE)?.value || '';
  if (!state || !saved || saved.length !== state.length) return false;
  return timingSafeEqual(Buffer.from(saved), Buffer.from(state));
}

export async function finishLogin(request, provider, code, state, appleUser) {
  const xOk = provider === 'x' && xStateMatches(request, state);
  if (!xOk && !verifyState(state || '')) {
    return NextResponse.json({ error: 'State mismatch — possible CSRF' }, { status: 400 });
  }
  if (!LOGIN_PROVIDERS[provider]?.ready()) {
    return redirectBack(request, { error: 'That sign-in is not set up yet.' });
  }
  try {
    const profile = await profileFor(provider, code, request, appleUser);
    const sessionId = await connectProvider({
      currentId: request.cookies.get(SESSION_COOKIE)?.value,
      provider,
      subject: profile.subject,
      label: profile.label,
    });
    return redirectBack(request, { sessionId });
  } catch (err) {
    console.error(`[hallie-login] ${provider}:`, err.message);
    return redirectBack(request, { error: err.message || 'Sign-in failed.' });
  }
}
