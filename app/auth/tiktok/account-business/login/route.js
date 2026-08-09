import { NextResponse } from 'next/server';
import { getBusinessAuthUrl } from '@/lib/tiktok/business-oauth';
import { generateState } from '@/lib/oauth-state';
import { absoluteUrl } from '@/lib/site-url';
import { isValidAdminKey } from '@/lib/auth';

export async function GET(request) {
  if (!isValidAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const state = generateState('acct');
    const url = getBusinessAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('[account-business/login] Failed to build TikTok auth URL:', err.message);
    return NextResponse.redirect(absoluteUrl(`/admin/internal/hallie/tiktok-moderation/system?error=${encodeURIComponent(err.message)}`));
  }
}
