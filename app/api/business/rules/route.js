import { NextResponse } from 'next/server';
import { listRules, createRule, deleteRule } from '@/lib/tiktok/business-api';

function requireAdmin(request) {
  return request.headers.get('x-admin-key') === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await listRules();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  try {
    if (body.action === 'delete') {
      const data = await deleteRule(body.rule_id);
      return NextResponse.json(data);
    }
    if (!body.name || !body.keywords?.length) {
      return NextResponse.json({ error: 'name and keywords required' }, { status: 400 });
    }
    const data = await createRule({ name: body.name, keywords: body.keywords });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
