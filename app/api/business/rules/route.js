import { NextResponse } from 'next/server';
import { getCustomRules, storeCustomRules } from '@/lib/tokens';

function requireAdmin(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  return adminKey === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rules = await getCustomRules();
  return NextResponse.json({ rules });
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const rules = await getCustomRules();

  if (body.action === 'delete') {
    const next = rules.filter((r) => r.id !== body.rule_id);
    await storeCustomRules(next);
    return NextResponse.json({ ok: true, rules: next });
  }

  if (!body.name || !body.keywords?.length) {
    return NextResponse.json({ error: 'name and keywords required' }, { status: 400 });
  }

  const rule = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: body.name, keywords: body.keywords };
  const next = [...rules, rule];
  await storeCustomRules(next);
  return NextResponse.json({ ok: true, rules: next });
}
