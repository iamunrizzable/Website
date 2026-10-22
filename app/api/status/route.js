import { NextResponse } from 'next/server';
import { getTikTokAccountToken, isSiteInMaintenance, isTikTokSuspended, isC2Suspended, isHallieSuspended, getLLMLog } from '@/lib/tokens';
import { hallieChatStatus } from '@/lib/llm-health';
import { hallieLLMConfigured } from '@/lib/hallie-llm';

// Public, unauthenticated status endpoint — deliberately returns only
// Operational/Degraded/Down + a short label per service, never raw tokens,
// keys, or connection IDs. Checks are real (derived from actual stored
// state / env presence each call) but cheap: no outbound TikTok API calls
// on every page load, since this route is publicly reachable and repeat
// visits shouldn't hit rate limits or cost money.

// Site-wide maintenance kill switch specifically — every service takes
// this exact label while it's on.
const MAINTENANCE = { status: 'degraded', label: 'Taken offline for maintenance' };

// No email-sending infrastructure lives in this repo (Tyler sends via his
// own iCloud+ custom domain, entirely outside this codebase), so there's
// nothing here to live-check — this is set by hand. Confirmed working
// again as of September 27, 2026 (Apple's HM08 content-based spam hold
// was triggered by low-content "Test" emails, per Apple support).
const EMAIL_STATUS = { status: 'operational', label: 'Available' };

// Calling/iMessage/RCS/SMS/MMS are phone-carrier-level services with no
// infrastructure in this repo to check — set by hand, same as Email.
const CALLING_STATUS = { status: 'operational', label: 'Available' };
const IMESSAGE_STATUS = { status: 'operational', label: 'Available' };
const RCS_STATUS = { status: 'operational', label: 'Available' };
const SMS_STATUS = { status: 'operational', label: 'Available' };
const MMS_STATUS = { status: 'operational', label: 'Available' };

function checkHallieWriter() {
  if (!hallieLLMConfigured()) return { status: 'down', label: 'Not configured' };
  return { status: 'operational', label: 'Available' };
}

// The Hallie chat widget talks to a relay on the VM through a Cloudflare
// tunnel. If the relay, the tunnel, or the VM is down — or the relay's own
// lockdown self-test has tripped (it then refuses all chats) — Hallie is
// unavailable. Only /healthz is called; it's a tiny local response.
//
// "Up" is not "working": the relay also reports how its last few chats went,
// and the TikTok/admin tool chat logs every model call (lib/tokens.js). If
// those have been failing, Hallie is shown as busy/degraded instead of
// Available (see assessHealth in lib/llm-health.js).
async function checkHallieChat() {
  const url = process.env.HALLIE_RELAY_URL;
  let relayRecent = null;
  if (url) {
    try {
      const res = await fetch(`${url}/healthz`, { signal: AbortSignal.timeout(4000), cache: 'no-store' });
      if (!res.ok) return { status: 'down', label: 'Unavailable' };
      const health = await res.json();
      // 'unknown' = the relay is up but its self-test can't reach the gateway
      // right now (restart, update, busy model): a transient state, so show
      // orange. 'tripped' (or anything else) is a real lockdown failure.
      // The trailing "O" in the detail is deliberate; it's a private marker.
      if (health.lockdown === 'unknown') {
        return { status: 'degraded', label: 'Degraded', detail: '(issue detected with Virtual Machine O)' };
      }
      if (health.lockdown !== 'ok') return { status: 'down', label: 'Unavailable' };
      relayRecent = Array.isArray(health.recent) ? health.recent : null;
    } catch {
      return { status: 'down', label: 'Unavailable' };
    }
  }
  let llmEntries = [];
  try {
    llmEntries = await getLLMLog(20);
  } catch {
    // fail open — a Redis hiccup must never report a false outage
  }
  return hallieChatStatus({ relayRecent, llmEntries });
}

async function checkHallie() {
  try {
    if (await isHallieSuspended()) return { status: 'down', label: 'Unavailable' };
  } catch {
    // fail open
  }
  return (await checkHallieChat()) ?? checkHallieWriter();
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
    return { status: 'operational', label: 'Available' };
  } catch {
    return { status: 'down', label: 'Unavailable' };
  }
}

async function checkTikTokAgency() {
  try {
    if (await isTikTokSuspended()) return { status: 'down', label: 'Unavailable' };
  } catch {
    // fail open
  }
  return { status: 'operational', label: 'Available' };
}

async function checkC2Agency() {
  try {
    if (await isC2Suspended()) return { status: 'down', label: 'Unavailable' };
  } catch {
    // fail open
  }
  return { status: 'operational', label: 'Available' };
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
        checkHallie(),
        checkModerationSystem(),
        checkTikTokAgency(),
        checkC2Agency(),
      ]);
  const website = maintenance ? MAINTENANCE : { status: 'operational', label: 'Available' };

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    services: [
      { name: 'Calling', ...CALLING_STATUS },
      { name: 'iMessage', ...IMESSAGE_STATUS },
      { name: 'RCS', ...RCS_STATUS },
      { name: 'SMS', ...SMS_STATUS },
      { name: 'MMS', ...MMS_STATUS },
      { name: 'Email', ...EMAIL_STATUS },
      { name: 'Hallie™', ...hallie },
      { name: 'TikTok Moderation System', ...moderation },
      { name: 'TikTok Agency', ...tiktokAgency },
      { name: 'C2 Agency', ...c2Agency },
      { name: 'Website', ...website },
    ],
  });
}
