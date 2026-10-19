// Pure helpers over the LLM call log (see recordLLMOutcome in lib/tokens.js
// and the relay's /healthz). No I/O here, so it is easy to test.
//
// Why this exists: the status page used to say Hallie was "Available" while
// every chat was failing, because it only checked that the server was up.

export const HEALTH_WINDOW_MS = 15 * 60_000;

// entries: newest first, each { ts, ok, ... }.
// 'bad' = the last few calls in the window mostly failed and the most recent
// two did not both succeed. Recovers as soon as two calls in a row succeed;
// with no recent calls there is no evidence, so 'ok'.
export function assessHealth(entries, now = Date.now()) {
  const recent = (entries ?? []).filter((e) => now - e.ts <= HEALTH_WINDOW_MS).slice(0, 5);
  if (recent.length < 2) return { state: 'ok', samples: recent.length, failed: 0 };
  const failed = recent.filter((e) => !e.ok).length;
  if (recent[0].ok && recent[1].ok) return { state: 'ok', samples: recent.length, failed };
  return { state: failed >= Math.min(3, recent.length) ? 'bad' : 'ok', samples: recent.length, failed };
}

// Per-provider totals since 00:00 UTC. entries: any order.
export function summarizeToday(entries, now = Date.now()) {
  const dayStart = new Date(now).setUTCHours(0, 0, 0, 0);
  const byProvider = {};
  let calls = 0;
  let failures = 0;
  for (const e of entries ?? []) {
    if (e.ts < dayStart) continue;
    calls++;
    if (!e.ok) failures++;
    const p = (byProvider[e.provider ?? 'none'] ??= { answered: 0, tokensIn: 0, tokensOut: 0 });
    if (e.ok) p.answered++;
    p.tokensIn += e.tokensIn ?? 0;
    p.tokensOut += e.tokensOut ?? 0;
  }
  return {
    calls,
    failures,
    by_provider: Object.entries(byProvider)
      .map(([provider, v]) => ({ provider, ...v }))
      .sort((a, b) => b.answered - a.answered),
  };
}

// What the status page shows for Hallie, from the relay's recent chats
// (website chat) and the LLM log (TikTok/admin tool chat). One path bad =
// degraded; both bad = down.
export function hallieChatStatus({ relayRecent, llmEntries, now = Date.now() }) {
  const relayBad = relayRecent ? assessHealth(relayRecent, now).state === 'bad' : false;
  const toolBad = assessHealth(llmEntries, now).state === 'bad';
  if (relayBad && toolBad) return { status: 'down', label: 'Unavailable' };
  if (relayBad) return { status: 'degraded', label: 'Busy right now' };
  if (toolBad) return { status: 'degraded', label: 'TikTok chat busy right now' };
  return null;
}
