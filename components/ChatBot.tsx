'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';

interface ChatProduct {
  name: string;
  slug?: string;
  price: number;
  image?: string;
  fromPrice: number;
  category?: string;
}

interface Suggestion {
  label: string;
  action: string;
}

interface BotMessage {
  id: string;
  from: 'bot' | 'user';
  text: string;
  products?: ChatProduct[];
  suggestions?: Suggestion[];
}

const uid = () => Math.random().toString(36).slice(2);

export default function ChatBot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);
  // Remembers the language detected from the customer's typing so button clicks
  // (which carry no text) keep replying in the same language.
  const langRef = useRef<'en' | 'hi'>('hi');

  // Auto-scroll to newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  // Greet on first open.
  useEffect(() => {
    if (open && !greeted.current) {
      greeted.current = true;
      void send('welcome');
    }
  }, [open]);

  async function callBot(action: string, payload?: Record<string, string>) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Carry the remembered language so button-only actions reply in it too.
      body: JSON.stringify({
        action,
        payload: { lang: langRef.current, ...payload },
      }),
    });
    return res.json();
  }

  async function send(action: string, payload?: Record<string, string>) {
    setLoading(true);
    try {
      const data = await callBot(action, payload);
      if (data.lang === 'en' || data.lang === 'hi') {
        langRef.current = data.lang;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          from: 'bot',
          text: data.reply,
          products: data.products,
          suggestions: data.suggestions,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          from: 'bot',
          text: 'Network issue 🙁 thodi der baad try karein.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function pushUser(text: string) {
    setMessages((prev) => [...prev, { id: uid(), from: 'user', text }]);
  }

  function handleSuggestion(s: Suggestion) {
    pushUser(s.label);
    if (s.action.startsWith('search:')) {
      void send('search', { query: s.action.slice(7) });
      return;
    }
    void send(s.action);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    pushUser(text);
    // Always free-text; the backend auto-detects order tracking, FAQs, search, etc.
    void send('ask', { text });
  }

  // Hide on admin/checkout (same rule as the contact buttons).
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <>
      {/* Launcher — bottom-left to avoid the bottom-right contact buttons. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chat with us"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] md:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2 rounded-full bg-primary-red px-4 py-3 text-white shadow-lg transition hover:scale-105 hover:bg-primary-darkRed"
        >
          <FiMessageCircle className="h-5 w-5" />
          <span className="hidden text-sm font-semibold sm:inline">Chat</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] md:bottom-6 left-1/2 z-50 flex h-[70vh] max-h-[560px] w-[94vw] max-w-[380px] -translate-x-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:left-auto sm:right-6 sm:translate-x-0">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary-red px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <FiMessageCircle className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Gopi Sweets Assistant</p>
                <p className="text-[11px] text-white/80">Sweets • Orders • Delivery</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1.5 transition hover:bg-white/15"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-4">
            {messages.map((m) => (
              <div key={m.id}>
                <div
                  className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm ${
                      m.from === 'user'
                        ? 'rounded-br-sm bg-primary-red text-white'
                        : 'rounded-bl-sm bg-white text-gray-800 shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>

                {/* Product cards */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {m.products.map((p) => (
                      <Link
                        key={p.slug || p.name}
                        href={p.slug ? `/product/${p.slug}` : '/products'}
                        onClick={() => setOpen(false)}
                        className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                      >
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-20 w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-20 w-full items-center justify-center bg-amber-50 text-2xl">
                            🍬
                          </div>
                        )}
                        <div className="p-2">
                          <p className="line-clamp-2 text-xs font-medium text-gray-800">
                            {p.name}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-primary-red">
                            From ₹{p.fromPrice}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Quick-reply buttons */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.suggestions.map((s) => (
                      <button
                        key={s.action + s.label}
                        onClick={() => handleSuggestion(s)}
                        disabled={loading}
                        className="rounded-full border border-primary-red/30 bg-white px-3 py-1.5 text-xs font-medium text-primary-red transition hover:bg-primary-red hover:text-white disabled:opacity-50"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question / sawaal likhein…"
              className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-primary-red focus:outline-none focus:ring-1 focus:ring-primary-red"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-red text-white transition hover:bg-primary-darkRed disabled:opacity-50"
            >
              <FiSend className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
