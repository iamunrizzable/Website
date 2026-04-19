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
}

export const config = {
  matcher: ['/legal/tiktok:path*'],
};
