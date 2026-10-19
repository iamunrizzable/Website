import { NextResponse } from 'next/server';
import { getEvents, getBusinessTokens, getTikTokAccountToken, isRedisConfigured, getLLMLog } from '@/lib/tokens';
import { assessHealth, summarizeToday } from '@/lib/llm-health';
import { isValidAdminKey } from '@/lib/auth';

export async function GET(request) {
  if (!(await isValidAdminKey(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [events, businessTokens, accountTokens, llmLog] = await Promise.all([
    getEvents(20),
    getBusinessTokens(),
    getTikTokAccountToken(),
    getLLMLog().catch(() => []),
  ]);

  return NextResponse.json({
    business_connected: !!businessTokens,
    business_stored_at: businessTokens?.stored_at ?? null,
    business_expires_at: businessTokens?.expires_at ?? null,
    business_advertiser_id: businessTokens?.advertiser_id ?? null,
    business_open_id: businessTokens?.open_id ?? null,
    account_connected: !!accountTokens,
    account_stored_at: accountTokens?.stored_at ?? null,
    account_expires_at: accountTokens?.expires_at ?? null,
    account_open_id: accountTokens?.open_id ?? null,
    account_scope: accountTokens?.scope ?? null,
    account_business_id: accountTokens?.business_id ?? null,
    redis_configured: isRedisConfigured(),
    llm_health: assessHealth(llmLog).state,
    llm_today: summarizeToday(llmLog),
    events,
  });
}
