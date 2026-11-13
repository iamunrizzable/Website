'use client';

import './ChatWidget.css';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isChatWipe } from '@/lib/chat-wipe';
import { HALLIE_LOCAL_PROMPT } from './local/prompt';
import { MODEL_CHOICES, availableModelChoices, isApplePhoneOrTablet, readModelChoice, useLocalModel } from './useLocalModel';

// The Contact Hallie page is a full-page chat with her, so the floating
// bubble is left off there.
export const CHAT_PAGE_PATH = '/hallie/chat';

// This browser keeps a day of the chat so a reload doesn't wipe it.
// Once the visitor connects TikTok, the chat is saved to that account and
// opens on any device where they sign in with the same account.
const CHAT_STORAGE_KEY = 'hallie:chat:v1';
const CHAT_STORAGE_TTL_MS = 24 * 60 * 60 * 1000;
const CHAT_STORAGE_MAX = 50;

const LOGIN_PROVIDERS = [
  { id: 'google', name: 'Google' },
  { id: 'apple', name: 'Apple' },
  { id: 'x', name: 'X' },
  { id: 'tiktok', name: 'TikTok' },
];

function bubbleParts(text) {
  const lines = String(text ?? '').split('\n');
  return lines.map((line, lineIndex) => {
    const bits = line.split(/(\*\*[^*]+\*\*)/g).map((bit, bitIndex) => (
      bit.startsWith('**') && bit.endsWith('**') && bit.length > 4
        ? <strong key={bitIndex}>{bit.slice(2, -2)}</strong>
        : bit
    ));
    return <span key={lineIndex}>{lineIndex > 0 && <br />}{bits}</span>;
  });
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
  const holdSave = useRef(false);
  const [pageHeight, setPageHeight] = useState(null);
  const [restored, setRestored] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [accountOn, setAccountOn] = useState(false);
  const [accountTag, setAccountTag] = useState(null);
  const [connections, setConnections] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const chatIdRef = useRef(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncNote, setSyncNote] = useState('');
  const [modelKey, setModelKey] = useState(null);
  const [modelNote, setModelNote] = useState('');
  // Load the model the first time the bubble opens, then keep it. Closing and
  // reopening used to unload and reload it, which could pull the engine out
  // from under a reply that was still being written.
  const [everOpened, setEverOpened] = useState(false);
  useEffect(() => { if (isOpen) setEverOpened(true); }, [isOpen]);
  const [modelChoices, setModelChoices] = useState(MODEL_CHOICES.filter((m) => m.key !== 'mini'));
  useEffect(() => { setModelChoices(availableModelChoices()); }, []);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  // The floating widget stays mounted (but hidden) on the chat page; only the
  // visible one may save, or its empty list would overwrite the real chat.
  const hidden = !fullPage && pathname === CHAT_PAGE_PATH;
  const { engineRef, status: modelStatus, progress: modelProgress, ready: modelReady, reload: reloadModel } = useLocalModel(hidden || !modelKey || (!fullPage && !everOpened) ? null : modelKey);

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
  const goLogin = () => startConnection('tiktok');
  const startConnection = (provider) => {
    reopenAfterLogin();
    const from = encodeURIComponent(window.location.pathname);
    const path = provider === 'tiktok'
      ? `/auth/tiktok/system-login?from=${from}`
      : `/auth/hallie/${provider}?from=${from}`;
    window.location.assign(path);
  };
  const unlink = async (provider) => {
    setSyncBusy(true);
    setSyncNote('');
    try {
      const res = await fetch('/api/hallie/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlink', provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not remove that connection');
      setConnections(data.connections || []);
      setAccountOn(Boolean(data.connected));
      if (!data.connected) setAccountTag(null);
      window.dispatchEvent(new Event('hallie:connection-changed'));
    } catch (err) {
      setSyncNote(err.message || 'Could not remove that connection.');
    } finally {
      setSyncBusy(false);
    }
  };

  // Log out: clears every connection in this browser. A saved chat stays
  // on the login, and any of those accounts can open it again.
  const logOut = async () => {
    setSyncBusy(true);
    try {
      await fetch('/api/system/disconnect', { method: 'POST' });
      await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
      setAccountOn(false);
      setAccountTag(null);
      setConnections([]);
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

  useEffect(() => {
    if (hidden) return;
    const choice = readModelChoice();
    if (choice.bounced) setModelNote('That model closed the page last time, so this opened the last one that worked.');
    setModelKey(choice.key);
  }, [hidden]);

  // Back from a login that started in the chat: open it again.
  useEffect(() => {
    try {
      if (sessionStorage.getItem('hallie:open') === '1') {
        sessionStorage.removeItem('hallie:open');
        setIsOpen(true);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get('error');
    if (!err) return;
    setSyncOpen(true);
    setSyncNote(err);
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
  const buildHistory = () => messages.slice(isApplePhoneOrTablet() ? -8 : -40).map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.pending ? `${m.text}\n[${m.pendingState === 'cancelled' ? 'Cancelled' : m.pendingState === 'done' ? 'Confirmed' : 'Waiting for confirmation'}: ${m.pending.summary}]` : m.text,
  }));

  const submitText = async (text) => {
    if (!text.trim()) return;
    const wiping = isChatWipe(text);
    if (wiping) holdSave.current = true;
    else holdSave.current = false;

    const history = buildHistory();
    const userMessage = { id: Date.now(), text, sender: 'user', time: now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (!engineRef.current || !modelReady) {
      addHallieMessage(modelStatus || 'That model is still loading on this device.');
      return;
    }
    const id = Date.now() + Math.random();
    setMessages(prev => [...prev, { id, text: '', sender: 'hallie', time: now() }]);
    try {
      let full = '';
      const chunks = await engineRef.current.chat.completions.create({
        messages: [
          { role: 'system', content: HALLIE_LOCAL_PROMPT },
          ...history,
          { role: 'user', content: text },
        ],
        stream: true,
      });
      for await (const chunk of chunks) {
        full += chunk.choices?.[0]?.delta?.content || '';
        const shown = full;
        setMessages(prev => prev.map((m) => (m.id === id ? { ...m, text: shown } : m)));
      }
      if (!full) setMessages(prev => prev.map((m) => (m.id === id ? { ...m, text: 'No reply.' } : m)));
    } catch (err) {
      const stack = String(err?.stack || '').split('\n').slice(0, 4).join(' | ').slice(0, 300);
      const detail = `${err?.name || 'Error'}: ${err?.message || 'unknown error'}${stack ? ` [${stack}]` : ''}`;
      setMessages(prev => prev.map((m) => (m.id === id ? { ...m, text: 'Error generating response: ' + detail, reloadModel: true } : m)));
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
          .map(({ pending, pendingState, connect, connectPrompt, adminLogin, reloadModel: _rm, ...m }) => (
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
          setConnections([]);
          return;
        }
        setAccountOn(true);
        setAccountTag(data.tag || null);
        setConnections(Array.isArray(data.connections) ? data.connections : []);
        setChats(Array.isArray(data.chats) ? data.chats : []);
        if (data.active) {
          chatIdRef.current = data.active;
          setActiveChatId(data.active);
        }
        let local = null;
        try { local = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) ?? 'null'); } catch { /* ignore */ }
        const wrongAccount = local?.tag && data.tag && local.tag !== data.tag;
        const sameAccount = local?.tag && data.tag && local.tag === data.tag;
        const switched = sameAccount && local?.chatId && data.active && local.chatId !== data.active;
        if (wrongAccount || switched) {
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
        chatId: chatIdRef.current || undefined,
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
        body: JSON.stringify({ action: 'save', chatId: chatIdRef.current, messages: storableMessages(messages) }),
      }).then(async (res) => {
        if (res.status === 401) setAccountOn(false);
        const data = await res.json().catch(() => null);
        if (data?.active && !chatIdRef.current) {
          chatIdRef.current = data.active;
          setActiveChatId(data.active);
        }
        if (Array.isArray(data?.chats)) setChats(data.chats);
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(handle);
  }, [messages, cloudReady, accountOn, hidden]);

  const applyChatList = (data) => {
    chatIdRef.current = data.active || null;
    setActiveChatId(data.active || null);
    setChats(Array.isArray(data.chats) ? data.chats : []);
    setMessages(Array.isArray(data.messages) ? data.messages : []);
  };

  const openChat = async (chatId) => {
    if (!chatId || chatId === chatIdRef.current) return;
    setSyncBusy(true);
    setSyncNote('');
    try {
      if (messages.length) {
        await fetch('/api/hallie/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save', chatId: chatIdRef.current, messages: storableMessages(messages) }),
        });
      }
      const res = await fetch('/api/hallie/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'open', chatId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not open that conversation');
      applyChatList(data);
    } catch (err) {
      setSyncNote(err.message || 'Could not open that conversation.');
    } finally {
      setSyncBusy(false);
    }
  };

  const newChat = async () => {
    setSyncBusy(true);
    setSyncNote('');
    try {
      if (messages.length) {
        const saved = await fetch('/api/hallie/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save', chatId: chatIdRef.current, messages: storableMessages(messages) }),
        });
        const savedData = await saved.json().catch(() => null);
        if (savedData?.active) chatIdRef.current = savedData.active;
      }
      const res = await fetch('/api/hallie/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'new' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start a new conversation');
      applyChatList(data);
    } catch (err) {
      setSyncNote(err.message || 'Could not start a new conversation.');
    } finally {
      setSyncBusy(false);
    }
  };

  const deleteSavedChat = async () => {
    if (!accountOn) {
      setMessages([]);
      chatIdRef.current = null;
      setActiveChatId(null);
      try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch { /* ignore */ }
      setSyncNote('This chat is deleted on this device.');
      setSessionsOpen(true);
      return;
    }
    setSyncBusy(true);
    setSyncNote('');
    try {
      const res = await fetch('/api/hallie/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', chatId: chatIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not delete');
      applyChatList(data);
      try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch { /* ignore */ }
      setSyncNote(data.chats?.length ? 'That conversation is deleted.' : 'Deleted. Nothing is saved on this login.');
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
            {fullPage && <a className="chat-back" href="/hallie">← Back</a>}
            <span>Chat with Hallie™</span>
            <span className="chat-header-actions">
              <button
                type="button"
                className="chat-saved"
                onClick={() => { setSessionsOpen((open) => !open); }}
              >
                Sessions
              </button>
              <button type="button" className="chat-saved-delete" onClick={deleteSavedChat} disabled={syncBusy}>
                {syncBusy ? 'Deleting…' : 'Delete chat'}
              </button>
              {accountOn && (
                <button type="button" className="chat-saved" onClick={logOut} disabled={syncBusy}>
                  Log out
                </button>
              )}
              {!fullPage && <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">✕</button>}
            </span>
          </div>
          {sessionsOpen && (
            <div className="chat-sync">
              {accountOn ? (
                <div className="chat-threads">
                  {chats.map((chat) => (
                    <button
                      type="button"
                      key={chat.id}
                      className={chat.id === activeChatId ? 'on' : ''}
                      onClick={() => openChat(chat.id)}
                      disabled={syncBusy}
                    >
                      {chat.title}
                    </button>
                  ))}
                  <button type="button" onClick={newChat} disabled={syncBusy}>New chat</button>
                </div>
              ) : (
                <p>Sign in below to keep sessions on every device.</p>
              )}
            <p>Sign in with any of these. You can connect more than one.</p>
            <div className="chat-logins">
              {LOGIN_PROVIDERS.map((provider) => {
                const connected = connections.find((c) => c.provider === provider.id);
                return (
                  <button
                    type="button"
                    key={provider.id}
                    className={connected ? 'on' : ''}
                    onClick={() => (connected ? unlink(provider.id) : startConnection(provider.id))}
                    disabled={syncBusy}
                  >
                    {provider.name}{connected ? ' · connected' : ''}
                  </button>
                );
              })}
            </div>
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
                <span className="bubble">{bubbleParts(msg.text)}</span>
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
                {msg.reloadModel && (
                  <button type="button" className="chat-connect" onClick={() => { setMessages(prev => prev.map((m) => (m.id === msg.id ? { ...m, reloadModel: false } : m))); reloadModel(); }}>
                    reload model
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
          <div className="chat-composer">
            <label className="chat-model">
              Model
              <select
                value={modelKey || 'lite'}
                onChange={(e) => { setModelNote(''); setModelKey(e.target.value); }}
                disabled={!modelKey || isTyping}
              >
                {modelChoices.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </label>
            {(modelNote || modelStatus) && <p className="chat-model-status">{modelNote || modelStatus}</p>}
            {modelKey && modelProgress > 0 && modelProgress < 100 && (
              <div className="chat-model-bar" role="progressbar" aria-valuenow={modelProgress} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${modelProgress}%` }} />
              </div>
            )}
          <form onSubmit={sendMessage} className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Hallie…"
              disabled={isTyping}
            />
            <button type="submit" disabled={!modelKey || !input.trim() || isTyping || !modelReady}>Send</button>
          </form>
          </div>
          <div className="chat-terms">
            By chatting you agree to the{' '}
            <a href="/legal/policies/and/procedures/hallie/terms" target="_blank" rel="noopener noreferrer">Hallie Terms</a>.
          </div>
        </div>
      )}
    </div>
  );
}
