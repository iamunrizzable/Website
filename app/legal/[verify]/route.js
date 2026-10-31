import { NextResponse } from 'next/server';

const FILES = {
  'tiktok-developers-site-verification=4DwMqQPi2o4xTuuzoEsPVxZVHmktN0O9':
    'tiktok-developers-site-verification=4DwMqQPi2o4xTuuzoEsPVxZVHmktN0O9',
};

export async function GET(request, { params }) {
  const { verify } = params;
  const content = FILES[verify];
  if (content) {
    return new NextResponse(content, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  // Unknown /legal/<anything>: send to the home page, matching the site-wide
  // catch-all (app/[...slug]/page.js). The verification file above still wins.
  return NextResponse.redirect(new URL('/', request.url));
}
