import { NextResponse } from 'next/server';
import { getBusinessTokens } from '@/lib/tokens';

function requireAdmin(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  return adminKey === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const tokens = await getBusinessTokens();
  if (!tokens) {
    return NextResponse.json({ error: 'No advertiser token found. Complete Business OAuth first.' }, { status: 404 });
  }
  return NextResponse.json({ token: JSON.stringify(tokens) });
}
