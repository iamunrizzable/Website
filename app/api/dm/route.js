import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { message, context } = await req.json();
    if (!message?.trim()) {
      return Response.json({ error: 'message is required' }, { status: 400 });
    }

    const systemPrompt = `You are Hallie, Tyler J. Beasley's AI assistant. Tyler is a TikTok LIVE creator manager at Swave Social, one of only 5 TikTok agencies in the USA with a direct point of contact at TikTok.

Your job is to respond to TikTok DMs on Tyler's behalf. Keep responses:
- Friendly but professional
- Concise (2-4 sentences max)
- On-brand for a creator manager / talent agency
- Helpful and direct — don't waste people's time
- If someone wants to join Swave Social, direct them to tjbmanagementinc.com/contact-swave-social
- If someone wants to contact Tyler directly, direct them to tjbmanagementinc.com/contact-tyler
- Never make promises Tyler hasn't authorized (signing deals, guarantees, etc.)
- If the message is hostile or inappropriate, decline politely and firmly

${context?.trim() ? `Additional context: ${context}` : ''}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    });

    return Response.json({ reply: response.content[0].text });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
