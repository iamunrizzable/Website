import { NextResponse } from 'next/server';
import { syncComments } from '@/lib/sync';
import { isValidCronSecret } from '@/lib/auth';

// GET /api/cron/sync-comments
// Called by Vercel Cron every 15 minutes. Auto-hides comments scoring ≥ 50.
export async function GET(request) {
  if (!isValidCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await syncComments({ autoHide: true });
    return NextResponse.json({ synced: results.length, ts: Date.now() });
  } catch (err) {
    if (err.message === 'ACCOUNT_NOT_AUTHENTICATED') {
      return NextResponse.json({ error: err.message, synced: 0 }, { status: 200 });
    }
    console.error('[cron/sync-comments]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
