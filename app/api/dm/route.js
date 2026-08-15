import Anthropic from '@anthropic-ai/sdk';
import { isValidAdminKey } from '@/lib/auth';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Gated: this calls a metered third-party API and splices `context` directly
// into the system prompt, so an unauthenticated caller could both run up the
// Anthropic bill at will and inject arbitrary system-prompt content. Nothing
// in this codebase currently calls this route — when a real TikTok DM
// webhook integration is wired up, give it the same x-admin-key.
export async function POST(req) {
  if (!isValidAdminKey(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { message, context } = await req.json();
    if (!message?.trim()) {
      return Response.json({ error: 'message is required' }, { status: 400 });
    }

    const systemPrompt = `You are Hallie, Tyler's AI assistant. Tyler is a TikTok LIVE Creator Manager and agency founder with direct industry connections at TikTok.

Your job is to respond to TikTok DMs on Tyler's behalf. Keep responses:
- Friendly but professional
- Concise (2-4 sentences max)
- On-brand for a creator manager / agency founder
- Helpful and direct — don't waste people's time
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
