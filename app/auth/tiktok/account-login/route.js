import { NextResponse } from 'next/server';
import { getTikTokAccountAuthUrl } from '@/lib/tiktok/business-oauth';
import { generateState } from '@/lib/oauth-state';
import { absoluteUrl } from '@/lib/site-url';
import { isValidAdminKey } from '@/lib/auth';

async function isAdmin(request) {
  return isValidAdminKey(request);
}

export async function GET(request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const state = generateState();
    const url = getTikTokAccountAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('[account-login] Failed to build TikTok auth URL:', err.message);
    return NextResponse.redirect(absoluteUrl(`/admin/internal/hallie/tiktok/moderation/system?error=${encodeURIComponent(err.message)}`));
  }
}
