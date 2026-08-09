import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import * as cheerio from 'cheerio';
import { isValidAdminKey, isAdminSessionValid } from '@/lib/auth';

const SENT_MAILBOX = 'Sent Messages'; // iCloud's standard Sent folder name
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 30;
const SNIPPET_MAX_CHARS = 1500;
const MIN_SNIPPET_CHARS = 8; // drop "- Tyler" / empty-after-cleanup stubs — no signal for voice matching

// Pulls Tyler's OWN authored writing for the Tyler-persona voice panel —
// his Sent folder only, nothing anyone else wrote. Purely a passthrough:
// nothing fetched here is stored server-side; the client merges the
// returned text into its own localStorage voice sample box. See the
// carve-out in both legal pages' Section 18 (Apple/iCloud subprocessor)
// for why this is scoped to IMAP + the Sent folder only.
//
// Uses mailparser's simpleParser for extraction — a hand-rolled regex
// parser here previously didn't decode quoted-printable/base64 content
// encoding (which iCloud/Apple Mail commonly use), so it could silently
// feed garbled text (raw "=E2=80=99" escapes, base64 blobs) into voice
// samples instead of clean prose. Don't revert to a regex-based parser.
//
// Quote/thread stripping goes through the HTML part via cheerio, not
// text-pattern guessing: Apple Mail wraps quoted/forwarded content in
// <blockquote> elements, not in a ">" prefix or a reliable "On X wrote:"
// line, so a regex-based stripper let entire other-people's threads
// (marketing emails, other senders' replies) through as if Tyler wrote
// them — the exact bug this route exists to avoid. Falls back to the
// text-based heuristic only when a message has no HTML part at all.
export async function POST(request) {
  const cookieStore = await cookies();
  if (!isValidAdminKey(request) && !isAdminSessionValid(cookieStore)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.ICLOUD_EMAIL_ADDRESS || !process.env.ICLOUD_APP_PASSWORD) {
    return NextResponse.json(
      { error: 'ICLOUD_EMAIL_ADDRESS and ICLOUD_APP_PASSWORD are not configured' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const limit = Math.min(Math.max(Number(body.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);

  const client = new ImapFlow({
    host: 'imap.mail.me.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.ICLOUD_EMAIL_ADDRESS,
      pass: process.env.ICLOUD_APP_PASSWORD,
    },
    logger: false,
    // Serverless functions have a hard execution ceiling — an unreachable
    // or slow-to-greet server must fail fast with a clear error instead
    // of hanging until the platform kills the function.
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock(SENT_MAILBOX);
    const snippets = [];
    try {
      const status = await client.status(SENT_MAILBOX, { messages: true });
      const total = status.messages ?? 0;
      if (total === 0) {
        return NextResponse.json({ snippets: [] });
      }
      const from = Math.max(1, total - limit + 1);
      const range = `${from}:${total}`;

      for await (const message of client.fetch(range, { source: true })) {
        if (!message.source) continue;
        const parsed = await simpleParser(message.source);
        const ownWords = parsed.html
          ? extractOwnTextFromHtml(parsed.html)
          : stripQuotedTextFallback(parsed.text ?? '');
        const trimmed = stripSignatureBoilerplate(ownWords);
        const cleaned = trimmed.replace(/\s+/g, ' ').trim();
        if (cleaned.length < MIN_SNIPPET_CHARS) continue;
        const label = buildContextLabel(parsed);
        snippets.push(`${label}${cleaned.slice(0, SNIPPET_MAX_CHARS)}`);
      }
    } finally {
      lock.release();
    }
    await client.logout();
    return NextResponse.json({ snippets: snippets.reverse() });
  } catch (err) {
    try { await client.logout(); } catch { /* already closed */ }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Tags each sample with who it went to, the subject, and roughly when —
// so the model reads these as real, situated communications ("here's how
// Tyler writes to a legal contact about a dispute" vs "here's how Tyler
// writes to a brand about a collab"), not a flat pile of anonymous
// sentences. This is what makes the samples teach how Tyler actually
// thinks across different situations, not just his surface phrasing.
function buildContextLabel(parsed) {
  const to = parsed.to?.text?.trim();
  const subject = parsed.subject?.trim();
  const date = parsed.date instanceof Date ? parsed.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;
  const parts = [];
  if (to) parts.push(`to ${to}`);
  if (subject) parts.push(`re: "${subject}"`);
  if (date) parts.push(date);
  return parts.length ? `[${parts.join(' — ')}] ` : '';
}

// Removes every <blockquote> (Apple Mail's quoted/forwarded-content
// wrapper, including nested reply chains) before extracting text, so
// only content Tyler actually typed in this message remains. Newlines
// are preserved here — stripSignatureBoilerplate below needs real line
// breaks to anchor on; whitespace gets collapsed once, at the very end.
function extractOwnTextFromHtml(html) {
  const $ = cheerio.load(html);
  $('blockquote, style, script').remove();
  // cheerio collapses block-level tags onto one line by default — add
  // explicit breaks so paragraphs/divs/br still separate as newlines.
  $('p, div, br').after('\n');
  return $.root().text();
}

// Best-effort fallback for the rare message with no HTML part — same
// heuristic as before, kept only as a last resort. Also preserves
// newlines for the signature-stripping step that follows.
function stripQuotedTextFallback(text) {
  return text
    .split(/\r?\n/)
    .filter(line => !line.trim().startsWith('>'))
    .join('\n')
    .split(/\n\s*On .{0,80} wrote:\s*$/im)[0];
}

// Cuts everything from the first signature/footer marker onward — the
// repeated "Sent from my iPhone", confidentiality notice, and contact
// block add no voice signal (identical every message) and just eat the
// sample budget. Matched at line start (needs the caller's newlines
// intact) to avoid false-positive cuts on a message that happens to
// contain these words mid-sentence.
const SIGNATURE_MARKERS = /^\s*(sent from my i|confidentiality notice|sincerely,|all the best,|unapologetically,)/im;
function stripSignatureBoilerplate(text) {
  const match = text.match(SIGNATURE_MARKERS);
  return match ? text.slice(0, match.index) : text;
}
