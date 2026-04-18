import nodemailer from 'nodemailer';

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

  const subject = `[TJB Moderation] ${flags.join(', ')} flagged — score ${score}/100`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px">
      <h2 style="color:#d946ef;border-bottom:2px solid #a855f7;padding-bottom:8px">
        ⚠️ TJB Moderation Alert
      </h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tr><td style="padding:6px 0;color:#666;width:120px"><strong>Type</strong></td><td>${type}</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Score</strong></td><td>${score}/100</td></tr>
        <tr><td style="padding:6px 0;color:#666"><strong>Flags</strong></td><td>${flags.join(', ')}</td></tr>
        ${author ? `<tr><td style="padding:6px 0;color:#666"><strong>Author</strong></td><td>${author}</td></tr>` : ''}
        ${videoId ? `<tr><td style="padding:6px 0;color:#666"><strong>Video ID</strong></td><td>${videoId}</td></tr>` : ''}
      </table>
      <p style="color:#444;font-weight:600">Flagged Content:</p>
      <blockquote style="border-left:4px solid #a855f7;margin:0;padding:10px 16px;background:#faf5ff;color:#333;border-radius:0 8px 8px 0">
        ${String(content).replace(/</g, '&lt;')}
      </blockquote>
      ${suggestedReply ? `
        <p style="color:#444;font-weight:600;margin-top:16px">Suggested Reply:</p>
        <blockquote style="border-left:4px solid #10b981;margin:0;padding:10px 16px;background:#f0fdf4;color:#333;border-radius:0 8px 8px 0">
          ${suggestedReply}
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
