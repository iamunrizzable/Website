'use client';

import './ChatWidget.css';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// The Contact Hallie page is a full-page chat with her, so the floating
// bubble is left off there.
export const CHAT_PAGE_PATH = '/hallie/chat';

// This browser keeps a day of the chat so a reload doesn't wipe it.
// "Saved" stores that same chat under a code the visitor keeps, so another
// device can open it, and Delete removes that copy.
const CHAT_STORAGE_KEY = 'hallie:chat:v1';
const CHAT_CODE_KEY = 'hallie:chat-code:v1';
const CHAT_STORAGE_TTL_MS = 24 * 60 * 60 * 1000;
const CHAT_STORAGE_MAX = 50;

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function makeChatCode() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}`;
}

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
  const [pageHeight, setPageHeight] = useState(null);
  const [restored, setRestored] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [syncCode, setSyncCode] = useState(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncNote, setSyncNote] = useState('');
  const [openCode, setOpenCode] = useState('');
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

  // Last ~10 messages for the connected-account (tool) path; the server
  // ignores this on the relay path. Pending confirmations are described so
  // Hallie knows what's waiting or what was cancelled.
  const buildHistory = () => messages.slice(-10).map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.pending ? `${m.text}\n[${m.pendingState === 'cancelled' ? 'Cancelled' : m.pendingState === 'done' ? 'Confirmed' : 'Waiting for confirmation'}: ${m.pending.summary}]` : m.text,
  }));

  const submitText = async (text) => {
    if (!text.trim()) return;

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
    let code = null;
    try { code = localStorage.getItem(CHAT_CODE_KEY); } catch { /* ignore */ }
    if (!code) {
      setCloudReady(true);
      return undefined;
    }
    setSyncCode(code);
    let cancel = false;
    (async () => {
      try {
        const res = await fetch('/api/hallie/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'load', code }),
        });
        const data = await res.json();
        if (cancel || !res.ok || !Array.isArray(data.messages) || !data.messages.length) return;
        let localAt = 0;
        try {
          localAt = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) ?? 'null')?.savedAt ?? 0;
        } catch { /* ignore */ }
        if ((data.savedAt || 0) >= localAt) setMessages(data.messages);
      } catch { /* offline: the copy in this browser still works */ }
      finally { if (!cancel) setCloudReady(true); }
    })();
    return () => { cancel = true; };
  }, [restored, hidden]);

  useEffect(() => {
    if (!restored || hidden || messages.length === 0) return;
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), messages: storableMessages(messages) }));
    } catch { /* storage full or blocked: chat still works, just not saved */ }
  }, [messages, restored, hidden]);

  useEffect(() => {
    if (!cloudReady || hidden || !syncCode || messages.length === 0) return undefined;
    const handle = setTimeout(() => {
      fetch('/api/hallie/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', code: syncCode, messages: storableMessages(messages) }),
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(handle);
  }, [messages, cloudReady, syncCode, hidden]);

  const rememberCode = (code) => {
    setSyncCode(code);
    setCloudReady(true);
    try { localStorage.setItem(CHAT_CODE_KEY, code); } catch { /* ignore */ }
  };

  const saveChat = async () => {
    setSyncBusy(true);
    setSyncNote('');
    const code = syncCode || makeChatCode();
    try {
      const res = await fetch('/api/hallie/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', code, messages: storableMessages(messages) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save');
      rememberCode(code);
      setSyncNote('Saved. Keep this code. It opens the chat on your other devices.');
    } catch (err) {
      setSyncNote(err.message || 'Could not save.');
    } finally {
      setSyncBusy(false);
    }
  };

  const openSavedChat = async (e) => {
    e.preventDefault();
    setSyncBusy(true);
    setSyncNote('');
    try {
      const res = await fetch('/api/hallie/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load', code: openCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not open that chat');
      if (!data.messages?.length) {
        setSyncNote('Nothing is saved under that code.');
        return;
      }
      const code = openCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}-${code.slice(12, 16)}`;
      rememberCode(formatted);
      setMessages(data.messages);
      setSyncNote('Opened. This device will keep it updated.');
      setOpenCode('');
    } catch (err) {
      setSyncNote(err.message || 'Could not open that chat.');
    } finally {
      setSyncBusy(false);
    }
  };

  const deleteSavedChat = async () => {
    if (!syncCode) return;
    setSyncBusy(true);
    setSyncNote('');
    try {
      const res = await fetch('/api/hallie/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', code: syncCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not delete');
      setSyncCode(null);
      setMessages([]);
      try {
        localStorage.removeItem(CHAT_CODE_KEY);
        localStorage.removeItem(CHAT_STORAGE_KEY);
      } catch { /* ignore */ }
      setSyncNote('Deleted on every device that uses this code.');
    } catch (err) {
      setSyncNote(err.message || 'Could not delete.');
    } finally {
      setSyncBusy(false);
    }
  };

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
        // Account data is deleted on disconnect, so the saved chat goes too.
        const code = syncCode;
        setSyncCode(null);
        setCloudReady(false);
        try {
          localStorage.removeItem(CHAT_STORAGE_KEY);
          localStorage.removeItem(CHAT_CODE_KEY);
        } catch { /* ignore */ }
        if (code) {
          fetch('/api/hallie/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', code }),
          }).catch(() => {});
        }
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
                {syncCode ? 'Saved' : 'Save'}
              </button>
              {fullPage
                ? <a className="chat-back" href="/hallie">← Back to Hallie</a>
                : <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">✕</button>}
            </span>
          </div>
          {syncOpen && (
            <div className="chat-sync">
              {syncCode ? (
                <>
                  <p>This chat is saved. Open it on another device with this code.</p>
                  <input readOnly value={syncCode} onFocus={(e) => e.target.select()} aria-label="Chat code" />
                  <button type="button" onClick={deleteSavedChat} disabled={syncBusy}>Delete saved chat</button>
                </>
              ) : (
                <>
                  <p>Save this chat and open it on your other devices. You’ll get a code. Keep it. Anyone with it can read the chat.</p>
                  <button type="button" onClick={saveChat} disabled={syncBusy || messages.length === 0}>
                    {syncBusy ? 'Saving…' : 'Save this chat'}
                  </button>
                  <form onSubmit={openSavedChat}>
                    <input
                      value={openCode}
                      onChange={(e) => setOpenCode(e.target.value)}
                      placeholder="Code from another device"
                      aria-label="Code from another device"
                      autoComplete="off"
                    />
                    <button type="submit" disabled={syncBusy || openCode.trim().length < 8}>Open</button>
                  </form>
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
                    onClick={() => window.location.assign('/auth/tiktok/system-login')}
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
