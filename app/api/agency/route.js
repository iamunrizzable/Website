import nodemailer from 'nodemailer';
import { Redis } from '@upstash/redis';

const APPS_KEY = 'agency:applications';

function getRedis() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
  }
  return null;
}

export async function POST(req) {
  try {
    const { name, tiktok, diamonds, hours, why } = await req.json();
    if (!name || !tiktok || !diamonds || !hours || !why) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    const application = { name, tiktok, diamonds, hours, why, submitted_at: Date.now() };

    // Store in Redis
    const redis = getRedis();
    if (redis) {
      const existing = await redis.get(APPS_KEY) ?? [];
      const list = Array.isArray(existing) ? existing : [];
      list.unshift(application);
      await redis.set(APPS_KEY, list.slice(0, 200));
    }

    // Send email if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT ?? '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"TJB Management" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
        to: 'tyler@tjbmanagementinc.com',
        subject: `New Agency Application — ${tiktok}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px">
            <h2 style="color:#d946ef;border-bottom:2px solid #a855f7;padding-bottom:8px">
              ✍️ New TJB Management Application
            </h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <tr><td style="padding:8px 0;color:#666;width:160px"><strong>Name</strong></td><td>${name}</td></tr>
              <tr><td style="padding:8px 0;color:#666"><strong>TikTok</strong></td><td>${tiktok}</td></tr>
              <tr><td style="padding:8px 0;color:#666"><strong>Avg Monthly Diamonds</strong></td><td>${diamonds}</td></tr>
              <tr><td style="padding:8px 0;color:#666"><strong>Avg Monthly LIVE Hours</strong></td><td>${hours}</td></tr>
            </table>
            <p style="color:#444;font-weight:600">Why they want to join:</p>
            <blockquote style="border-left:4px solid #a855f7;margin:0;padding:10px 16px;background:#faf5ff;color:#333;border-radius:0 8px 8px 0">
              ${why.replace(/</g, '&lt;').replace(/\n/g, '<br>')}
            </blockquote>
            <p style="font-size:11px;color:#999;margin-top:24px">
              Submitted ${new Date().toLocaleString()} · TJB Management Inc.
            </p>
          </div>
        `,
      });
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return Response.json({ applications: [] });
    const apps = await redis.get(APPS_KEY) ?? [];
    return Response.json({ applications: Array.isArray(apps) ? apps : [] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
