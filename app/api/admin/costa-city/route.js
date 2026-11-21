import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAdminSessionValid } from '@/lib/auth';
import { saveBuild, loadBuild, buildInfo } from '@/lib/costa-city';

export const dynamic = 'force-dynamic';

const deny = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// GET → the game page itself; GET ?status=1 → { uploaded, at, size }
export async function GET(request) {
  if (!(await isAdminSessionValid(await cookies()))) return deny();
  if (new URL(request.url).searchParams.get('status')) {
    const info = await buildInfo();
    return NextResponse.json({ uploaded: !!info, ...(info || {}) });
  }
  const html = await loadBuild();
  if (!html) return new NextResponse('No build uploaded yet.', { status: 404 });
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// POST (raw HTML body) → replace the stored build
export async function POST(request) {
  if (!(await isAdminSessionValid(await cookies()))) return deny();
  const html = await request.text();
  if (html.length > 3_000_000 || !html.includes('<title>Costa City</title>')) {
    return NextResponse.json({ error: 'That is not a Costa City build (or it is over 3 MB).' }, { status: 400 });
  }
  await saveBuild(html);
  return NextResponse.json({ ok: true, ...(await buildInfo()) });
}
