'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutSection: React.FC = () => {
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
    <section className="w-full flex flex-col bg-white overflow-hidden">
      
      {/* -----------------------------
          BLOCK 1: IMAGE LEFT | TEXT RIGHT
          ----------------------------- */}
      <div className="flex flex-col md:flex-row min-h-[500px]">
        {/* Image Part */}
        <div className="w-full md:w-1/2 relative h-[400px] md:h-auto overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?q=80&w=1974&auto=format&fit=crop"
            alt="Pure Ingredients"
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
          />
        </div>
        {/* Text Part */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-[#F3EEE9] p-10 md:p-20 py-20">
          <div className="max-w-md text-left">
            <h2 className="text-2xl md:text-3xl font-flama-condensed tracking-[0.2em] uppercase text-[#503223] mb-6 leading-tight">
              100% Pure & Authentic Ingredients
            </h2>
            <p className="text-[#503223]/80 font-dm-sans text-[15px] md:text-[16px] leading-[1.8] mb-8">
              At Gopi Misthan Bhandar, we believe that true sweetness begins with the finest raw materials. Our dedicated team sources the purest saffron from Kashmir, hand-picked pistachios from the valleys of Iran, and farm-fresh organic milk, ensuring every bite is a testament to purity.
            </p>
            <Link 
              href="/about" 
              className="inline-block text-[13px] font-flama tracking-[0.2em] uppercase text-[#503223] border-b border-[#503223] pb-1 hover:opacity-60 transition-opacity"
            >
              Read More
            </Link>
          </div>
        </div>
      </div>

      {/* -----------------------------
          BLOCK 2: TEXT LEFT | IMAGE RIGHT
          ----------------------------- */}
      <div className="flex flex-col-reverse md:flex-row min-h-[500px]">
        {/* Text Part */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-[#F3EEE9] p-10 md:p-20 py-20">
          <div className="max-w-md text-left">
            <h2 className="text-2xl md:text-3xl font-flama-condensed tracking-[0.2em] uppercase text-[#503223] mb-6 leading-tight">
              Crafting Joy Since 1995
            </h2>
            <p className="text-[#503223]/80 font-dm-sans text-[15px] md:text-[16px] leading-[1.8] mb-8">
              For nearly three decades, we have been custodians of India&apos;s rich culinary heritage. Each sweet is handcrafted using centuries-old techniques, preserving the authentic flavors of Braj while embracing modern quality standards. Our Master Halwais combine passion with precision to keep the flame of tradition alive.
            </p>
            <Link 
              href="/collections" 
              className="inline-block text-[13px] font-flama tracking-[0.2em] uppercase text-[#503223] border-b border-[#503223] pb-1 hover:opacity-60 transition-opacity"
            >
              Discover More
            </Link>
          </div>
        </div>
        {/* Image Part */}
        <div className="w-full md:w-1/2 relative h-[400px] md:h-auto overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop"
            alt="Traditional Craftsmanship"
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
          />
        </div>
      </div>

      {/* -----------------------------
          BLOCK 3: IMAGE LEFT | NEWSLETTER RIGHT
          ----------------------------- */}
      <div className="flex flex-col md:flex-row min-h-[500px]">
        {/* Image Part */}
        <div className="w-full md:w-1/2 relative h-[400px] md:h-auto overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1542841791-1925b02a2bcc?q=80&w=1974&auto=format&fit=crop"
            alt="Gift of Tradition"
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
          />
        </div>
        {/* Newsletter Part */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-[#F3EEE9] p-10 md:p-20 py-20">
          <div className="max-w-md text-left w-full">
            <h2 className="text-2xl md:text-3xl font-flama-condensed tracking-[0.2em] uppercase text-[#503223] mb-10 leading-tight">
              Become A Gopi Insider
            </h2>
            
            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#503223" strokeWidth="1.5">
                    <path d="M20 7L12 15L4 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[#503223]/80 font-dm-sans text-[14px]">Receive exclusive gift offers and discounts</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#503223" strokeWidth="1.5">
                    <path d="M12 2L15 8L22 9L17 14L18.5 21L12 17L5.5 21L7 14L2 9L9 8L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[#503223]/80 font-dm-sans text-[14px]">Be the first to taste our limited-edition seasonal launches</p>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-0 border border-[#503223]/20 bg-white">
              <input
                type="email"
                placeholder="YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow px-5 py-4 text-[12px] font-dm-sans tracking-widest outline-none"
                required
              />
              <button 
                type="submit"
                className="bg-[#C87961] hover:bg-[#B0654F] text-white px-8 py-4 text-[12px] font-flama tracking-[0.2em] uppercase transition-colors"
              >
                {isSubscribed ? 'Thank You' : 'Subscribe'}
              </button>
            </form>
            
            <p className="mt-6 text-[11px] text-[#503223]/60 italic font-dm-sans">
              Gopi Misthan Bhandar uses your personal data as described in our <Link href="/privacy" className="underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>

    </section>
  );
};

export default AboutSection;