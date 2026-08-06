import nodemailer from 'nodemailer';

// Comment/author/video-id text reaching this file can be fully attacker-
// controlled (any TikTok commenter, or any caller of the unauthenticated
// POST /api/moderate scoring endpoint). Escape everything interpolated into
// the HTML email body — `&` must be escaped first so it doesn't double-
// escape the entities produced by the other replacements.
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Subject is a header, not HTML — strip CRLF instead of HTML-escaping so a
// comment/username containing newlines can't fold in extra mail headers.
function sanitizeHeader(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ');
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendModerationAlert({ type, content, author, score, flags, videoId, suggestedReply }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[alerts] Email not configured — skipping alert.');
    return;
  }

  const isMinor = flags.includes('potential_minor');
  const safeAuthor = author ? sanitizeHeader(author).replace(/[^\w.\-]/g, '') : null;
  const profileUrl = safeAuthor ? `https://www.tiktok.com/@${encodeURIComponent(safeAuthor)}` : null;

  const subject = isMinor
    ? `🚨 [MINOR DETECTED] Block @${sanitizeHeader(author)} — comment auto-hidden`
    : `[TJB Moderation] ${sanitizeHeader(flags.join(', '))} flagged — score ${score}/100`;

  const minorBanner = isMinor ? `
    <div style="background:#fef2f2;border:2px solid #ef4444;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="color:#b91c1c;font-weight:700;font-size:16px;margin:0 0 8px">
        🚨 Potential Minor Detected — Action Required
      </p>
      <p style="color:#7f1d1d;margin:0 0 12px;font-size:14px">
        This comment suggests the user may be under 18. Their comment has been automatically hidden.
        You should block this account immediately to prevent them from viewing your content.
      </p>
      ${profileUrl ? `
        <a href="${esc(profileUrl)}" style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:700;font-size:14px">
          Block @${esc(author)} on TikTok →
        </a>
      ` : ''}
    </div>
  ` : '';

  const html = `
    <div style="font-family:sans-serif;max-width:600px">
      <h2 style="color:#d946ef;border-bottom:2px solid #a855f7;padding-bottom:8px">
        ⚠️ TJB Moderation Alert
      </h2>
      ${minorBanner}
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tr><td style="padding:6px 0;color:#666;width:120px"><strong>Type</strong></td><td>${esc(type)}</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Score</strong></td><td>${esc(score)}/100</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Flags</strong></td><td>${esc(flags.join(', '))}</td></tr>
        ${author ? `<tr><td style="padding:6px 0;color:#666"><strong>Author</strong></td><td>${esc(author)}</td></tr>` : ''}
        ${videoId ? `<tr><td style="padding:6px 0;color:#666"><strong>Video ID</strong></td><td>${esc(videoId)}</td></tr>` : ''}
      </table>
      <p style="color:#444;font-weight:600">Flagged Content:</p>
      <blockquote style="border-left:4px solid #a855f7;margin:0;padding:10px 16px;background:#faf5ff;color:#333;border-radius:0 8px 8px 0">
        ${esc(content)}
      </blockquote>
      ${suggestedReply ? `
        <p style="color:#444;font-weight:600;margin-top:16px">Suggested Reply:</p>
        <blockquote style="border-left:4px solid #10b981;margin:0;padding:10px 16px;background:#f0fdf4;color:#333;border-radius:0 8px 8px 0">
          ${esc(suggestedReply)}
        </blockquote>
      ` : ''}
      <p style="font-size:11px;color:#999;margin-top:24px">
        Sent by TJB Moderation · tjbmanagementinc.com
      </p>
    </div>
  `;

  await getTransporter().sendMail({
    from: `"TJB Moderation" <${process.env.SMTP_USER}>`,
    to: 'tyler@tjbmanagementinc.com',
    subject,
    html,
  });
}
