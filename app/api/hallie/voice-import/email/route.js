import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { isValidAdminKey, isAdminSessionValid } from '@/lib/auth';

const SENT_MAILBOX = 'Sent Messages'; // iCloud's standard Sent folder name
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 30;
const SNIPPET_MAX_CHARS = 1500;

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
        const raw = parsed.text ?? htmlToText(parsed.html ?? '');
        const cleaned = cleanEmailText(raw);
        if (cleaned) snippets.push(cleaned.slice(0, SNIPPET_MAX_CHARS));
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

function htmlToText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

// Strips quoted reply chains, signatures, and boilerplate so the sample
// is Tyler's own words, not a forwarded thread.
function cleanEmailText(text) {
  return text
    .split(/\r?\n/)
    .filter(line => !line.trim().startsWith('>'))
    .join('\n')
    .split(/\n\s*On .{0,80} wrote:\s*$/im)[0]
    .split(/\n--\s*$/m)[0]
    .replace(/\s+/g, ' ')
    .trim();
}
