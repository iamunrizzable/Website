import { NextResponse } from 'next/server';
import { listVideos } from '@/lib/tiktok/business-api';
import { isValidAdminKey as requireAdmin } from '@/lib/auth';

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  try {
    const data = await listVideos({
      cursor: Number(searchParams.get('cursor') ?? 0),
      pageSize: Number(searchParams.get('page_size') ?? 20),
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
