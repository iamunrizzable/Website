'use client';

import './page.css';

import { useEffect, useState, useCallback } from 'react';

// Hallie's memory, daily log and security log. Admin session only: the
// page is gated by the proxy and every call goes to /api/admin/hallie-memory.
const API = '/api/admin/hallie-memory';

const s = {
  page: { minHeight: '100vh', background: 'transparent', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', position: 'relative', zIndex: 10 },
  card: { background: '#1e293b', borderRadius: 12, padding: 20, marginBottom: 20, border: '2px solid rgba(168,85,247,0.25)' },
  h2: { fontSize: 16, fontWeight: 600, color: '#d946ef', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  btn: { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnGhost: { background: 'transparent', border: '1px solid rgba(168,85,247,0.5)', color: '#d4a5ff', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
  btnDanger: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
  input: { width: '100%', boxSizing: 'border-box', background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(168,85,247,0.35)', borderRadius: 8, padding: '10px 12px', fontSize: 16, marginBottom: 10, fontFamily: 'inherit' },
  note: { fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12 },
  msg: { fontSize: 13, color: '#f59e0b', marginBottom: 10, minHeight: 18 },
  entry: { borderTop: '1px solid rgba(168,85,247,0.2)', padding: '14px 0' },
  text: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 14, lineHeight: 1.6, color: '#cbd5e1', margin: '8px 0' },
  tag: { display: 'inline-block', fontSize: 11, color: '#06b6d4', border: '1px solid rgba(6,182,212,0.4)', borderRadius: 999, padding: '2px 8px', marginRight: 6, marginBottom: 4 },
  row: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
};

async function api(path, init) {
  const res = await fetch(path, init);
  if (res.status === 401) { window.location.assign('/admin/login?next=/admin/internal/hallie/memory'); throw new Error('Session expired'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
const post = (body) => api(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export default function HallieMemoryPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [entries, setEntries] = useState(null);
  const [notes, setNotes] = useState([]);
  const [audit, setAudit] = useState([]);
  const [msg, setMsg] = useState('');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState({ id: '', section: '', tags: '', text: '' });
  const [noteText, setNoteText] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [parsed, setParsed] = useState(null);
  const [picked, setPicked] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (q = '') => {
    try {
      const [m, l, a] = await Promise.all([
        api(q ? `${API}?q=${encodeURIComponent(q)}&limit=20` : API),
        api(`${API}?op=log&days=30`),
        api(`${API}?op=audit&limit=50`),
      ]);
      setEntries(m.entries ?? []);
      setNotes(l.notes ?? []);
      setAudit(a.audit ?? []);
    } catch (e) { setMsg(e.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, done) => {
    setBusy(true); setMsg('');
    try { const r = await fn(); setMsg(typeof done === 'function' ? done(r) : done); await load(query); }
    catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  const save = () => run(
    () => post({ op: 'remember', id: draft.id || undefined, section: draft.section, tags: draft.tags.split(','), text: draft.text }),
    (r) => { setDraft({ id: '', section: '', tags: '', text: '' }); return r.redacted ? `Saved. Removed ${r.redacted} thing(s) that looked like a password or key.` : 'Saved.'; },
  );
  const forget = (e) => { if (window.confirm(`Delete “${e.section}” from Hallie's memory?`)) run(() => api(`${API}?id=${encodeURIComponent(e.id)}`, { method: 'DELETE' }), 'Deleted.'); };
  const addNote = () => run(() => post({ op: 'log', text: noteText }), () => { setNoteText(''); return 'Note added.'; });
  const dropNote = (n) => run(() => api(`${API}?note=${encodeURIComponent(n.id)}`, { method: 'DELETE' }), 'Note deleted.');

  const readFile = (file) => { if (!file) return; const r = new FileReader(); r.onload = () => setMarkdown(String(r.result ?? '')); r.readAsText(file); };
  const parse = async () => {
    setBusy(true); setMsg('');
    try { const r = await post({ op: 'parse', markdown }); setParsed(r.sections ?? []); setPicked({}); if (!r.sections?.length) setMsg('No "## Heading" sections found in that text.'); }
    catch (e) { setMsg(e.message); }
    setBusy(false);
  };
  const doImport = () => run(
    () => post({ op: 'import', sections: parsed.filter((_, i) => picked[i]) }),
    (r) => { setParsed(null); setMarkdown(''); return `Imported ${r.imported} section(s).`; },
  );

  return (
    <>
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>☰ Menu</button>
      <div className={`menu-dropdown${menuOpen ? ' active' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/tyler" onClick={() => setMenuOpen(false)}>Tyler</a>
        <a href="/hallie" onClick={() => setMenuOpen(false)}>Hallie™</a>
        <a href="/news" onClick={() => setMenuOpen(false)}>Newsletters</a>
        <a href="/agencies" onClick={() => setMenuOpen(false)}>Creator Networks</a>
        <a href="/system/status" onClick={() => setMenuOpen(false)}>System Status</a>
        <a href="/legal" onClick={() => setMenuOpen(false)}>Legal</a>
        <a href="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</a>
      </div>

      <div style={s.page}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4a5ff', marginBottom: 4, animation: 'glowPulse 3s ease-in-out infinite' }}>Hallie Memory</h1>
          <p style={{ color: '#06b6d4', fontSize: 13, marginBottom: 20 }}>
            Hallie&apos;s long-term memory, daily log and security log. Only you can see or change this, here or by asking Hallie in the chat while logged in as admin.
          </p>
          <div style={s.msg}>{msg}</div>

          <div style={s.card}>
            <div style={s.h2}>{draft.id ? 'Edit memory' : 'Add a memory'}</div>
            <input style={s.input} placeholder="Title (section)" value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value })} />
            <input style={s.input} placeholder="Tags, comma separated" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
            <textarea style={{ ...s.input, minHeight: 120 }} placeholder="What Hallie should remember. Never a password, token or key." value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
            <div style={s.row}>
              <button style={{ ...s.btn, opacity: busy ? 0.6 : 1 }} disabled={busy || !draft.text.trim() || !draft.section.trim()} onClick={save}>{draft.id ? 'Save changes' : 'Save'}</button>
              {draft.id && <button style={s.btnGhost} onClick={() => setDraft({ id: '', section: '', tags: '', text: '' })}>Cancel</button>}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.h2}>Long-term memory {entries ? `(${entries.length})` : ''}</div>
            <div style={s.row}>
              <input style={{ ...s.input, flex: '1 1 220px', marginBottom: 0 }} placeholder="Search memory" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') load(query); }} />
              <button style={s.btnGhost} onClick={() => load(query)}>Search</button>
              {query && <button style={s.btnGhost} onClick={() => { setQuery(''); load(''); }}>Show all</button>}
            </div>
            {!entries && <p style={s.note}>Loading…</p>}
            {entries && !entries.length && <p style={{ ...s.note, marginTop: 12 }}>Nothing found.</p>}
            {(entries ?? []).map((e) => (
              <div key={e.id} style={s.entry}>
                <div style={{ fontWeight: 700, color: '#d4a5ff', marginBottom: 6 }}>{e.section}</div>
                <div>{(e.tags ?? []).map((t) => <span key={t} style={s.tag}>{t}</span>)}</div>
                <div style={s.text}>{e.text}</div>
                <div style={s.row}>
                  <button style={s.btnGhost} onClick={() => { setDraft({ id: e.id, section: e.section, tags: (e.tags ?? []).join(', '), text: e.text }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                  <button style={s.btnDanger} disabled={busy} onClick={() => forget(e)}>Delete</button>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{e.source ?? ''}{e.updatedAt ? ` · ${new Date(e.updatedAt).toLocaleString()}` : ''}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <div style={s.h2}>Daily log (last 30 days)</div>
            <p style={s.note}>Short notes about what happened or was decided. Each note is removed 30 days after it was written.</p>
            <div style={s.row}>
              <input style={{ ...s.input, flex: '1 1 220px', marginBottom: 0 }} placeholder="Add a note for today" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
              <button style={s.btnGhost} disabled={busy || !noteText.trim()} onClick={addNote}>Add</button>
            </div>
            {notes.map((n) => (
              <div key={n.id} style={s.entry}>
                <div style={{ fontSize: 12, color: '#06b6d4' }}>{n.day} · {n.source}</div>
                <div style={s.text}>{n.text}</div>
                <button style={s.btnDanger} disabled={busy} onClick={() => dropNote(n)}>Delete</button>
              </div>
            ))}
            {!notes.length && <p style={{ ...s.note, marginTop: 12 }}>No notes yet.</p>}
          </div>

          <div style={s.card}>
            <div style={s.h2}>Import from her backup</div>
            <p style={s.note}>
              Paste her MEMORY.md (or choose the file). Each &quot;## Heading&quot; becomes one entry, and you pick which ones to import. Anything that looks like a password, token or key is removed first. Imported entries are stored in the database only, never in the public code repository.
            </p>
            <input type="file" accept=".md,.txt,text/markdown,text/plain" style={{ ...s.note, display: 'block' }} onChange={(e) => readFile(e.target.files?.[0])} />
            <textarea style={{ ...s.input, minHeight: 120 }} placeholder="…or paste the text here" value={markdown} onChange={(e) => setMarkdown(e.target.value)} />
            <button style={s.btnGhost} disabled={busy || !markdown.trim()} onClick={parse}>Preview sections</button>
            {parsed && parsed.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {parsed.map((p, i) => (
                  <label key={i} style={{ ...s.entry, display: 'block', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!picked[i]} onChange={(e) => setPicked({ ...picked, [i]: e.target.checked })} />{' '}
                    <strong style={{ color: '#d4a5ff' }}>{p.section}</strong>
                    <span style={{ fontSize: 12, color: '#64748b' }}> · {p.text.length} characters{p.redacted ? ` · ${p.redacted} secret(s) removed` : ''}</span>
                    <div style={{ ...s.text, maxHeight: 120, overflow: 'auto', fontSize: 12 }}>{p.text}</div>
                  </label>
                ))}
                <button style={{ ...s.btn, opacity: busy ? 0.6 : 1 }} disabled={busy || !Object.values(picked).some(Boolean)} onClick={doImport}>Import selected</button>
              </div>
            )}
          </div>

          <div style={s.card}>
            <div style={s.h2}>Security log</div>
            <p style={s.note}>Attempts in the public chat to get at protected things. You are emailed about the first one from each visitor each hour. The visitor ID is derived from their IP address; the IP itself is not stored here.</p>
            {audit.map((a, i) => (
              <div key={i} style={s.entry}>
                <div style={{ fontSize: 12, color: '#06b6d4' }}>{new Date(a.t).toLocaleString()} · {(a.kinds ?? []).join(', ')} · visitor {a.ip} · {a.surface}</div>
                <div style={s.text}>{a.preview}</div>
              </div>
            ))}
            {!audit.length && <p style={s.note}>Nothing logged.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
