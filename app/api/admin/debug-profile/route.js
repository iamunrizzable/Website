import { NextResponse } from 'next/server';
import { getProfileSignals } from '@/lib/tiktok/browser';
import { isValidAdminKey } from '@/lib/auth';

export async function GET(request) {
  if (!isValidAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

  try {
    const signals = await getProfileSignals(username);
    return NextResponse.json(signals);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
