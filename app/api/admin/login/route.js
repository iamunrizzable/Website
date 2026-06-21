import { NextResponse } from 'next/server';

export async function POST(request) {
  const { username, password } = await request.json();

  const validUsername = !process.env.ADMIN_USERNAME || username === process.env.ADMIN_USERNAME;
  const validPassword = password === process.env.ADMIN_SECRET;

  if (!validUsername || !validPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_session', process.env.ADMIN_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return response;
}
