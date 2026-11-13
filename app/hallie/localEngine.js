import { isChatWipe } from '@/lib/chat-wipe';

// The model the visitor's own device runs. q4f16 is the small one; q4f32 is
// the same model for devices whose GPU has no 16-bit shader support.
const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
const MODEL_FALLBACK = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';

export const LOCAL_SYSTEM_PROMPT = `You are Hallie, the official AI assistant for TJB Management Inc. (tjbmanagementinc.com), a Creator Network & Tools Provider. Be helpful, professional, and concise.`;

const listeners = new Set();
let enginePromise = null;
let readyEngine = null;

function tell(text) {
  for (const fn of listeners) fn(text);
}

export function onEngineProgress(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function needsSiteTools(text) {
  if (isChatWipe(text)) return true;
  return /\b(tiktok|comments?|videos?|posts?|rules?|filters?|scanner|followers?|publish|disconnect|reconnect|my account)\b/i.test(text);
}

export function loadHallieEngine() {
  if (readyEngine) return Promise.resolve(readyEngine);
  if (!enginePromise) {
    enginePromise = (async () => {
      if (typeof navigator === 'undefined' || !navigator.gpu) {
        const err = new Error('Your browser or device does not support WebGPU.');
        err.code = 'no-gpu';
        throw err;
      }
      tell('Initializing WebGPU engine...');
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
      const progress = (report) => tell(report?.text || 'Initializing WebGPU engine...');
      try {
        readyEngine = await CreateMLCEngine(MODEL_ID, { initProgressCallback: progress });
      } catch (err) {
        if (!/f16|shader/i.test(String(err?.message ?? ''))) throw err;
        readyEngine = await CreateMLCEngine(MODEL_FALLBACK, { initProgressCallback: progress });
      }
      tell('Hallie is online (Running locally on your device)');
      return readyEngine;
    })().catch((err) => {
      enginePromise = null;
      throw err;
    });
  }
  return enginePromise;
}
