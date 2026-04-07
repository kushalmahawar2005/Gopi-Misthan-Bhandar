'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section className="w-full bg-[#503223] py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-flama-condensed tracking-[0.2em] uppercase text-white mb-4 leading-tight">
          Become A Gopi Insider
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 mt-8">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M20 7L12 15L4 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-white/80 font-dm-sans text-[14px]">Receive exclusive gift offers and discounts</p>
          </div>
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M12 2L15 8L22 9L17 14L18.5 21L12 17L5.5 21L7 14L2 9L9 8L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-white/80 font-dm-sans text-[14px]">Be the first to taste our limited-edition seasonal launches</p>
          </div>
        </div>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto border border-white/20 bg-white/10 backdrop-blur-sm">
          <input
            type="email"
            placeholder="YOUR EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-grow px-5 py-4 text-[12px] font-dm-sans tracking-widest outline-none bg-transparent text-white placeholder-white/50"
            required
          />
          <button
            type="submit"
            className="bg-[#FE8E02] hover:bg-[#D87A0A] text-white px-8 py-4 text-[12px] font-flama tracking-[0.2em] uppercase transition-colors"
          >
            {isSubscribed ? 'Thank You' : 'Subscribe'}
          </button>
        </form>

        <p className="mt-6 text-[11px] text-white/50 italic font-dm-sans">
          Gopi Misthan Bhandar uses your personal data as described in our <Link href="/privacy" className="underline hover:text-white/80 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
