import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE = 'custom_rules';
const MAX_AGE = 60 * 60 * 24 * 30;

function getRules(cookieStore) {
  const raw = cookieStore.get(COOKIE)?.value;
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function setRulesCookie(response, rules) {
  response.cookies.set(COOKIE, JSON.stringify(rules), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const rules = getRules(cookieStore);
  return NextResponse.json({ rules });
}

export async function POST(request) {
  const cookieStore = await cookies();
  const rules = getRules(cookieStore);
  const body = await request.json();

  if (body.action === 'delete') {
    const next = rules.filter((r) => r.id !== body.rule_id);
    const response = NextResponse.json({ ok: true, rules: next });
    setRulesCookie(response, next);
    return response;
  }

  if (!body.name || !body.keywords?.length) {
    return NextResponse.json({ error: 'name and keywords required' }, { status: 400 });
  }

  const rule = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: body.name, keywords: body.keywords };
  const next = [...rules, rule];
  const response = NextResponse.json({ ok: true, rules: next });
  setRulesCookie(response, next);
  return response;
}
