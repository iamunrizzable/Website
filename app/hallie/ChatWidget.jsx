'use client';

import './ChatWidget.css';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// The Contact Hallie page is a full-page chat with her, so the floating
// bubble is left off there.
export const CHAT_PAGE_PATH = '/hallie/contact/hallie';

// fullPage: render the chat as the page itself (no bubble, always open).
export default function ChatWidget({ fullPage = false }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef(null);

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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const history = buildHistory();
    const userMessage = { id: Date.now(), text: input, sender: 'user', time: now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history })
      });
      const data = await res.json();

      const pa = data.pendingAction;
      addHallieMessage(data.reply || 'I received your message.', {
        ...(pa && typeof pa.id === 'string' && typeof pa.summary === 'string'
          ? { pending: { id: pa.id, summary: pa.summary }, pendingState: 'open' }
          : {}),
        connect: data.connect === true,
      });
    } catch (err) {
      addHallieMessage('Connection error. Please try emailing me at hallie@tjbmanagementinc.com instead.');
    } finally {
      setIsTyping(false);
    }
  };

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
      addHallieMessage(data.reply || 'Done.', { connect: data.connect === true });
      if (data.disconnected === true) window.dispatchEvent(new Event('hallie:connection-changed'));
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
    <div className={`chat-widget${fullPage ? ' chat-page' : ''}`}>
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
        <div className="chat-box">
          <div className="chat-header">
            <span>Chat with Hallie™</span>
            {!fullPage && <button onClick={() => setIsOpen(false)}>✕</button>}
          </div>
          <div className="chat-messages" ref={messagesRef}>
            {fullPage && messages.length === 0 && (
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
                          {msg.pendingState === 'confirming' ? 'Working…' : 'Confirm'}
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
        </div>
      )}
    </div>
  );
}
