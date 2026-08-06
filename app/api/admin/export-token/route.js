import { NextResponse } from 'next/server';
import { getBusinessTokens } from '@/lib/tokens';
import { isValidAdminKey } from '@/lib/auth';

export async function GET(request) {
  if (!isValidAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const tokens = await getBusinessTokens();
  if (!tokens) {
    return NextResponse.json({ error: 'No advertiser token found. Complete Business OAuth first.' }, { status: 404 });
  }
  return NextResponse.json({ token: JSON.stringify(tokens) });
}
