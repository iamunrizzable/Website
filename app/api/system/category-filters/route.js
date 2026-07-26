import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TOGGLEABLE_CATEGORIES, CATEGORY_META } from '@/lib/moderation/scorer';

const COOKIE = 'category_filters';
const MAX_AGE = 60 * 60 * 24 * 30;

function getFilters(cookieStore) {
  const raw = cookieStore.get(COOKIE)?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function setFiltersCookie(response, enabled) {
  response.cookies.set(COOKIE, JSON.stringify(enabled), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

function categoryList() {
  return TOGGLEABLE_CATEGORIES.map((key) => ({ key, ...CATEGORY_META[key] }));
}

export async function GET() {
  const cookieStore = await cookies();
  const stored = getFilters(cookieStore);
  const enabled = stored ?? TOGGLEABLE_CATEGORIES;
  return NextResponse.json({ enabled, categories: categoryList() });
}

export async function POST(request) {
  const body = await request.json();

  if (!Array.isArray(body.enabled)) {
    return NextResponse.json({ error: 'enabled array required' }, { status: 400 });
  }

  const enabled = body.enabled.filter((c) => TOGGLEABLE_CATEGORIES.includes(c));
  const response = NextResponse.json({ ok: true, enabled, categories: categoryList() });
  setFiltersCookie(response, enabled);
  return response;
}
