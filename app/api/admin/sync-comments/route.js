import { NextResponse } from 'next/server';
import { syncComments } from '@/lib/sync';

function requireAdmin(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  return adminKey === process.env.ADMIN_SECRET;
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let maxVideos = null;
  try {
    const body = await request.json().catch(() => ({}));
    if (body.maxVideos && Number.isInteger(body.maxVideos) && body.maxVideos > 0) {
      maxVideos = body.maxVideos;
    }
  } catch { /* ignore */ }
  try {
    const results = await syncComments({ autoHide: true, maxVideos });
    return NextResponse.json({
      synced: results.length,
      hidden: results.filter(r => r.hidden).length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
