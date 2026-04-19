import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // TikTok domain verification — serve file content at /legal/tiktok*
  if (pathname.startsWith('/legal/tiktok')) {
    return new NextResponse(
      'tiktok-developers-site-verification=4DwMqQPi2o4xTuuzoEsPVxZVHmktN0O9',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  // Protect /admin UI with HTTP Basic Auth (allow .txt files through for verification)
  if (pathname.startsWith('/admin') && !pathname.endsWith('.txt')) {
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
  matcher: ['/admin/:path*', '/legal/tiktok:path*'],
};
