'use client';

import { useEffect, useRef, useState } from 'react';

const LOCAL_MODELS = {
  mini: { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', fallback: 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC' },
  lite: { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', fallback: 'Llama-3.2-1B-Instruct-q4f32_1-MLC' },
  cpu: { cpu: true, repo: 'bartowski/Llama-3.2-1B-Instruct-GGUF', file: 'Llama-3.2-1B-Instruct-Q4_K_M.gguf' },
  gemma: { id: 'gemma3-1b-it-q4f16_1-MLC', fallback: null },
  thinking: { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', fallback: 'Qwen2.5-3B-Instruct-q4f32_1-MLC' },
};

const MODEL_OK = 'hallie:model-ok';
const MODEL_BOOT = 'hallie:model-boot';

export const MODEL_CHOICES = [
  { key: 'mini', label: 'Hallie (mini)' },
  { key: 'lite', label: 'Hallie (lite)' },
  { key: 'thinking', label: 'Hallie (thinking)' },
  { key: 'gemma', label: 'Hallie (thinking)' },
  { key: 'cpu', label: 'Hallie (cpu)' },
];

// iPhone and iPad kill the tab when the 3B model asks for its memory, so
// they only get mini, with a smaller context window. iPadOS reports itself as a Mac with a touch screen.
export function isApplePhoneOrTablet() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export function availableModelChoices() {
  return isApplePhoneOrTablet() ? MODEL_CHOICES.filter((m) => m.key === 'lite' || m.key === 'gemma' || m.key === 'cpu') : MODEL_CHOICES.filter((m) => m.key !== 'mini' && m.key !== 'gemma' && m.key !== 'cpu');
}

export function readModelChoice() {
  let key = 'lite';
  let bounced = false;
  if (isApplePhoneOrTablet()) {
    // Phones always open on mini; lite is only loaded when picked. If a pick
    // closed the page last time, say so.
    let crashed = false;
    try {
      const boot = localStorage.getItem(MODEL_BOOT);
      crashed = boot === 'lite' || boot === 'gemma' || boot === 'cpu';
      localStorage.removeItem(MODEL_BOOT);
    } catch { /* ignore */ }
    return { key: 'lite', bounced: crashed };
  }
  try {
    const boot = localStorage.getItem(MODEL_BOOT);
    const ok = localStorage.getItem(MODEL_OK);
    if (boot === 'lite' || boot === 'thinking' || boot === 'mini') {
      localStorage.removeItem(MODEL_BOOT);
      bounced = true;
      key = (ok === 'lite' || ok === 'thinking') && ok !== boot ? ok : (boot === 'thinking' ? 'lite' : 'thinking');
    } else if (ok === 'lite' || ok === 'thinking') {
      key = ok;
    }
  } catch { /* private mode opens Hallie (lite) */ }
  return { key, bounced };
}

export function useLocalModel(modelKey) {
  const engineRef = useRef(null);
  const loadGen = useRef(0);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [nonce, setNonce] = useState(0);

  // Throw the loaded engine away and load it again (used after an error).
  const reload = () => {
    const previous = engineRef.current;
    engineRef.current = null;
    setReady(false);
    if (previous?.unload) previous.unload().catch(() => {});
    setNonce((n) => n + 1);
  };

  useEffect(() => {
    const gen = ++loadGen.current;
    if (!modelKey || !LOCAL_MODELS[modelKey]) {
      const previous = engineRef.current;
      engineRef.current = null;
      setReady(false);
      setProgress(0);
      setStatus('');
      if (previous?.unload) previous.unload().catch(() => {});
      return undefined;
    }

    (async () => {
      setReady(false);
      setProgress(0);
      setStatus('Initializing WebGPU engine...');
      if (typeof navigator === 'undefined' || !navigator.gpu) {
        setStatus('This browser cannot run Hallie on the device. It needs WebGPU.');
        return;
      }
      const chosen = LOCAL_MODELS[modelKey] ?? LOCAL_MODELS.lite;
      try {
        localStorage.setItem(MODEL_BOOT, modelKey);
      } catch { /* ignore */ }
      try {
        if (chosen.cpu) {
          // CPU path: llama.cpp in WebAssembly, no GPU, so the GPU memory limit does not apply.
          const { Wllama } = await import('@wllama/wllama');
          if (gen !== loadGen.current) return;
          const previous = engineRef.current;
          engineRef.current = null;
          if (previous?.unload) { try { await previous.unload(); } catch { /* replaced below */ } }
          if (gen !== loadGen.current) return;
          const wllama = new Wllama({ default: '/wllama/wllama.wasm' }, { suppressNativeLog: true });
          const threads = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated
            ? Math.max(2, Math.min(6, (navigator.hardwareConcurrency || 4) - 1))
            : 1;
          await wllama.loadModelFromHF({ repo: chosen.repo, file: chosen.file }, {
            n_gpu_layers: 0,
            n_threads: threads,
            n_ctx: 3072,
            progressCallback: ({ loaded, total }) => {
              if (gen !== loadGen.current || !total) return;
              setStatus('Downloading the model...');
              setProgress(Math.max(0, Math.min(100, Math.round((loaded / total) * 100))));
            },
          });
          if (gen !== loadGen.current) { try { await wllama.exit(); } catch { /* newer load owns the page */ } return; }
          // Same shape as the WebLLM engine so the chat code does not change. Replies are
          // capped, and the system prompt stays identical so llama.cpp reuses its processed
          // prompt instead of re-reading Hallie's persona on every message.
          engineRef.current = {
            chat: {
              completions: {
                create: (opts) => wllama.createChatCompletion({
                  ...opts,
                  max_tokens: opts.max_tokens ?? 256,
                  cache_prompt: true,
                  stream: true,
                }),
              },
            },
            interruptGenerate: () => {},
            unload: () => wllama.exit(),
          };
          try {
            localStorage.setItem(MODEL_OK, modelKey);
            localStorage.removeItem(MODEL_BOOT);
          } catch { /* ignore */ }
          setProgress(100);
          setReady(true);
          setStatus('');
          return;
        }
        const { CreateMLCEngine, prebuiltAppConfig } = await import('@mlc-ai/web-llm');
        if (gen !== loadGen.current) return;
        const previous = engineRef.current;
        engineRef.current = null;
        if (previous?.unload) {
          try { previous.interruptGenerate?.(); await previous.unload(); } catch { /* the next load replaces it */ }
        }
        if (gen !== loadGen.current) return;
        const onProgress = (report) => {
          if (gen !== loadGen.current) return;
          setStatus(report?.text || 'Downloading the model...');
          if (typeof report?.progress === 'number') setProgress(Math.max(0, Math.min(100, Math.round(report.progress * 100))));
        };
        // A smaller context window reserves far less GPU memory on phones.
        const chatOpts = isApplePhoneOrTablet() ? { context_window_size: 2048 } : undefined;
        // iPhone Safari saves the files into the Cache API but cannot read them
        // back ("Cannot fetch ..."), so phones keep the model in IndexedDB.
        const engineConfig = {
          initProgressCallback: onProgress,
          ...(isApplePhoneOrTablet() ? { appConfig: { ...prebuiltAppConfig, cacheBackend: 'indexeddb' } } : {}),
        };
        let engine;
        try {
          engine = await CreateMLCEngine(chosen.id, engineConfig, chatOpts);
        } catch (err) {
          if (!chosen.fallback || !/shader-f16/i.test(String(err?.message ?? err))) throw err;
          setStatus('This device needs the wider model build. Downloading that instead...');
          engine = await CreateMLCEngine(chosen.fallback, engineConfig, chatOpts);
        }
        if (gen !== loadGen.current) {
          try { await engine?.unload?.(); } catch { /* a newer load owns the page */ }
          return;
        }
        engineRef.current = engine;
        try {
          localStorage.setItem(MODEL_OK, modelKey);
          localStorage.removeItem(MODEL_BOOT);
        } catch { /* ignore */ }
        setProgress(100);
        setReady(true);
        setStatus('');
      } catch (err) {
        if (gen !== loadGen.current) return;
        setReady(false);
        setStatus('Failed to load model: ' + (err?.message || 'unknown error'));
      }
    })();
    return undefined;
  }, [modelKey, nonce]);

  return { engineRef, status, progress, ready, reload };
}
