import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    return NextResponse.json({
      reply: "I've received your message! I'll get back to you soon. You can also email me directly at hallie@tjbmanagementinc.com."
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
