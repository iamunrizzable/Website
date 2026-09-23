import { NextResponse } from 'next/server';
import { getTikTokAccountToken, isSiteInMaintenance, isTikTokSuspended, isC2Suspended } from '@/lib/tokens';

// Public, unauthenticated status endpoint — deliberately returns only
// Operational/Degraded/Down + a short label per service, never raw tokens,
// keys, or connection IDs. Checks are real (derived from actual stored
// state / env presence each call) but cheap: no outbound TikTok API calls
// on every page load, since this route is publicly reachable and repeat
// visits shouldn't hit rate limits or cost money.

const MAINTENANCE = { status: 'degraded', label: 'Maintenance mode' };

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

async function checkTikTokAgency() {
  try {
    if (await isTikTokSuspended()) return { status: 'degraded', label: 'Suspended' };
  } catch {
    // fail open
  }
  return { status: 'operational', label: 'Operational' };
}

async function checkC2Agency() {
  try {
    if (await isC2Suspended()) return { status: 'degraded', label: 'Suspended' };
  } catch {
    // fail open
  }
  return { status: 'operational', label: 'Operational' };
}

export async function GET() {
  // The site-wide maintenance kill switch (/admin/security/kill/switches)
  // takes every regular page offline behind MaintenanceNotice. /system/status
  // and /admin are the only two routes exempted from that gate (see
  // MaintenanceGate.js) — every other service below is a regular page a
  // visitor genuinely cannot reach right now, so maintenance mode overrides
  // each of their own checks rather than reporting them Operational just
  // because their underlying config/connection happens to be fine.
  let maintenance = false;
  try {
    maintenance = await isSiteInMaintenance();
  } catch {
    // fail open — a Redis hiccup here must never report a false outage
  }

  const [hallie, moderation, tiktokAgency, c2Agency] = maintenance
    ? [MAINTENANCE, MAINTENANCE, MAINTENANCE, MAINTENANCE]
    : await Promise.all([
        Promise.resolve(checkHallieWriter()),
        checkModerationSystem(),
        checkTikTokAgency(),
        checkC2Agency(),
      ]);
  const website = maintenance ? MAINTENANCE : { status: 'operational', label: 'Operational' };
  const admin = checkAdminPanel(); // exempt from maintenance mode, same as /system/status

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    services: [
      { name: 'Website', ...website },
      { name: 'Hallie™ Writer', ...hallie },
      { name: 'TikTok Moderation System', ...moderation },
      { name: 'TikTok Agency', ...tiktokAgency },
      { name: 'C2 Agency', ...c2Agency },
      { name: 'Admin Panel', ...admin },
    ],
  });
}
