import { NextResponse } from 'next/server';
import { getBlockQueue, removeFromBlockQueue } from '@/lib/tokens';
import { blockTikTokUser } from '@/lib/tiktok/browser';
import { isValidCronSecret } from '@/lib/auth';

export const maxDuration = 60;

// GET /api/cron/process-blocks — runs hourly, blocks queued users via browser automation
export async function GET(request) {
  if (!isValidCronSecret(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const queue = await getBlockQueue();
  if (!queue.length) return NextResponse.json({ processed: 0, results: [] });

  const results = [];

  for (const username of queue) {
    try {
      await blockTikTokUser(username);
      await removeFromBlockQueue(username);
      results.push({ username, blocked: true });
      console.log(`[process-blocks] Blocked @${username}`);
    } catch (err) {
      results.push({ username, blocked: false, error: err.message });
      // Leave in queue to retry next hour, unless cookies are missing
      if (err.message === 'NO_BROWSER_COOKIES') break;
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
