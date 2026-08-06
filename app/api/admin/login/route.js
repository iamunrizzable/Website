import { NextResponse } from 'next/server';
import { timingSafeEqual } from '@/lib/auth';
import { isLoginRateLimited, recordFailedLogin, clearLoginAttempts } from '@/lib/tokens';

function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

export async function POST(request) {
  const ip = clientIp(request);

  if (await isLoginRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const { username, password } = await request.json();

  const validUsername = !process.env.ADMIN_USERNAME || username === process.env.ADMIN_USERNAME;
  const validPassword = typeof password === 'string' && !!process.env.ADMIN_SECRET && timingSafeEqual(password, process.env.ADMIN_SECRET);

  if (!validUsername || !validPassword) {
    await recordFailedLogin(ip);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await clearLoginAttempts(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_session', process.env.ADMIN_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });
  return response;
}
