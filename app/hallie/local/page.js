'use client';

import { useEffect, useRef, useState } from 'react';
import { HALLIE_LOCAL_PROMPT } from './prompt';
import { AccountPanels } from './panels';
import './page.css';

const PHONE_THINKING = {
  id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  fallback: null,
  label: 'Hallie (thinking)',
};

const MODELS = [
  { key: 'lite', id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', fallback: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', label: 'Hallie (lite)' },
  { key: 'thinking', id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', fallback: 'Qwen2.5-3B-Instruct-q4f32_1-MLC', label: 'Hallie (thinking)' },
];

function isPhone() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
  return navigator.maxTouchPoints > 1 && window.innerWidth < 900;
}

export default function HallieLocalPage() {
  const engineRef = useRef(null);
  const messagesRef = useRef([{ role: 'system', content: HALLIE_LOCAL_PROMPT }]);
  const [modelKey, setModelKey] = useState('lite');
  const [status, setStatus] = useState('Initializing WebGPU engine...');
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState([]);
  const boxRef = useRef(null);

  const loadGen = useRef(0);

  useEffect(() => {
    const gen = ++loadGen.current;
    (async () => {
      setReady(false);
      setProgress(0);
      setStatus('Initializing WebGPU engine...');
      if (typeof navigator === 'undefined' || !navigator.gpu) {
        setStatus('Error: Your browser or device does not support WebGPU.');
        return;
      }
      const phone = isPhone();
      const picked = MODELS.find((m) => m.key === modelKey) ?? MODELS[0];
      const chosen = picked.key === 'thinking' && phone ? PHONE_THINKING : picked;
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
        setProgress(100);
        setReady(true);
        setStatus(phone && picked.key === 'thinking'
          ? 'Hallie is online. This phone uses the smaller thinking build so Safari stays open.'
          : 'Hallie is online (running locally on your device)');
      } catch (err) {
        if (gen !== loadGen.current) return;
        setReady(false);
        setStatus('Failed to load model: ' + (err?.message || 'unknown error'));
      }
    })();
  }, [modelKey]);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [chat, busy]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !engineRef.current || busy) return;
    setInput('');
    setBusy(true);
    const prior = messagesRef.current;
    messagesRef.current = [...prior, { role: 'user', content: text }];
    setChat((rows) => [...rows, { role: 'user', text }, { role: 'assistant', text: '' }]);
    let full = '';
    try {
      const chunks = await engineRef.current.chat.completions.create({
        messages: messagesRef.current,
        stream: true,
      });
      for await (const chunk of chunks) {
        full += chunk.choices?.[0]?.delta?.content || '';
        const shown = full;
        setChat((rows) => {
          const next = rows.slice();
          next[next.length - 1] = { role: 'assistant', text: shown || '...' };
          return next;
        });
      }
      messagesRef.current = [...messagesRef.current, { role: 'assistant', content: full }];
    } catch (err) {
      const fail = 'Error generating response: ' + (err?.message || 'unknown error');
      setChat((rows) => {
        const next = rows.slice();
        next[next.length - 1] = { role: 'assistant', text: fail };
        return next;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="local-hallie">
      <header>
        <p className="local-kicker"><a href="/hallie">Hallie™</a> · on this device</p>
        <h1>Hallie</h1>
        <p className="local-status">{status}</p>
        <label className="local-model">
          Model
          <select value={modelKey} onChange={(e) => setModelKey(e.target.value)} disabled={busy}>
            {MODELS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </label>
        <div className="local-bar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} role="progressbar">
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>
      <div className="local-log" ref={boxRef}>
        {chat.length === 0 && ready && (
          <p className="local-msg assistant">Hi. I'm Hallie from TJB Management Inc. How can I help you?</p>
        )}
        {chat.map((row, i) => (
          <p key={i} className={`local-msg ${row.role}`}>{row.text}</p>
        ))}
      </div>
      <form onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Hallie anything..."
          disabled={!ready || busy}
          required
        />
        <button type="submit" disabled={!ready || busy}>Send</button>
      </form>
      <AccountPanels />
    </main>
  );
}
