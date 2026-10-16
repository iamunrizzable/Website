import { NextResponse } from 'next/server';

const FALLBACK_REPLY = "I've received your message! I'll get back to you soon. You can also email me directly at hallie@tjbmanagementinc.com.";
const ERROR_REPLY = 'Connection error. Please try emailing us at support@tjbmanagementinc.com instead.';

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const relayUrl = process.env.HALLIE_RELAY_URL;
    if (!relayUrl) {
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';

    const upstream = await fetch(`${relayUrl}/chat`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-visitor-ip': ip,
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(65_000),
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return NextResponse.json({ reply: ERROR_REPLY }, { status: 502 });
    }
    const data = await upstream.json();
    return NextResponse.json({ reply: typeof data.reply === 'string' && data.reply ? data.reply : ERROR_REPLY });
  } catch (err) {
    return NextResponse.json({ reply: ERROR_REPLY }, { status: 502 });
  }
}
