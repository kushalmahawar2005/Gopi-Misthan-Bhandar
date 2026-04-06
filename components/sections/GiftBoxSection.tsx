'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const GiftBoxSection: React.FC = () => {
  const [hoveredSide, setHoveredSide] = useState<'corporate' | 'wedding' | null>(null);

  return (
    <section className="w-full h-[500px] md:h-[600px] flex flex-col md:flex-row overflow-hidden">
      
      {/* -----------------------------
          LEFT PANEL: CORPORATE
          ----------------------------- */}
      <div 
        className="relative w-full md:w-1/2 h-full cursor-pointer transition-all duration-700 ease-in-out"
        onMouseEnter={() => setHoveredSide('corporate')}
        onMouseLeave={() => setHoveredSide(null)}
      >
        {/* Default State: Image Background */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${hoveredSide === 'corporate' ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src="https://images.unsplash.com/photo-1549465225-b1ea61973649?q=80&w=2072&auto=format&fit=crop"
            alt="Corporate Collections"
            fill
            className="object-cover"
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-5.5xl text-white font-playfair italic leading-tight drop-shadow-lg">
              Corporate Collections
            </h2>
            {/* Dots */}
            <div className="flex gap-2 mt-6">
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Hover State: Cream Background + Info */}
        <div className={`absolute inset-0 bg-[#FFFFFF] flex flex-col items-center justify-center p-8 text-center transition-all duration-700 transform ${
          hoveredSide === 'corporate' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Decorative Floral Frame for Circular Image */}
          <div className="relative mb-8">
            <div className="w-48 h-48 md:w-56 md:h-56 relative rounded-full overflow-hidden border-4 border-white shadow-xl z-10">
              <Image
                src="https://images.unsplash.com/photo-1549465225-b1ea61973649?q=80&w=2072&auto=format&fit=crop"
                alt="Corporate Icon"
                fill
                className="object-cover"
              />
            </div>
            {/* Mock Floral Decoration (using an absolute image/div) */}
            <div className="absolute -inset-6 border-[1px] border-[#503223]/20 rounded-full scale-110 pointer-events-none" />
            <div className="absolute -inset-10 border-[1px] border-[#503223]/10 rounded-full scale-105 pointer-events-none" />
          </div>

          <h3 className="text-3xl md:text-4xl font-playfair italic text-[#503223] mb-4">
            Corporate Collections
          </h3>
          <p className="text-[12px] md:text-[13px] font-dm-sans tracking-[0.15em] uppercase text-[#503223]/70 mb-8 max-w-[280px] leading-relaxed">
            HANDPICKED DELIGHTS FOR YOUR EMPLOYEES AND PARTNERS.
          </p>
          
          <Link 
            href="/collections/corporate"
            className="bg-[#F88E0C] text-white px-10 py-3.5 text-[12px] font-flama tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#D87A0A] hover:scale-105"
          >
            Explore Now
          </Link>
        </div>
      </div>

      {/* -----------------------------
          RIGHT PANEL: WEDDING
          ----------------------------- */}
      <div 
        className="relative w-full md:w-1/2 h-full cursor-pointer transition-all duration-700 ease-in-out border-t md:border-t-0 md:border-l border-white/20"
        onMouseEnter={() => setHoveredSide('wedding')}
        onMouseLeave={() => setHoveredSide(null)}
      >
        {/* Default State: Image Background */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${hoveredSide === 'wedding' ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src="https://images.unsplash.com/photo-1542841791-1925b02a2bcc?q=80&w=1974&auto=format&fit=crop"
            alt="Wedding Collections"
            fill
            className="object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-5.5xl text-white font-playfair italic leading-tight drop-shadow-lg">
              Wedding Collections
            </h2>
            {/* Dots */}
            <div className="flex gap-2 mt-6">
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Hover State: Cream Background + Info */}
        <div className={`absolute inset-0 bg-[#FFFFFF] flex flex-col items-center justify-center p-8 text-center transition-all duration-700 transform ${
          hoveredSide === 'wedding' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Decorative Floral Frame for Circular Image */}
          <div className="relative mb-8">
            <div className="w-48 h-48 md:w-56 md:h-56 relative rounded-full overflow-hidden border-4 border-white shadow-xl z-10">
              <Image
                src="https://images.unsplash.com/photo-1542841791-1925b02a2bcc?q=80&w=1974&auto=format&fit=crop"
                alt="Wedding Icon"
                fill
                className="object-cover"
              />
            </div>
            {/* Mock Floral Decoration */}
            <div className="absolute -inset-6 border-[1px] border-[#503223]/20 rounded-full scale-110 pointer-events-none" />
            <div className="absolute -inset-10 border-[1px] border-[#503223]/10 rounded-full scale-105 pointer-events-none" />
          </div>

          <h3 className="text-3xl md:text-4xl font-playfair italic text-[#503223] mb-4">
            Wedding Collections
          </h3>
          <p className="text-[12px] md:text-[13px] font-dm-sans tracking-[0.15em] uppercase text-[#503223]/70 mb-8 max-w-[280px] leading-relaxed">
            ELEGANT TREATS FOR YOUR SPECIAL DAY.
          </p>
          
          <Link 
            href="/collections/wedding"
            className="bg-[#F88E0C] text-white px-10 py-3.5 text-[12px] font-flama tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#D87A0A] hover:scale-105"
          >
            Explore Now
          </Link>
        </div>
      </div>

    </section>
  );
};

export default GiftBoxSection;
