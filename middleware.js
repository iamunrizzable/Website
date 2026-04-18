import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

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
  matcher: ['/admin/:path*'],
};
