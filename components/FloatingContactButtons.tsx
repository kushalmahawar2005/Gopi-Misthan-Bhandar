'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';
import { FiGift } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const BulkEnquiryForm = dynamic(() => import('./BulkEnquiryForm'), {
  ssr: false,
  loading: () => <div role="status" className="fixed bottom-24 left-6 z-50 rounded-lg bg-white px-4 py-3 shadow-lg">Opening enquiry form…</div>,
});

const whatsappNumber =
  (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+917746883645').replace(/\s|\+/g, '') || '917746883645';
const whatsappMessage =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
  'Hi%20Gopi%20Misthan%20Bhandar,%20I%20would%20like%20to%20know%20more%20about%20your%20wedding%20gift%20options.';

export default function FloatingContactButtons() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const whatsappHref = useMemo(() => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURI(decodeURI(whatsappMessage))}`;
  }, []);

  // Listen for global event to open/close enquiry modal (triggered from header Bulk Enquiry)
  useEffect(() => {
    const openHandler = () => setIsModalOpen(true);
    const closeHandler = () => setIsModalOpen(false);
    if (typeof window !== 'undefined') {
      window.addEventListener('open-wedding-enquiry', openHandler as EventListener);
      window.addEventListener('close-wedding-enquiry', closeHandler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-wedding-enquiry', openHandler as EventListener);
        window.removeEventListener('close-wedding-enquiry', closeHandler as EventListener);
      }
    };
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] md:bottom-6 left-3 sm:left-6 z-40 flex flex-col items-start gap-2.5 md:gap-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Bulk enquiry"
          className="group relative flex items-center justify-center rounded-full bg-primary-red w-14 h-14 md:w-[65px] md:h-[65px] text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-red"
        >
          <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/15">
            <FiGift className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="pointer-events-none absolute left-[110%] hidden min-w-[200px] translate-y-1 flex-col rounded-xl bg-primary-red px-4 py-3 gap-2 text-left text-white shadow-lg transition group-hover:flex">
            <span className="text-sm font-flama font-semibold uppercase tracking-wide">Bulk Enquiry</span>
            <span className="text-xs text-white/80">Plan your custom gift hampers</span>
          </div>
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center rounded-full bg-[#25D366] w-14 h-14 md:w-[65px] md:h-[65px] text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          aria-label="Chat with us on WhatsApp"
        >
          <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/15">
            <FaWhatsapp className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="pointer-events-none absolute left-[110%] hidden min-w-[200px] translate-y-1 flex-col rounded-xl bg-[#1fb455] px-4 py-3 text-left text-white shadow-lg transition group-hover:flex">
            <span className="text-sm font-semibold uppercase tracking-wide">WhatsApp</span>
            <span className="text-xs text-white/80">Chat with our team</span>
          </div>
        </a>
      </div>

      {isModalOpen && <BulkEnquiryForm onClose={() => setIsModalOpen(false)} />}
    </>
  );
}


