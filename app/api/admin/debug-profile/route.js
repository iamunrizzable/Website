import { NextResponse } from 'next/server';
import { getProfileSignals } from '@/lib/tiktok/browser';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = request.headers.get('x-admin-key') ?? searchParams.get('key');
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const username = searchParams.get('username');
  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

  try {
    const signals = await getProfileSignals(username);
    return NextResponse.json(signals);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
