import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // TikTok domain verification
  if (pathname.startsWith('/legal/tiktok')) {
    return new NextResponse(
      'tiktok-developers-site-verification=4DwMqQPi2o4xTuuzoEsPVxZVHmktN0O9',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  // Login page and login API always pass through
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  // Protect /admin/* and /api/admin/me with session cookie
  if (pathname.startsWith('/admin') || pathname === '/api/admin/me') {
    const session = request.cookies.get('admin_session')?.value;
    if (session !== process.env.ADMIN_SECRET) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Refresh cookie on every valid request so it never expires
    const response = NextResponse.next();
    response.cookies.set('admin_session', process.env.ADMIN_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 400,
      path: '/',
    });
    return response;
  }
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/me', '/api/admin/login', '/legal/tiktok:path*'],
};
