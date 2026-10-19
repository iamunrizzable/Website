import { NextResponse } from 'next/server';
import { timingSafeEqual, createAdminSession, adminSessionCookieOptions } from '@/lib/auth';
import { verifyTotp } from '@/lib/totp';
import { isLoginRateLimited, recordFailedLogin, clearLoginAttempts } from '@/lib/tokens';

function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

export async function POST(request) {
  const ip = clientIp(request);

  if (await isLoginRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const { username, password, code } = await request.json();

  const validUsername = !process.env.ADMIN_USERNAME || username === process.env.ADMIN_USERNAME;
  const validPassword = typeof password === 'string' && !!process.env.ADMIN_SECRET && timingSafeEqual(password, process.env.ADMIN_SECRET);

  // Authenticator code is required; with no ADMIN_TOTP_SECRET set, admin
  // login is closed rather than silently falling back to password-only.
  let validCode = false;
  try {
    validCode = verifyTotp(typeof code === 'string' ? code : '');
  } catch (err) {
    console.error('[admin login] totp:', err.message);
  }

  if (!validUsername || !validPassword || !validCode) {
    await recordFailedLogin(ip);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await clearLoginAttempts(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_session', await createAdminSession(), adminSessionCookieOptions());
  return response;
}
