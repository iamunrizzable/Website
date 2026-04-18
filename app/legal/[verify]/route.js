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
  return new NextResponse('Not Found', { status: 404 });
}
