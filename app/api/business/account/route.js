import { NextResponse } from 'next/server';
import { getAccount } from '@/lib/tiktok/business-api';
import { isValidAdminKey } from '@/lib/auth';

export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await getAccount();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
