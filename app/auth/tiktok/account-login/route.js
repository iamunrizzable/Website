import { NextResponse } from 'next/server';
import { getTikTokAccountAuthUrl } from '@/lib/tiktok/business-oauth';
import { generateState } from '@/lib/oauth-state';

async function isAdmin(request) {
  const adminKey = request.headers.get('x-admin-key') ?? new URL(request.url).searchParams.get('key');
  if (adminKey === process.env.ADMIN_SECRET) return true;
  const { cookies } = await import('next/headers');
  const session = (await cookies()).get('admin_session')?.value;
  return session === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const state = generateState();
  const url = getTikTokAccountAuthUrl(state);
  return NextResponse.redirect(url);
}
