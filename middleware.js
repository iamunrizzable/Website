import { NextResponse } from 'next/server';

const TIKTOK_VERIFICATIONS = {
  'tiktok-developers-site-verification=4DwMqQPi2o4xTuuzoEsPVxZVHmktN0O9':
    'tiktok-developers-site-verification=4DwMqQPi2o4xTuuzoEsPVxZVHmktN0O9',
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Serve TikTok domain verification files under /legal/
  if (pathname.startsWith('/legal/')) {
    const segment = pathname.slice('/legal/'.length);
    const content = TIKTOK_VERIFICATIONS[segment];
    if (content) {
      return new NextResponse(content, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  // Protect /admin UI with HTTP Basic Auth
  if (pathname.startsWith('/admin')) {
    const auth = request.headers.get('authorization');
    if (auth?.startsWith('Basic ')) {
      const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
      const [, password] = decoded.split(':');
      if (password === process.env.ADMIN_SECRET) {
        return NextResponse.next();
      }
    }
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="TJB Admin"' },
    });
  }
}

export const config = {
  matcher: ['/admin/:path*', '/legal/:path*'],
};
