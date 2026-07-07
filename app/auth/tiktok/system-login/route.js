import { NextResponse } from 'next/server';
import { getTikTokAccountAuthUrl } from '@/lib/tiktok/business-oauth';
import { generateState } from '@/lib/oauth-state';
import { absoluteUrl } from '@/lib/site-url';

export async function GET() {
  try {
    const state = generateState('system');
    const url = getTikTokAccountAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('[system-login] Failed to build TikTok auth URL:', err.message);
    return NextResponse.redirect(
      absoluteUrl(`/hallie/tiktok-moderation/system?error=${encodeURIComponent('Connect is temporarily unavailable. Please try again shortly.')}`)
    );
  }
}
