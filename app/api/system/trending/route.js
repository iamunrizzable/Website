import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';

function getToken(cookieStore) {
  const raw = cookieStore.get('acct_token')?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function GET(request) {
  const cookieStore = await cookies();
  const token = getToken(cookieStore);
  if (!token) return NextResponse.json({ error: 'Not connected' }, { status: 401 });

  const businessId = token.business_id ?? token.open_id;
  const headers = { 'Access-Token': token.access_token };
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'trending';
  const keyword = searchParams.get('keyword') ?? '';

  if (type === 'keywords' && !keyword) {
    return NextResponse.json({ error: 'A keyword is required for this search' }, { status: 400 });
  }

  const params = new URLSearchParams({ business_id: businessId });
  if (keyword) params.set('keyword', keyword);
  // discovery/trending/search/keyword/ requires a non-empty `query` param
  // (confirmed via TikTok's own error: "query: value is required but missing").
  const keywordParams = new URLSearchParams({ business_id: businessId, query: keyword });

  const endpoints = {
    trending: `${BASE}/discovery/trending/search/?${params}`,
    keywords: `${BASE}/discovery/trending/search/keyword/?${keywordParams}`,
    hashtags: `${BASE}/business/hashtag/suggestion/?${params}`,
    benchmark: `${BASE}/business/benchmark/?business_id=${encodeURIComponent(businessId)}`,
  };
  const url = endpoints[type] ?? endpoints.trending;

  const res = await fetch(url, { headers });
  return NextResponse.json(await res.json());
}
