import { NextResponse } from 'next/server';
import { getTikTokAccountAuthUrl } from '@/lib/tiktok/business-oauth';
import { generateState } from '@/lib/oauth-state';

export async function GET() {
  const state = generateState('system');
  const url = getTikTokAccountAuthUrl(state);
  return NextResponse.redirect(url);
}
