import { NextResponse } from 'next/server';
import { issueSignedToken, presignUrl } from '@vercel/blob';
import { isValidAdminKey } from '@/lib/auth';

// Temporary: one-click download of the Hallie VM migration backup, stored in a
// PRIVATE Vercel Blob store. Admin session required (awaited — a missing
// await would silently disable auth). Hands out a presigned URL valid for
// 10 minutes, so the 600+ MB file never passes through a serverless function.
const PATHNAME = 'hallie-migration-20261101.zip';

export async function GET(request) {
  if (!(await isValidAdminKey(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const validUntil = Date.now() + 10 * 60 * 1000;
    const signed = await issueSignedToken({ pathname: PATHNAME, operations: ['get'], validUntil });
    const { presignedUrl } = await presignUrl(signed, {
      access: 'private',
      operation: 'get',
      pathname: PATHNAME,
      validUntil,
    });
    // ?link=1 shows the 10-minute link as plain text so it can be copied
    // (Safari otherwise goes straight into the download).
    if (new URL(request.url).searchParams.get('link') === '1') {
      return new NextResponse(presignedUrl, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
    const res = NextResponse.redirect(presignedUrl, 302);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Backup download is unavailable: ' + (err?.message ?? 'unknown error') }, { status: 500 });
  }
}

