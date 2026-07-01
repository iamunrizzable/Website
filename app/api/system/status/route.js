import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('acct_token')?.value;
  if (!raw) return NextResponse.json({ connected: false });
  try {
    const token = JSON.parse(raw);
    const expired = token.expires_at && Date.now() > token.expires_at;
    if (expired) return NextResponse.json({ connected: false });
    return NextResponse.json({ connected: true, open_id: token.open_id, business_id: token.business_id, scope: token.scope });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
