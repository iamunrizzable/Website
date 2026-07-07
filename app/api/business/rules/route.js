import { NextResponse } from 'next/server';
import { getBusinessTokens } from '@/lib/tokens';

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';

function requireAdmin(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  return adminKey === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const biz = await getBusinessTokens();
  if (!biz) return NextResponse.json({ error: 'Advertiser token not configured' }, { status: 503 });

  const res = await fetch(
    `${BASE}/optimizer/rule/list/?advertiser_id=${encodeURIComponent(biz.advertiser_id)}`,
    { headers: { 'Access-Token': biz.access_token } }
  );
  return NextResponse.json(await res.json());
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  if (!body.name || !body.keywords?.length) {
    return NextResponse.json({ error: 'name and keywords required' }, { status: 400 });
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
