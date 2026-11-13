'use client';

import { useEffect, useRef, useState } from 'react';

const PHONE_THINKING = {
  id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  fallback: null,
};

const LOCAL_MODELS = {
  lite: { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', fallback: 'Llama-3.2-1B-Instruct-q4f32_1-MLC' },
  thinking: { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', fallback: 'Qwen2.5-3B-Instruct-q4f32_1-MLC' },
};

const MODEL_OK = 'hallie:model-ok';
const MODEL_BOOT = 'hallie:model-boot';

export const MODEL_CHOICES = [
  { key: 'server', label: 'Hallie' },
  { key: 'lite', label: 'Hallie (lite)' },
  { key: 'thinking', label: 'Hallie (thinking)' },
];

function knownModel(value) {
  return MODEL_CHOICES.some((m) => m.key === value);
}

function isPhone() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
  return navigator.maxTouchPoints > 1 && window.innerWidth < 900;
}

export function readModelChoice() {
  let key = 'server';
  let bounced = false;
  try {
    const boot = localStorage.getItem(MODEL_BOOT);
    const ok = localStorage.getItem(MODEL_OK);
    if (boot && boot !== 'server') {
      localStorage.removeItem(MODEL_BOOT);
      bounced = true;
      key = knownModel(ok) && ok !== boot ? ok : 'server';
    } else if (knownModel(ok)) {
      key = ok;
    }
  } catch { /* private mode stays on the server model */ }
  return { key, bounced };
}

export function useLocalModel(modelKey) {
  const engineRef = useRef(null);
  const loadGen = useRef(0);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const gen = ++loadGen.current;
    if (!modelKey || modelKey === 'server') {
      const previous = engineRef.current;
      engineRef.current = null;
      setReady(false);
      setProgress(0);
      setStatus('');
      if (modelKey === 'server') {
        try {
          localStorage.setItem(MODEL_OK, 'server');
          localStorage.removeItem(MODEL_BOOT);
        } catch { /* ignore */ }
      }
      if (previous?.unload) previous.unload().catch(() => {});
      return undefined;
    }

    (async () => {
      setReady(false);
      setProgress(0);
      setStatus('Initializing WebGPU engine...');
      if (typeof navigator === 'undefined' || !navigator.gpu) {
        setStatus('This browser cannot run a model on the device. Hallie on the server still works.');
        return;
      }
      const phone = isPhone();
      const picked = LOCAL_MODELS[modelKey] ?? LOCAL_MODELS.lite;
      const chosen = modelKey === 'thinking' && phone ? PHONE_THINKING : picked;
      try {
        localStorage.setItem(MODEL_BOOT, modelKey);
      } catch { /* ignore */ }
      try {
        const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
        if (gen !== loadGen.current) return;
        const previous = engineRef.current;
        engineRef.current = null;
        if (previous?.unload) {
          try { await previous.unload(); } catch { /* the next load replaces it */ }
        }
        if (gen !== loadGen.current) return;
        const onProgress = (report) => {
          if (gen !== loadGen.current) return;
          setStatus(report?.text || 'Downloading the model...');
          if (typeof report?.progress === 'number') setProgress(Math.max(0, Math.min(100, Math.round(report.progress * 100))));
        };
        let engine;
        try {
          engine = await CreateMLCEngine(chosen.id, { initProgressCallback: onProgress });
        } catch (err) {
          if (phone || !chosen.fallback || !/f16|shader/i.test(String(err?.message ?? err))) throw err;
          setStatus('This device needs the wider model build. Downloading that instead...');
          engine = await CreateMLCEngine(chosen.fallback, { initProgressCallback: onProgress });
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
        setStatus(phone && modelKey === 'thinking'
          ? 'On this phone, thinking uses the smaller build so Safari stays open.'
          : 'Running on this device.');
      } catch (err) {
        if (gen !== loadGen.current) return;
        setReady(false);
        setStatus('Failed to load model: ' + (err?.message || 'unknown error'));
      }
    })();
    return undefined;
  }, [modelKey]);

  return { engineRef, status, progress, ready };
}
