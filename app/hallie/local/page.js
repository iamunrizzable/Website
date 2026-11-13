'use client';

import { useEffect, useRef, useState } from 'react';
import { HALLIE_LOCAL_PROMPT } from './prompt';
import './page.css';

const MODELS = [
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', fallback: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', label: 'Llama 3.2 1B (faster)' },
  { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', fallback: 'Qwen2.5-3B-Instruct-q4f32_1-MLC', label: 'Qwen 2.5 3B (stronger device)' },
];

export default function HallieLocalPage() {
  const engineRef = useRef(null);
  const messagesRef = useRef([{ role: 'system', content: HALLIE_LOCAL_PROMPT }]);
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [status, setStatus] = useState('Initializing WebGPU engine...');
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState([]);
  const boxRef = useRef(null);

  useEffect(() => {
    let stop = false;
    (async () => {
      setReady(false);
      setProgress(0);
      setStatus('Initializing WebGPU engine...');
      if (typeof navigator === 'undefined' || !navigator.gpu) {
        setStatus('Error: Your browser or device does not support WebGPU.');
        return;
      }
      try {
        const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
        const chosen = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
        const onProgress = (report) => {
          if (stop) return;
          setStatus(report?.text || 'Downloading the model...');
          if (typeof report?.progress === 'number') setProgress(Math.max(0, Math.min(100, Math.round(report.progress * 100))));
        };
        const load = (id) => CreateMLCEngine(id, { initProgressCallback: onProgress });
        try {
          if (engineRef.current) await engineRef.current.reload(chosen.id);
          else engineRef.current = await load(chosen.id);
        } catch (err) {
          if (!/f16|shader/i.test(String(err?.message ?? err))) throw err;
          setStatus('This device needs the wider model build. Downloading that instead...');
          if (engineRef.current) await engineRef.current.reload(chosen.fallback);
          else engineRef.current = await load(chosen.fallback);
        }
        if (stop) return;
        setProgress(100);
        setReady(true);
        setStatus('Hallie is online (running locally on your device)');
      } catch (err) {
        if (stop) return;
        setReady(false);
        setStatus('Failed to load model: ' + (err?.message || 'unknown error'));
      }
    })();
    return () => { stop = true; };
  }, [modelId]);

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
          <select value={modelId} onChange={(e) => setModelId(e.target.value)} disabled={busy}>
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
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
    </main>
  );
}
