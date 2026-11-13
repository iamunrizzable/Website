import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/hallie-identity';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('acct_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  clearSessionCookie(response);
  return response;
}
