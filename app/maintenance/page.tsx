import React from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';
import { FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Under Maintenance | Gopi Misthan Bhandar',
  description:
    'Our website is temporarily under maintenance. We will be back shortly. Call us to place your order in the meantime.',
  robots: {
    index: false,
    follow: false,
  },
};

const PHONE = '+919425922445';
const PHONE_DISPLAY = '+91 94259 22445';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF7EC] via-[#FFFBF5] to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-8 w-24 h-24 md:w-28 md:h-28 relative">
          <Image
            src="/logo.png"
            alt="Gopi Misthan Bhandar"
            fill
            sizes="112px"
            priority
            className="object-contain"
          />
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-primary-red/10 px-4 py-1.5 text-sm font-semibold text-primary-darkRed">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-red opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-red" />
          </span>
          Under Maintenance
        </span>

        <h1 className="mt-6 text-4xl md:text-5xl font-bold font-general-sans text-primary-brown">
          We&apos;ll be back very soon
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Our website is getting a little sweeter right now. Online ordering is
          temporarily paused while we finish some upgrades.
        </p>

        <p className="mt-2 text-lg text-gray-700 font-medium">
          हमारी वेबसाइट पर कुछ ज़रूरी काम चल रहा है — हम जल्द ही वापस आ रहे हैं।
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`tel:${PHONE}`}
            className="inline-flex items-center justify-center gap-2 bg-primary-red text-white px-7 py-3 rounded-lg font-bold font-general-sans text-lg hover:bg-primary-darkRed transition-colors"
          >
            <FiPhone className="w-5 h-5" />
            Call to Order
          </a>
          <a
            href={`https://wa.me/${PHONE.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-primary-red text-primary-red px-7 py-3 rounded-lg font-bold font-general-sans text-lg hover:bg-primary-red hover:text-white transition-colors"
          >
            <FaWhatsapp className="w-5 h-5" />
            WhatsApp Us
          </a>
        </div>

        <div className="mt-10 rounded-2xl border border-orange-100 bg-white/70 p-6 text-left shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-darkRed">
            Our shop is still open
          </p>
          <ul className="mt-4 space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <FiPhone className="mt-1 w-4 h-4 shrink-0 text-primary-red" />
              <a href={`tel:${PHONE}`} className="hover:text-primary-red transition-colors">
                {PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <FiMapPin className="mt-1 w-4 h-4 shrink-0 text-primary-red" />
              <span>Gopi Misthan Bhandar, Neemuch, Madhya Pradesh</span>
            </li>
            <li className="flex items-start gap-3">
              <FiClock className="mt-1 w-4 h-4 shrink-0 text-primary-red" />
              <span>Open daily — walk in for fresh mithai &amp; namkeen</span>
            </li>
          </ul>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Serving Neemuch since 1968 · Thank you for your patience
        </p>
      </div>
    </main>
  );
}
