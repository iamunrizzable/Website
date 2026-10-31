import { NextResponse } from 'next/server';

// Target of the fallback rewrite in next.config.js: an unknown URL lands
// here and gets a real HTTP 307 to the home page.
export function GET(request) {
  return NextResponse.redirect(new URL('/', request.url), 307);
}

export const HEAD = GET;
