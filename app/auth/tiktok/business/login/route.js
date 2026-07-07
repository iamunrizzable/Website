import { NextResponse } from 'next/server';
import { getBusinessAuthUrl } from '@/lib/tiktok/business-oauth';
import { generateState } from '@/lib/oauth-state';
import { absoluteUrl } from '@/lib/site-url';

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

  try {
    const state = generateState();
    const url = getBusinessAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('[business/login] Failed to build TikTok auth URL:', err.message);
    return NextResponse.redirect(absoluteUrl(`/admin?error=${encodeURIComponent(err.message)}`));
  }
}
