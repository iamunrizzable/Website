import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ImapFlow } from 'imapflow';
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

      for await (const message of client.fetch(range, { envelope: true, source: true })) {
        const text = extractPlainText(message.source?.toString('utf8') ?? '');
        const cleaned = cleanEmailText(text);
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

// Best-effort: grab the text/plain part (or strip tags from text/html) out
// of a raw RFC822 message. Not a full MIME parser — good enough for
// extracting readable body text for voice samples.
function extractPlainText(raw) {
  const plainMatch = raw.match(/Content-Type:\s*text\/plain[\s\S]*?\r?\n\r?\n([\s\S]*?)(?:\r?\n--|\r?\n\r?\n$)/i);
  if (plainMatch) return plainMatch[1];

  const htmlMatch = raw.match(/Content-Type:\s*text\/html[\s\S]*?\r?\n\r?\n([\s\S]*?)(?:\r?\n--|\r?\n\r?\n$)/i);
  if (htmlMatch) return htmlMatch[1].replace(/<[^>]+>/g, ' ');

  // No multipart boundary found — treat everything after the header block as the body.
  const parts = raw.split(/\r?\n\r?\n/);
  return parts.slice(1).join('\n\n');
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
