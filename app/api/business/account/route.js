import { NextResponse } from 'next/server';
import { getAccount } from '@/lib/tiktok/business-api';

function requireAdmin(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  return adminKey === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await getAccount();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
