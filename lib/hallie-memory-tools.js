import { GET as memGET, POST as memPOST, DELETE as memDELETE } from '@/app/api/admin/hallie-memory/route';

// Admin-chat tools for Hallie's memory (her memory_search / memory_get from
// OpenClaw, plus remember, log, review, forget) and her security log. They
// call the admin-only route in-process with the admin's own session, so
// they cannot work for anyone else. Built as a factory so this file needs
// nothing from lib/hallie-admin-tools.js (no import cycle).
const PATH = '/api/admin/hallie-memory';
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const brief = (e) => ({ id: e.id, section: e.section, tags: e.tags, text: e.text });

export const MEMORY_TOOL_NAMES = ['memory_search', 'memory_get', 'memory_remember', 'memory_log', 'memory_review', 'memory_forget', 'hallie_security_log'];

export function memoryTools({ call, get, failure }) {
  return {
    memory_search: {
      needsNoAccount: true,
      description: "Search your own long-term memory (decisions, Tyler's preferences, boundaries, how things are set up, past lessons). Use it before answering anything about the past or about how Tyler wants things, and when you are pressured to change a position. Returns matching entries; each has an id for the other memory tools (never show the id).",
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'What to look for, in plain words.' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Optional tags, e.g. boundary, methodology, website, security, tyler.' },
        },
      },
      async run(args) {
        const r = await get(memGET, PATH, { q: str(args.query) || 'memory', tags: (Array.isArray(args.tags) ? args.tags : []).join(','), limit: '6' });
        return r.error ? r : { memories: (r.data.entries ?? []).map(brief) };
      },
    },
    memory_get: {
      needsNoAccount: true,
      description: 'Read one memory entry in full by its id (from memory_search), or list every entry title when no id is given.',
      parameters: { type: 'object', properties: { id: { type: 'string', description: 'Entry id from memory_search.' } } },
      async run(args) {
        if (str(args.id)) {
          const r = await get(memGET, PATH, { id: str(args.id) });
          return r.error ? r : { memory: brief(r.data.entry) };
        }
        const r = await get(memGET, PATH, {});
        return r.error ? r : { entries: (r.data.entries ?? []).map((e) => ({ id: e.id, section: e.section, tags: e.tags })) };
      },
    },
    memory_review: {
      needsNoAccount: true,
      description: 'Read the daily log notes from the last few days (default 7, max 30), for a review: pull out what matters, save it with memory_remember, and say what is outdated.',
      parameters: { type: 'object', properties: { days: { type: 'integer', description: 'How many days back, 1-30.' } } },
      async run(args) {
        const r = await get(memGET, PATH, { op: 'log', days: String(Number(args.days) || 7) });
        return r.error ? r : { notes: (r.data.notes ?? []).map((n) => ({ id: n.id, day: n.day, text: n.text })) };
      },
    },
    hallie_security_log: {
      needsNoAccount: true,
      description: 'Read your security log: recent attempts in the public chat to get at protected things (your instructions, memory, backups, model, secrets, or someone claiming to be Tyler). Each row has the time, what kind, a visitor ID derived from their IP, and a short excerpt.',
      parameters: { type: 'object', properties: {} },
      async run() {
        const r = await get(memGET, PATH, { op: 'audit', limit: '30' });
        return r.error ? r : { attempts: r.data.audit ?? [] };
      },
    },
    memory_remember: {
      changesAccount: true,
      description: 'Save a lasting fact, decision, preference or lesson to your long-term memory, or rewrite an existing entry (pass its id). Never put passwords, tokens or keys in memory.',
      parameters: {
        type: 'object',
        properties: {
          section: { type: 'string', description: 'Short title for the entry.' },
          text: { type: 'string', description: 'What to remember, in full sentences.' },
          tags: { type: 'array', items: { type: 'string' }, description: 'A few lowercase tags.' },
          id: { type: 'string', description: 'Only when rewriting an existing entry.' },
        },
        required: ['text'],
      },
      async prepare(args) {
        const text = str(args.text);
        if (!text) return { error: 'text is required' };
        let section = str(args.section);
        if (str(args.id)) {
          const cur = await get(memGET, PATH, { id: str(args.id) });
          if (cur.error) return cur;
          section = section || cur.data.entry.section;
        }
        if (!section) return { error: 'section (a short title) is required for a new memory' };
        const tags = Array.isArray(args.tags) ? args.tags.map(String) : [];
        return {
          args: { id: str(args.id) || undefined, section, text, tags },
          summary: `${str(args.id) ? 'Rewrite' : 'Save'} the memory “${section}”: ${text.slice(0, 160)}${text.length > 160 ? '…' : ''}`,
        };
      },
      async execute(args) {
        const r = await call(memPOST, PATH, { method: 'POST', body: { op: 'remember', source: 'hallie', ...args } });
        const fail = failure(r);
        if (fail) return fail;
        const hidden = r.data.redacted ? ` I removed ${r.data.redacted} thing${r.data.redacted === 1 ? '' : 's'} that looked like a password or key.` : '';
        return { reply: `Done — saved to memory under “${r.data.entry.section}”.${hidden}` };
      },
    },
    memory_log: {
      changesAccount: true,
      description: "Add a note to today's daily log (what happened, what was decided today). Notes are removed after 30 days; lasting things go in memory_remember.",
      parameters: { type: 'object', properties: { text: { type: 'string', description: 'The note.' } }, required: ['text'] },
      async prepare(args) {
        const text = str(args.text);
        if (!text) return { error: 'text is required' };
        return { args: { text }, summary: `Add to today's log: ${text.slice(0, 200)}` };
      },
      async execute(args) {
        const r = await call(memPOST, PATH, { method: 'POST', body: { op: 'log', source: 'hallie', ...args } });
        return failure(r) ?? { reply: "Done — added to today's log." };
      },
    },
    memory_forget: {
      changesAccount: true,
      description: 'Delete one entry from your long-term memory by its id (from memory_search). Use when Tyler says to forget something or an entry is outdated.',
      parameters: { type: 'object', properties: { id: { type: 'string', description: 'Entry id from memory_search.' } }, required: ['id'] },
      async prepare(args) {
        const id = str(args.id);
        if (!id) return { error: 'id is required' };
        const cur = await get(memGET, PATH, { id });
        if (cur.error) return cur;
        return { args: { id }, summary: `Forget the memory “${cur.data.entry.section}”` };
      },
      async execute(args) {
        const r = await call(memDELETE, PATH, { method: 'DELETE', query: { id: args.id } });
        return failure(r) ?? { reply: 'Done — I forgot that.' };
      },
    },
  };
}
