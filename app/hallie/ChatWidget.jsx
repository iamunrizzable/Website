'use client';

import './ChatWidget.css';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isChatWipe } from '@/lib/chat-wipe';
import { loadHallieEngine, onEngineProgress, needsSiteTools, LOCAL_SYSTEM_PROMPT } from './localEngine';

// The Contact Hallie page is a full-page chat with her, so the floating
// bubble is left off there.
export const CHAT_PAGE_PATH = '/hallie/chat';

// This browser keeps a day of the chat so a reload doesn't wipe it.
// Once the visitor connects TikTok, the chat is saved to that account and
// opens on any device where they sign in with the same account.
const CHAT_STORAGE_KEY = 'hallie:chat:v1';
const CHAT_STORAGE_TTL_MS = 24 * 60 * 60 * 1000;
const CHAT_STORAGE_MAX = 50;

function storableMessages(messages) {
  return messages.slice(-CHAT_STORAGE_MAX).map(({ id, text, sender, time }) => ({ id, text, sender, time }));
}

// fullPage: render the chat as the page itself (no bubble, always open).
export default function ChatWidget({ fullPage = false }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef(null);
  const pageRef = useRef(null);
  const holdSave = useRef(false);
  const [pageHeight, setPageHeight] = useState(null);
  const [restored, setRestored] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [accountOn, setAccountOn] = useState(false);
  const [accountTag, setAccountTag] = useState(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [engineStatus, setEngineStatus] = useState('Initializing WebGPU engine...');
  const engineRef = useRef(null);
  const greeted = useRef(false);
  const [syncNote, setSyncNote] = useState('');
  // The floating widget stays mounted (but hidden) on the chat page; only the
  // visible one may save, or its empty list would overwrite the real chat.
  const hidden = !fullPage && pathname === CHAT_PAGE_PATH;

  // Full-page chat: fill exactly the screen below whatever sits above it
  // (banner, menu), and refit when that changes (banner loads, rotation).
  useEffect(() => {
    if (!fullPage) return undefined;
    const fit = () => {
      const el = pageRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setPageHeight(Math.max(380, Math.round(window.innerHeight - top - 12)));
    };
    fit();
    window.addEventListener('resize', fit);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit);
    ro?.observe(document.body);
    return () => {
      window.removeEventListener('resize', fit);
      ro?.disconnect();
    };
  }, [fullPage]);

  // Scroll only the message list (scrollIntoView would also scroll the
  // page, which jumps the full-page chat on the Contact Hallie page).
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const addHallieMessage = (text, extra = {}) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender: 'hallie', time: now(), ...extra }]);
  };

  // Log in: remember that the chat was open so the login returns them to
  // this page with the chat open again.
  const reopenAfterLogin = () => {
    try { sessionStorage.setItem('hallie:open', '1'); } catch { /* storage blocked: chat just starts closed */ }
  };
  const goLogin = () => {
    reopenAfterLogin();
    window.location.assign(`/auth/tiktok/system-login?from=${encodeURIComponent(window.location.pathname)}`);
  };

  // Log out: clears the TikTok connection (and an admin session, if any) in
  // this browser. A chat saved to the TikTok account stays there.
  const logOut = async () => {
    setSyncBusy(true);
    try {
      await fetch('/api/system/disconnect', { method: 'POST' });
      await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
      setAccountOn(false);
      setAccountTag(null);
      setSyncOpen(false);
      try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch { /* ignore */ }
      setMessages([{ id: Date.now() + Math.random(), text: "You're logged out.", sender: 'hallie', time: now() }]);
      window.dispatchEvent(new Event('hallie:connection-changed'));
    } catch {
      addHallieMessage("I couldn't log you out. Please try again.");
    } finally {
      setSyncBusy(false);
    }
  };

  // Back from a login that started in the chat: open it again.
  useEffect(() => {
    try {
      if (sessionStorage.getItem('hallie:open') === '1') {
        sessionStorage.removeItem('hallie:open');
        setIsOpen(true);
      }
    } catch { /* ignore */ }
  }, []);

  // A page can ask Hallie to handle the TikTok login: it dispatches
  // 'hallie:connect' and the chat opens with the connect button (once).
  useEffect(() => {
    const onConnect = () => {
      setIsOpen(true);
      setMessages(prev => (prev.some(m => m.connectPrompt) ? prev : [...prev, {
        id: Date.now() + Math.random(),
        text: "Connect your TikTok account and I'll run your moderation tools for you.",
        sender: 'hallie',
        time: now(),
        connect: true,
        connectPrompt: true,
      }]));
    };
    window.addEventListener('hallie:connect', onConnect);
    return () => window.removeEventListener('hallie:connect', onConnect);
  }, []);

  // The whole conversation, so she is not answering from the last few lines.
  const buildHistory = () => messages.slice(-40).map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.pending ? `${m.text}\n[${m.pendingState === 'cancelled' ? 'Cancelled' : m.pendingState === 'done' ? 'Confirmed' : 'Waiting for confirmation'}: ${m.pending.summary}]` : m.text,
  }));

  const submitText = async (text) => {
    if (!text.trim()) return;
    const wiping = isChatWipe(text);
    if (wiping) holdSave.current = true;
    else holdSave.current = false;

    if (!needsSiteTools(text) && engineRef.current) {
      const history = buildHistory();
      const userMessage = { id: Date.now(), text, sender: 'user', time: now() };
      const bubbleId = Date.now() + 1;
      setMessages(prev => [...prev, userMessage, { id: bubbleId, text: '...', sender: 'hallie', time: now() }]);
      setInput('');
      setIsTyping(true);
      const prior = history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
      let full = '';
      try {
        const chunks = await engineRef.current.chat.completions.create({
          messages: [{ role: 'system', content: LOCAL_SYSTEM_PROMPT }, ...prior, { role: 'user', content: text }],
          stream: true,
        });
        for await (const chunk of chunks) {
          full += chunk.choices?.[0]?.delta?.content || '';
          const shown = full;
          setMessages((prev) => prev.map((m) => (m.id === bubbleId ? { ...m, text: shown } : m)));
        }
        if (!full) setMessages((prev) => prev.map((m) => (m.id === bubbleId ? { ...m, text: "Sorry, I couldn't come up with an answer." } : m)));
      } catch (err) {
        setMessages((prev) => prev.map((m) => (m.id === bubbleId ? { ...m, text: 'Error generating response: ' + (err?.message || 'unknown error') } : m)));
      } finally {
        setIsTyping(false);
      }
      return;
    }

    const history = buildHistory();
    const userMessage = { id: Date.now(), text, sender: 'user', time: now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      const data = await res.json();
      if (data.chatDeleted === true) {
        holdSave.current = true;
        try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch { /* ignore */ }
        setMessages([{ id: Date.now() + Math.random(), text: data.reply || 'Done. This chat is wiped.', sender: 'hallie', time: now() }]);
        return;
      }

      const pa = data.pendingAction;
      addHallieMessage(data.reply || 'I received your message.', {
        ...(pa && typeof pa.id === 'string' && typeof pa.summary === 'string'
          ? { pending: { id: pa.id, summary: pa.summary, count: Number(pa.count) || 1 }, pendingState: 'open' }
          : {}),
        connect: data.connect === true,
        adminLogin: data.adminLogin === true,
      });
    } catch (err) {
      addHallieMessage('Connection error. Please try emailing me at hallie@tjbmanagementinc.com instead.');
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    submitText(input);
  };

  // Admin login: remember what the admin just asked for, send them through
  // the login (password + authenticator code), and re-send it on return.
  const goAdminLogin = () => {
    const lastAsk = [...messages].reverse().find(m => m.sender === 'user')?.text;
    try { if (lastAsk) sessionStorage.setItem('hallie:resume', lastAsk); } catch { /* storage blocked: they just ask again */ }
    reopenAfterLogin();
    window.location.assign(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  // Restore the saved conversation. Buttons that can't work any more are
  // dropped: confirmations expire, and the connect / admin-login buttons
  // are stale once the visitor has logged in.
  // Layout effect: runs before the browser paints, so the saved chat is
  // already there on the first frame.
  useLayoutEffect(() => {
    if (hidden) return;
    try {
      const saved = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) ?? 'null');
      if (saved && Date.now() - saved.savedAt < CHAT_STORAGE_TTL_MS && Array.isArray(saved.messages)) {
        let msgs = saved.messages
          .filter(m => m && typeof m.text === 'string' && (m.sender === 'user' || m.sender === 'hallie'))
          .map(({ pending, pendingState, connect, connectPrompt, adminLogin, ...m }) => (
            pending && pendingState === 'done' ? { ...m, pending, pendingState } : m
          ));
        // Admin login re-sends the last ask on return; drop its first copy.
        const ask = sessionStorage.getItem('hallie:resume');
        if (ask) {
          const at = msgs.map(m => m.sender === 'user' && m.text === ask).lastIndexOf(true);
          if (at !== -1) msgs = msgs.slice(0, at);
        }
        if (msgs.length) setMessages(msgs);
      } else if (saved) {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      }
    } catch { /* storage blocked or unreadable: start blank */ }
    setRestored(true);
  }, [hidden]);

  useEffect(() => {
    if (!restored || hidden) return undefined;
    let cancel = false;
    (async () => {
      try {
        const res = await fetch('/api/hallie/chats');
        const data = await res.json();
        if (cancel) return;
        if (!res.ok || !data.connected) {
          setAccountOn(false);
          setAccountTag(null);
          return;
        }
        setAccountOn(true);
        setAccountTag(data.tag || null);
        let local = null;
        try { local = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) ?? 'null'); } catch { /* ignore */ }
        const wrongAccount = local?.tag && data.tag && local.tag !== data.tag;
        const sameAccount = local?.tag && data.tag && local.tag === data.tag;
        if (wrongAccount) {
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        } else if (!sameAccount && data.messages?.length) {
          setMessages(data.messages);
        } else if (sameAccount && data.messages?.length && (data.savedAt || 0) >= (local?.savedAt || 0)) {
          setMessages(data.messages);
        }
      } catch { /* offline: the copy in this browser still works */ }
      finally { if (!cancel) setCloudReady(true); }
    })();
    return () => { cancel = true; };
  }, [restored, hidden]);

  useEffect(() => {
    if (holdSave.current) return;
    if (!restored || hidden || messages.length === 0) return;
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
        savedAt: Date.now(),
        tag: accountTag || undefined,
        messages: storableMessages(messages),
      }));
    } catch { /* storage full or blocked: chat still works, just not saved */ }
  }, [messages, restored, hidden, accountTag]);

  useEffect(() => {
    if (!cloudReady || hidden || !accountOn || messages.length === 0) return undefined;
    const handle = setTimeout(() => {
      if (holdSave.current) return;
      fetch('/api/hallie/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', messages: storableMessages(messages) }),
      }).then((res) => {
        if (res.status === 401) setAccountOn(false);
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(handle);
  }, [messages, cloudReady, accountOn, hidden]);

  const deleteSavedChat = async () => {
    setSyncBusy(true);
    setSyncNote('');
    try {
      const res = await fetch('/api/hallie/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not delete');
      setMessages([]);
      try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch { /* ignore */ }
      setSyncNote('Deleted. It is gone on every device signed into this TikTok account.');
    } catch (err) {
      setSyncNote(err.message || 'Could not delete.');
    } finally {
      setSyncBusy(false);
    }
  };

  useEffect(() => {
    if (!isOpen && !fullPage) return undefined;
    let stop = false;
    const unsub = onEngineProgress((text) => { if (!stop) setEngineStatus(text); });
    loadHallieEngine()
      .then((engine) => {
        if (stop) return;
        engineRef.current = engine;
        setEngineStatus('Hallie is online (Running locally on your device)');
      })
      .catch((err) => {
        if (stop) return;
        engineRef.current = null;
        setEngineStatus(err?.code === 'no-gpu'
          ? 'Error: Your browser or device does not support WebGPU.'
          : 'Failed to load model: ' + (err?.message || 'unknown error'));
      });
    return () => { stop = true; unsub(); };
  }, [isOpen, fullPage]);

  useEffect(() => {
    if (!restored || greeted.current || !engineRef.current || messages.length) return;
    greeted.current = true;
    setMessages([{ id: 'hello', text: "Hi! I'm Hallie from TJB Management Inc. How can I help you today?", sender: 'hallie', time: now() }]);
  }, [restored, messages.length, engineStatus]);

  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;
    let ask = null;
    try {
      ask = sessionStorage.getItem('hallie:resume');
      sessionStorage.removeItem('hallie:resume');
    } catch { /* ignore */ }
    if (ask) {
      setIsOpen(true);
      submitText(ask);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPendingState = (msgId, pendingState) => {
    setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, pendingState } : m)));
  };

  const confirmAction = async (msg) => {
    if (msg.pendingState !== 'open') return;
    setPendingState(msg.id, 'confirming');
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: msg.pending.id })
      });
      const data = await res.json();
      setPendingState(msg.id, 'done');
      addHallieMessage(data.reply || 'Done.', { connect: data.connect === true, adminLogin: data.adminLogin === true });
      if (data.disconnected === true) {
        // Signing out clears this browser only. The saved chat stays on the
        // TikTok account until they delete it.
        setAccountOn(false);
        setAccountTag(null);
        try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch { /* ignore */ }
        setMessages([{ id: Date.now() + Math.random(), text: data.reply || 'Done.', sender: 'hallie', time: now() }]);
        window.dispatchEvent(new Event('hallie:connection-changed'));
      }
    } catch (err) {
      setPendingState(msg.id, 'open');
      addHallieMessage('Connection error. Please try again, or email support@tjbmanagementinc.com.');
    } finally {
      setIsTyping(false);
    }
  };

  const cancelAction = (msg) => {
    if (msg.pendingState !== 'open') return;
    setPendingState(msg.id, 'cancelled');
    addHallieMessage('Cancelled — nothing was changed.');
  };

  if (!fullPage && pathname === CHAT_PAGE_PATH) return null;

  return (
    <div ref={pageRef} className={`chat-widget${fullPage ? ' chat-page' : ''}`}>
      {!fullPage && (
        <button
          className={`chat-toggle ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Chat with Hallie"
        >
          ✨
        </button>
      )}

      {(isOpen || fullPage) && (
        <div className="chat-box" style={fullPage && pageHeight ? { height: pageHeight } : undefined}>
          <div className="chat-header">
            <span>Chat with Hallie™</span>
            <span className="chat-header-actions">
              <button type="button" className="chat-saved" onClick={() => setSyncOpen((open) => !open)}>
                {accountOn ? 'Saved' : 'Account'}
              </button>
              <button type="button" className="chat-saved" onClick={accountOn ? logOut : goLogin} disabled={syncBusy}>
                {accountOn ? 'Log out' : 'Log in'}
              </button>
              {fullPage
                ? <a className="chat-back" href="/hallie">← Back to Hallie</a>
                : <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">✕</button>}
            </span>
          </div>
          <div className="chat-engine">{engineStatus}</div>
          {syncOpen && (
            <div className="chat-sync">
              {accountOn ? (
                <>
                  <p>This chat is saved to the TikTok account you connected. On another device, connect that same account and the chat opens there.</p>
                  <button type="button" onClick={deleteSavedChat} disabled={syncBusy}>
                    {syncBusy ? 'Deleting…' : 'Delete saved chat'}
                  </button>
                </>
              ) : (
                <>
                  <p>Connect your TikTok account and this chat is saved to it. Sign in with that same account on another phone or computer and the chat is there. Someone else’s TikTok login cannot open it.</p>
                  <button type="button" onClick={goLogin}>
                    Connect TikTok
                  </button>
                </>
              )}
              {syncNote && <p className="chat-sync-note">{syncNote}</p>}
            </div>
          )}
          <div className="chat-messages" ref={messagesRef}>
            {fullPage && restored && messages.length === 0 && (
              <div className="chat-message hallie">
                <span className="bubble">Hey, I'm Hallie. Ask me anything.</span>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <span className="bubble">{msg.text}</span>
                {msg.pending && (
                  <div className="chat-confirm">
                    <p>{msg.pending.summary}</p>
                    {msg.pendingState === 'open' || msg.pendingState === 'confirming' ? (
                      <div className="chat-confirm-buttons">
                        <button
                          type="button"
                          className="confirm"
                          onClick={() => confirmAction(msg)}
                          disabled={msg.pendingState !== 'open' || isTyping}
                        >
                          {msg.pendingState === 'confirming' ? 'Working…' : ((msg.pending.count || 1) > 1 ? 'Confirm all' : 'Confirm')}
                        </button>
                        <button
                          type="button"
                          className="cancel"
                          onClick={() => cancelAction(msg)}
                          disabled={msg.pendingState !== 'open' || isTyping}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="chat-confirm-status">{msg.pendingState === 'done' ? 'Confirmed' : 'Cancelled'}</span>
                    )}
                  </div>
                )}
                {msg.connect && (
                  <button
                    type="button"
                    className="chat-connect"
                    onClick={goLogin}
                  >
                    connect me to your tiktok
                  </button>
                )}
                {msg.adminLogin && (
                  <button type="button" className="chat-connect" onClick={goAdminLogin}>
                    log in as admin
                  </button>
                )}
                <span className="time">{msg.time}</span>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message hallie typing">
                <span className="bubble">Hallie is typing<span className="dots">…</span></span>
              </div>
            )}
          </div>
          <form onSubmit={sendMessage} className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Hallie…"
              disabled={isTyping}
            />
            <button type="submit" disabled={!input.trim() || isTyping}>Send</button>
          </form>
          <div className="chat-terms">
            By chatting you agree to the{' '}
            <a href="/legal/policies/and/procedures/hallie/terms" target="_blank" rel="noopener noreferrer">Hallie Terms</a>.
          </div>
        </div>
      )}
    </div>
  );
}
