// Hallie's brain — one place that talks to whatever LLMs power her.
//
// Speaks the OpenAI chat-completions format. Providers are tried in order
// and each model is its own candidate, so a rate limit, an exhausted free
// quota, a model that doesn't do tools, or a timeout just moves on to the
// next one instead of failing the chat:
//   1. OpenRouter free models  (needs OPENROUTER_API_KEY in Vercel)
//   2. Groq models             (HALLIE_LLM_KEY or GROQ_API_KEY)
// Groq's free tier caps tokens per minute PER MODEL (8K on gpt-oss-120b —
// less than one 3-call tool chat), so several Groq models are listed: each
// has its own bucket. With no OpenRouter key set, only Groq is used.
//
// Overrides (all optional): HALLIE_OPENROUTER_MODELS / HALLIE_GROQ_MODELS
// (comma-separated, best first). Setting HALLIE_LLM_URL swaps everything
// for ONE custom OpenAI-compatible endpoint (HALLIE_LLM_MODEL/HALLIE_LLM_KEY),
// e.g. a self-hosted Ollama box.
//
// The default Groq model is openai/gpt-oss-120b, not Llama 3.3 70B — Llama's
// chat-tuning kept softening blunt drafts (padding refusals with warmth,
// adding a smiley to take the edge off) even after the prompt explicitly
// told it not to; that's a model-level bias prompting alone couldn't fully
// override. That is why the Writer prefers Groq (see callHallieLLM).

// (URL overrides exist for tests only.)
const OPENROUTER_URL = process.env.HALLIE_OPENROUTER_URL ?? 'https://openrouter.ai/api/v1/chat/completions';
const GROQ_URL = process.env.HALLIE_GROQ_URL ?? 'https://api.groq.com/openai/v1/chat/completions';

const list = (value, fallback) => (value ? value.split(',') : fallback).map((s) => s.trim()).filter(Boolean);

// openrouter/free routes to whichever free model can serve the request;
// the explicit ones follow in case it is out of quota.
const OPENROUTER_MODELS = list(process.env.HALLIE_OPENROUTER_MODELS, [
  'openrouter/free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'minimax/minimax-m3.1-flash:free',
  'google/gemma-4-31b-it:free',
]);
const GROQ_MODELS = [...new Set([
  process.env.HALLIE_LLM_MODEL ?? 'openai/gpt-oss-120b',
  ...list(process.env.HALLIE_GROQ_MODELS, ['openai/gpt-oss-20b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant']),
])];

const PER_CALL_TIMEOUT_MS = 25_000;
const TOTAL_BUDGET_MS = 55_000; // stays inside a serverless function limit
const MAX_RATE_LIMIT_WAIT_S = 12;

const groqKey = () => process.env.HALLIE_LLM_KEY ?? process.env.GROQ_API_KEY;

export function hallieLLMConfigured() {
  return Boolean(process.env.HALLIE_LLM_URL ? groqKey() : (process.env.OPENROUTER_API_KEY || groqKey()));
}

// prefer: 'openrouter' (default) or 'groq' — which provider goes first.
function candidates(prefer) {
  if (process.env.HALLIE_LLM_URL) {
    return [{ name: 'custom', url: process.env.HALLIE_LLM_URL, key: groqKey(), model: process.env.HALLIE_LLM_MODEL ?? GROQ_MODELS[0] }];
  }
  const or = process.env.OPENROUTER_API_KEY
    ? OPENROUTER_MODELS.map((model) => ({
        name: `openrouter:${model}`, url: OPENROUTER_URL, key: process.env.OPENROUTER_API_KEY, model,
        headers: { 'HTTP-Referer': 'https://tjbmanagementinc.com', 'X-Title': 'Hallie' },
      }))
    : [];
  const groq = groqKey()
    ? GROQ_MODELS.map((model) => ({ name: `groq:${model}`, url: GROQ_URL, key: groqKey(), model }))
    : [];
  return prefer === 'groq' ? [...groq, ...or] : [...or, ...groq];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One chat-completions call, walking the candidates until one gives a usable
// answer. usable(message) says whether a reply is good enough to return.
// Throws one readable error listing why each candidate failed.
async function requestCompletion(body, { prefer = 'openrouter', usable = () => true } = {}) {
  const cands = candidates(prefer);
  if (!cands.length) throw new Error('No LLM configured — set OPENROUTER_API_KEY and/or GROQ_API_KEY in Vercel');
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const errors = [];

  for (let pass = 0; pass < 2; pass++) {
    let allRateLimited = true;
    let shortestRetry = Infinity;
    for (const c of cands) {
      const left = deadline - Date.now();
      if (left < 2000) break;
      try {
        const res = await fetch(c.url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${c.key}`, 'Content-Type': 'application/json', ...c.headers },
          body: JSON.stringify({ model: c.model, ...body }),
          signal: AbortSignal.timeout(Math.min(PER_CALL_TIMEOUT_MS, left)),
        });
        const data = await res.json().catch(() => null);
        const message = data?.choices?.[0]?.message;
        if (res.ok && message && usable(message)) {
          if (errors.length) console.warn(`[llm] answered by ${c.name} after: ${errors.join(' | ')}`);
          return data;
        }
        const why = res.ok ? 'empty or unusable reply' : (data?.error?.message ?? `HTTP ${res.status}`);
        errors.push(`${c.name}: ${res.status} ${String(why).slice(0, 160)}`);
        if (res.status === 429) {
          const wait = Number(res.headers.get('retry-after'));
          if (wait > 0) shortestRetry = Math.min(shortestRetry, wait);
        } else {
          allRateLimited = false;
        }
      } catch (err) {
        allRateLimited = false;
        errors.push(`${c.name}: ${err?.name === 'TimeoutError' ? 'timed out' : err?.message ?? 'network error'}`);
      }
    }
    // Everyone was rate-limited but only for a few seconds: wait it out once.
    if (pass === 0 && allRateLimited && shortestRetry <= MAX_RATE_LIMIT_WAIT_S && Date.now() + shortestRetry * 1000 < deadline) {
      await sleep(Math.max(shortestRetry, 1) * 1000);
      continue;
    }
    break;
  }
  throw new Error(`All LLM providers failed — ${errors.join(' | ')}`);
}

// messages: [{role: 'system'|'user'|'assistant', content: string}, ...]
// Returns the assistant reply text; throws with a readable message on failure.
// Used by the Hallie Writer: Groq first (see the note at the top), OpenRouter as backup.
export async function callHallieLLM(messages, { maxTokens = 400, prefer = 'groq' } = {}) {
  const data = await requestCompletion(
    { max_tokens: maxTokens, messages },
    { prefer, usable: (m) => typeof m.content === 'string' && m.content.trim() },
  );
  return data.choices[0].message.content.trim();
}

// Function-calling variant (OpenAI `tools` format) for the chat widget's
// tool paths. OpenRouter first, Groq as the fallback. Not every model does
// tool calls (or parallel ones); an unusable reply just moves to the next model.
// Returns { content, tool_calls } — the caller runs the tool loop.
export async function callHallieLLMWithTools(messages, tools, { maxTokens = 800 } = {}) {
  const data = await requestCompletion(
    { max_tokens: maxTokens, messages, tools, tool_choice: 'auto' },
    { prefer: 'openrouter', usable: (m) => (typeof m.content === 'string' && m.content.trim()) || (Array.isArray(m.tool_calls) && m.tool_calls.length) },
  );
  const message = data.choices[0].message;
  return {
    content: typeof message.content === 'string' ? message.content.trim() : '',
    tool_calls: Array.isArray(message.tool_calls) ? message.tool_calls : [],
  };
}
