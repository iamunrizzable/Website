import { NextResponse } from 'next/server';
import { searchTrending, getTrendingKeywords, getHashtagSuggestions, getBenchmark } from '@/lib/tiktok/business-api';

import { isValidAdminKey as requireAdmin } from '@/lib/auth';

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'trending';
  const keyword = searchParams.get('keyword') ?? '';
  try {
    if (type === 'keywords') {
      if (!keyword) return NextResponse.json({ error: 'A keyword is required for this search' }, { status: 400 });
      return NextResponse.json(await getTrendingKeywords({ keyword }));
    }
    if (type === 'hashtags') {
      if (!keyword) return NextResponse.json({ error: 'A keyword is required for this search' }, { status: 400 });
      return NextResponse.json(await getHashtagSuggestions({ keyword }));
    }
    if (type === 'benchmark') {
      const businessCategory = searchParams.get('business_category') ?? '';
      if (!businessCategory) return NextResponse.json({ error: 'A business category is required' }, { status: 400 });
      return NextResponse.json(await getBenchmark({ businessCategory }));
    }
    return NextResponse.json(await searchTrending({ keyword }));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
