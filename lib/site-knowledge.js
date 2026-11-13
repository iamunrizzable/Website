import PAGES from './site-knowledge.json';

// Keyword search over the text of the site's own public pages (built by
// scripts/build-site-knowledge.mjs). No network, no VM. Pages are cut into
// passages and each passage is scored by which query words it contains,
// with rare words counting for more.

const STOP = new Set('a an the and or of to in on for is are was were be do does did i you me my your we our it its this that what who how when where why can could would should with at by from about tell give show please long much many get have has'.split(' '));

const stem = (w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const words = (s) => (String(s ?? '').toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? []).map(stem);

const PASSAGE = 700;
const passages = [];
for (const p of PAGES) {
  let buf = '';
  const flush = () => { if (buf.trim()) passages.push({ p, text: buf.trim(), set: new Set(words(buf)) }); buf = ''; };
  for (const line of p.text.split('\n')) {
    if (buf.length + line.length > PASSAGE) flush();
    buf += `${line}\n`;
  }
  flush();
}
const pageWords = new Map(PAGES.map((p) => [p, new Set(words(`${p.title} ${p.url.replace(/[/-]/g, ' ')}`))]));
const df = new Map();
for (const ps of passages) for (const w of ps.set) df.set(w, (df.get(w) ?? 0) + 1);

// Returns { strong, pages: [{ title, url, text }] }. strong = one passage
// holds at least two of the query's words (or its only word).
export function searchSite(query, { limit = 4 } = {}) {
  const terms = [...new Set(words(query).filter((w) => !STOP.has(w) && (w.length > 2 || /\d/.test(w))))];
  if (!terms.length) return { strong: false, pages: [] };
  const weight = (t) => Math.log(1 + passages.length / (1 + (df.get(t) ?? 0)));
  const scored = [];
  for (const ps of passages) {
    let score = 0;
    let matched = 0;
    for (const t of terms) {
      const here = ps.set.has(t);
      if (here) matched++;
      score += (here ? weight(t) : 0) + (pageWords.get(ps.p).has(t) ? weight(t) * 0.5 : 0);
    }
    if (matched) scored.push({ ps, score: score * (1 + matched), matched });
  }
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);
  return {
    strong: top.length > 0 && top[0].matched >= Math.min(2, terms.length),
    pages: top.map(({ ps }) => ({ title: ps.p.title, url: `https://tjbmanagementinc.com${ps.p.url}`, text: ps.text })),
  };
}
