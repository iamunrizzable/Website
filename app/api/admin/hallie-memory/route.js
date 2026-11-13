import { NextResponse } from 'next/server';
import { isValidAdminKey } from '@/lib/auth';
import {
  listMemory, getMemory, searchMemory, rememberMemory, forgetMemory,
  logNote, readLog, forgetNote, parseMemoryMarkdown,
} from '@/lib/hallie-memory';
import { getAuditLog } from '@/lib/hallie-audit';

// Hallie's memory is Tyler's only: every method needs the admin session
// (isValidAdminKey is async — it must be awaited or auth is silently off).
const denied = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function GET(request) {
  if (!(await isValidAdminKey(request))) return denied();
  const q = new URL(request.url).searchParams;
  try {
    if (q.get('op') === 'audit') return NextResponse.json({ audit: await getAuditLog(q.get('limit') ?? 50) });
    if (q.get('op') === 'log') return NextResponse.json({ notes: await readLog(q.get('days') ?? 7) });
    if (q.get('id')) {
      const entry = await getMemory(q.get('id'));
      return entry ? NextResponse.json({ entry }) : bad('No memory with that id.', 404);
    }
    if (q.get('q') || q.get('tags')) {
      return NextResponse.json({ entries: await searchMemory({ query: q.get('q') ?? '', tags: (q.get('tags') ?? '').split(','), limit: Number(q.get('limit')) || 6 }) });
    }
    return NextResponse.json({ entries: await listMemory() });
  } catch (err) {
    return bad(err.message, 500);
  }
}

export async function POST(request) {
  if (!(await isValidAdminKey(request))) return denied();
  const body = await request.json().catch(() => ({}));
  try {
    if (body.op === 'remember') {
      const { entry, redacted } = await rememberMemory({ id: body.id, section: body.section, tags: body.tags, text: body.text, source: body.source === 'hallie' ? 'hallie' : 'tyler' });
      return NextResponse.json({ ok: true, entry, redacted });
    }
    if (body.op === 'log') {
      const { note, redacted } = await logNote(body.text, body.source === 'hallie' ? 'hallie' : 'tyler');
      return NextResponse.json({ ok: true, note, redacted });
    }
    if (body.op === 'parse') return NextResponse.json({ sections: parseMemoryMarkdown(body.markdown) });
    if (body.op === 'import') {
      const sections = Array.isArray(body.sections) ? body.sections.slice(0, 100) : [];
      if (!sections.length) return bad('Nothing selected to import.');
      const saved = [];
      for (const s of sections) {
        const { entry } = await rememberMemory({ section: s.section, tags: s.tags, text: s.text, source: 'import' });
        saved.push(entry.id);
      }
      return NextResponse.json({ ok: true, imported: saved.length });
    }
    return bad('Unknown op.');
  } catch (err) {
    return bad(err.message);
  }
}

export async function DELETE(request) {
  if (!(await isValidAdminKey(request))) return denied();
  const q = new URL(request.url).searchParams;
  try {
    if (q.get('note')) return (await forgetNote(q.get('note'))) ? NextResponse.json({ ok: true }) : bad('No note with that id.', 404);
    if (!q.get('id')) return bad('Missing id.');
    return (await forgetMemory(q.get('id'))) ? NextResponse.json({ ok: true }) : bad('No memory with that id.', 404);
  } catch (err) {
    return bad(err.message, 500);
  }
}
