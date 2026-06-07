import { NextResponse } from 'next/server';
import { getBrowserCookies, setBrowserCookies, getBlockQueue } from '@/lib/tokens';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const cookies = await getBrowserCookies();
  const queue = await getBlockQueue();
  return NextResponse.json({
    hasCookies: !!(cookies?.length),
    cookieCount: cookies?.length ?? 0,
    blockQueue: queue,
  });
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { cookies } = await request.json().catch(() => ({}));
  if (!Array.isArray(cookies) || cookies.length === 0) {
    return NextResponse.json({ error: 'cookies must be a non-empty array' }, { status: 400 });
  }
  // Normalize Cookie Editor / browser extension export format to Puppeteer format
  const normalized = cookies.map((c) => ({
    name: c.name,
    value: c.value,
    domain: c.domain || '.tiktok.com',
    path: c.path || '/',
    secure: c.secure ?? true,
    httpOnly: c.httpOnly ?? false,
    sameSite: c.sameSite || 'None',
    expires: c.expirationDate ?? c.expires ?? -1,
  }));
  await setBrowserCookies(normalized);
  return NextResponse.json({ saved: normalized.length });
}
