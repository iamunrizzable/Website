import { NextResponse } from 'next/server';
import { syncComments } from '@/lib/sync';

function requireAdmin(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  return adminKey === process.env.ADMIN_SECRET;
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const results = await syncComments({ autoHide: true });
    return NextResponse.json({
      synced: results.length,
      hidden: results.filter(r => r.hidden).length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
