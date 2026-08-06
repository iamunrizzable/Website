import { NextResponse } from 'next/server';
import { TOGGLEABLE_CATEGORIES, CATEGORY_META } from '@/lib/moderation/scorer';
import { getCategoryFilters, storeCategoryFilters } from '@/lib/tokens';
import { isValidAdminKey as requireAdmin } from '@/lib/auth';

function categoryList() {
  return TOGGLEABLE_CATEGORIES.map((key) => ({ key, ...CATEGORY_META[key] }));
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const stored = await getCategoryFilters();
  const enabled = stored ?? TOGGLEABLE_CATEGORIES;
  return NextResponse.json({ enabled, categories: categoryList() });
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();

  if (!Array.isArray(body.enabled)) {
    return NextResponse.json({ error: 'enabled array required' }, { status: 400 });
  }

  const enabled = body.enabled.filter((c) => TOGGLEABLE_CATEGORIES.includes(c));
  await storeCategoryFilters(enabled);
  return NextResponse.json({ ok: true, enabled, categories: categoryList() });
}
