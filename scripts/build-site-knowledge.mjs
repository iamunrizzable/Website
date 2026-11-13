// Builds lib/site-knowledge.json: the readable text of every public page,
// so Hallie can answer questions about the site without the old VM relay.
// Runs before every build (see package.json "build").
import fs from 'node:fs';
import path from 'node:path';

const APP = path.join(process.cwd(), 'app');
const SKIP = /^(admin|api|auth|go-home)(\/|$)/;

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(p, out);
    else if (e.name === 'page.js') out.push(p);
  }
  return out;
}

const decode = (s) => s
  .replace(/&apos;|&#39;|&rsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&nbsp;/g, ' ');

function textOf(src) {
  const start = src.indexOf('<main');
  let body = start === -1 ? '' : src.slice(start, src.lastIndexOf('</main>'));
  body = body.replace(/<footer[\s\S]*?<\/footer>/g, ' ').replace(/<div className="footer"[\s\S]*?<\/div>/g, ' ');
  body = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ').replace(/\{' '\}|\{" "\}/g, ' ');
  for (let i = 0; i < 6; i++) body = body.replace(/\{[^{}]*\}/g, ' ');
  body = body.replace(/<\/(p|li|h[1-6]|div|section|tr)>/g, '\n').replace(/<[^>]+>/g, ' ');
  return decode(body).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 1).join('\n');
}

const out = [];
for (const file of pages(APP)) {
  const rel = path.relative(APP, path.dirname(file)).split(path.sep).join('/');
  if (SKIP.test(rel) || rel.includes('[')) continue;
  const src = fs.readFileSync(file, 'utf8');
  const text = textOf(src);
  if (text.length < 40) continue;
  const h1 = src.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const title = decode((h1 ? h1[1] : rel).replace(/<[^>]+>/g, ' ').replace(/\{[^{}]*\}/g, ' ')).replace(/\s+/g, ' ').trim() || rel || 'Home';
  out.push({ url: '/' + rel, title, text });
}
out.sort((a, b) => a.url.localeCompare(b.url));
fs.writeFileSync(path.join(process.cwd(), 'lib', 'site-knowledge.json'), JSON.stringify(out));
console.log(`site knowledge: ${out.length} pages, ${Math.round(JSON.stringify(out).length / 1024)} KB`);
