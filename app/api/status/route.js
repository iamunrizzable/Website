import { NextResponse } from 'next/server';
import { getTikTokAccountToken, isSiteInMaintenance, isTikTokSuspended, isC2Suspended } from '@/lib/tokens';

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

// The site-wide maintenance kill switch (/admin/security/kill/switches)
// takes every regular page offline behind MaintenanceNotice — /system/status
// is deliberately exempted from that gate so it stays checkable, but the
// "Website" row itself must still reflect that state, not just its own
// route responding. 'degraded' rather than 'down': the underlying
// infrastructure is fine, it's an intentional, reversible visitor-facing
// shutdown, not a failure.
async function checkWebsite() {
  try {
    if (await isSiteInMaintenance()) return { status: 'degraded', label: 'Maintenance mode' };
  } catch {
    // fail open — a Redis hiccup here must never report a false outage
  }
  return { status: 'operational', label: 'Operational' };
}

// TikTok Agency and C2 Agency each have their own independent kill switch
// (/admin/security/kill/switches) gating their own subtree
// (TikTokSuspensionGate / C2SuspensionGate) — separate from the site-wide
// maintenance switch above. Same fail-open philosophy: a Redis hiccup
// must never report a false suspension.
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
  const [website, hallie, moderation, tiktokAgency, c2Agency] = await Promise.all([
    checkWebsite(),
    Promise.resolve(checkHallieWriter()),
    checkModerationSystem(),
    checkTikTokAgency(),
    checkC2Agency(),
  ]);
  const admin = checkAdminPanel();

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
