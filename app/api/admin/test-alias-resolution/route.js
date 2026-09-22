import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import { resolveMarkerAlias } from '@/lib/tokens';

// TEMPORARY diagnostic: read-only check of whether a given persistentMarker
// resolves through the site:marker_aliases table built by
// migrate-shorten-ids. Calls only resolveMarkerAlias — no velocity/history
// recording, no side effects, unlike the real /api/fingerprint/check path.
// Meant to be deleted right after confirming the reassignment mechanism
// works against real production data.
export async function GET(request) {
  if (!isValidAdminKey(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const marker = searchParams.get('marker');
  if (!marker) return NextResponse.json({ error: 'Missing marker' }, { status: 400 });
  const resolved = await resolveMarkerAlias(marker);
  return NextResponse.json({ input: marker, resolved, reassigned: resolved !== marker });
}
