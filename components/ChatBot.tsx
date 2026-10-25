'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { FiMessageCircle } from 'react-icons/fi';

const ChatBotPanel = dynamic(() => import('./ChatBotPanel'), {
  ssr: false,
  loading: () => <div role="status" className="fixed bottom-6 right-6 z-50 rounded-full bg-white px-4 py-3 shadow-lg">Opening chat…</div>,
});

export default function ChatBot() {
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(false);
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) return null;
  if (loaded) return <ChatBotPanel />;
  return (
    <button type="button" onClick={() => setLoaded(true)} aria-label="Chat with us"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] md:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2 rounded-full bg-primary-red px-4 py-3 text-white shadow-lg transition hover:scale-105 hover:bg-primary-darkRed">
      <FiMessageCircle className="h-5 w-5" />
      <span className="hidden text-sm font-semibold sm:inline">Chat</span>
    </button>
  );
}
