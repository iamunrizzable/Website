// Hallie's brain — one place that talks to whatever LLM powers her.
//
// Speaks the OpenAI chat-completions format, which nearly every provider
// and self-hosted runtime accepts. Defaults to Groq's free tier; to swap
// Hallie onto a different brain (a self-hosted Ollama box, another
// provider), set HALLIE_LLM_URL / HALLIE_LLM_MODEL / HALLIE_LLM_KEY in
// Vercel — no code change. Ollama example:
//   HALLIE_LLM_URL=https://your-tailscale-host/v1/chat/completions
//   HALLIE_LLM_MODEL=llama3.3   HALLIE_LLM_KEY=anything-nonempty
const LLM_URL = process.env.HALLIE_LLM_URL ?? 'https://api.groq.com/openai/v1/chat/completions';
// openai/gpt-oss-120b, not Llama 3.3 70B — Llama's chat-tuning kept
// softening blunt drafts (padding refusals with warmth, adding a smiley
// to take the edge off) even after the prompt explicitly told it not
// to; that's a model-level bias prompting alone couldn't fully override.
// Confirmed on Groq's free tier (console.groq.com/docs/model/openai/
// gpt-oss-120b) — no card, 1K requests/day, plenty for this tool.
const LLM_MODEL = process.env.HALLIE_LLM_MODEL ?? 'openai/gpt-oss-120b';

export function hallieLLMConfigured() {
  return Boolean(process.env.HALLIE_LLM_KEY ?? process.env.GROQ_API_KEY);
}

// messages: [{role: 'system'|'user'|'assistant', content: string}, ...]
// Returns the assistant reply text; throws with a readable message on failure.
export async function callHallieLLM(messages, { maxTokens = 400 } = {}) {
  const key = process.env.HALLIE_LLM_KEY ?? process.env.GROQ_API_KEY;
  const res = await fetch(LLM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: LLM_MODEL, max_tokens: maxTokens, messages }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message ?? `LLM API error (${res.status})`);
  }

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error('LLM returned an empty response');
  }
  return reply;
}
