import { NextResponse } from 'next/server';
import { getTikTokAccountToken } from '@/lib/tokens';

// Public, unauthenticated status endpoint — deliberately returns only
// Operational/Degraded/Down + a short label per service, never raw tokens,
// keys, or connection IDs. Checks are real (derived from actual stored
// state / env presence each call) but cheap: no outbound TikTok API calls
// on every page load, since this route is publicly reachable and repeat
// visits shouldn't hit rate limits or cost money.

function checkHallieWriter() {
  if (!process.env.GROQ_API_KEY) return { status: 'down', label: 'Not configured' };
  return { status: 'operational', label: 'Operational' };
}

async function checkModerationSystem() {
  try {
    const token = await getTikTokAccountToken();
    if (!token) return { status: 'down', label: 'Not connected' };
    const expired = token.expires_at && Date.now() > token.expires_at;
    if (expired) return { status: 'degraded', label: 'Reconnect required' };
    // A read-only open_id token (no numeric business_id) can list content
    // but comment actions (hide/pin/reply) silently fail — see
    // tiktok-tokens-and-oauth skill.
    if (!token.business_id) return { status: 'degraded', label: 'Read-only connection' };
    return { status: 'operational', label: 'Operational' };
  } catch {
    return { status: 'down', label: 'Unavailable' };
  }
}

function checkAdminPanel() {
  if (!process.env.ADMIN_SECRET) return { status: 'down', label: 'Not configured' };
  return { status: 'operational', label: 'Operational' };
}

export async function GET() {
  const [hallie, moderation] = await Promise.all([
    Promise.resolve(checkHallieWriter()),
    checkModerationSystem(),
  ]);
  const admin = checkAdminPanel();

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    services: [
      { name: 'Website', ...{ status: 'operational', label: 'Operational' } },
      { name: 'Hallie™ Writer', ...hallie },
      { name: 'TikTok Moderation System', ...moderation },
      { name: 'Admin Panel', ...admin },
    ],
  });
}
