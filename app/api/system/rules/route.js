import { NextResponse } from 'next/server';
import { getBusinessTokens } from '@/lib/tokens';

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';

export async function GET() {
  const biz = await getBusinessTokens();
  if (!biz) return NextResponse.json({ error: 'Advertiser token not configured' }, { status: 503 });

  const res = await fetch(
    `${BASE}/optimizer/rule/list/?advertiser_id=${encodeURIComponent(biz.advertiser_id)}`,
    { headers: { 'Access-Token': biz.access_token } }
  );
  const json = await res.json();
  return NextResponse.json(json);
}

export async function POST(request) {
  const biz = await getBusinessTokens();
  if (!biz) return NextResponse.json({ error: 'Advertiser token not configured' }, { status: 503 });

  const body = await request.json();
  const headers = { 'Access-Token': biz.access_token, 'Content-Type': 'application/json' };

  if (body.action === 'delete') {
    const res = await fetch(`${BASE}/optimizer/rule/update/status/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ advertiser_id: biz.advertiser_id, rule_id: body.rule_id, status: 'DELETED' }),
    });
    return NextResponse.json(await res.json());
  }

  const res = await fetch(`${BASE}/optimizer/rule/create/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      advertiser_id: biz.advertiser_id,
      rule_name: body.name,
      trigger: { event_type: 'COMMENT_CREATED', keywords: body.keywords },
      action: { action_type: 'HIDE_COMMENT' },
    }),
  });
  return NextResponse.json(await res.json());
}
