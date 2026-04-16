'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiPhone, FiMapPin } from 'react-icons/fi';

interface GalleryItem {
  _id: string;
  imageUrl: string;
  title?: string;
  description?: string;
}

interface GallerySectionProps {
  galleryItems: GalleryItem[];
  showAll?: boolean;
}

const branches = [
  {
    name: 'Main Branch',
    address: '304, Tilak Marg Neemuch (M.P)',
    phone: '+91 9425105945',
    rating: 5,
    imageUrl: '/Shop1.jpeg',
    mapUrl: 'https://maps.app.goo.gl/mPwca1HtWDBKUE3j9?g_st=aw'
  },
  {
    name: 'Patel Plaza Branch',
    address: 'G-3, Patel Plaza, Tagore Marg Neemuch (M.P)',
    phone: '+91 9425105945',
    rating: 5,
    imageUrl: '/shop3.jpeg',
    mapUrl: 'https://maps.app.goo.gl/wpkPv8cpT1EzRuGt8?g_st=aw'
  },
  {
    name: 'Outlet at Mandsaur',
    address: '01, Narayan Tower, Gandhi Chouraha Mandsaur (M.P)',
    phone: '+91 9425105945',
    rating: 5,
    imageUrl: '/shop2.jpeg',
    mapUrl: 'https://maps.app.goo.gl/KbF23a6WooP91WsaA?g_st=aw'
  }
];

const GallerySection: React.FC<GallerySectionProps> = ({ galleryItems, showAll }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % branches.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + branches.length) % branches.length);
  };

  // Auto-slide every 4 seconds for mobile
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % branches.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (swipeDistance > minSwipeDistance) goToNextSlide();
    if (swipeDistance < -minSwipeDistance) goToPrevSlide();
  };

  return (
    <section className="pt-8 pb-12 md:pt-10 md:pb-24 w-full bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        {/* Premium Heading Style */}
        <div className="text-center mb-8 md:mb-10">
          <p className="text-[12px] md:text-[14px] font-flama tracking-[0.3em] uppercase text-[#FE8E02] mb-3">
            Our Presence
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-flama-condensed tracking-[0.1em] uppercase text-[#503223]">
            Visit Our Shops
          </h2>
        </div>

        {/* =========================================
            MOBILE VIEW: AUTO-LOOPING SLIDER 
        ========================================= */}
        <div className="block md:hidden w-full relative">
          <div
            className="overflow-hidden w-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {branches.map((branch, index) => (
                <div key={index} className="w-full flex-shrink-0 flex flex-col items-center text-center px-1">
                  {/* Large Image with Rounded Corners */}
                  <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden shadow-sm border border-white mb-6">
                    <Image
                      src={branch.imageUrl}
                      alt={branch.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Branch Name - Serif */}
                  <h3 className="text-2xl font-playfair font-bold text-[#503223] mb-3">
                    {branch.name}
                  </h3>

                  {/* Address - Sans */}
                  <p className="text-[13px] text-[#503223]/70 font-dm-sans mb-3 px-4 leading-relaxed max-w-[280px]">
                    {branch.address}
                  </p>

                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(branch.rating)].map((_, i) => (
                      <span key={i} className="text-[#D4A373] text-xl">★</span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex flex-col items-center gap-3 w-full">
                    <Link
                      href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center justify-center gap-2 bg-[#FE8E02] text-white px-6 py-3 text-[11px] font-flama tracking-[0.2em] uppercase rounded-full shadow-md w-[220px]"
                    >
                      <FiPhone className="w-3.5 h-3.5" />
                      Contact Now
                    </Link>

                    <Link
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[12px] font-flama tracking-[0.2em] uppercase text-[#503223] border-b border-[#503223]/40 pb-1 mt-2"
                    >
                      <FiMapPin className="w-3.5 h-3.5" />
                      View on Map
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-10">
            {branches.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-[#FE8E02]' : 'w-2 bg-[#E5DCD3]'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* =========================================
            DESKTOP VIEW: 3 BRANCHES SIDE-BY-SIDE 
        ========================================= */}
        <div className="hidden md:grid grid-cols-3 gap-10 md:gap-12 lg:gap-16 items-start">
          {branches.map((branch, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center group transition-all duration-700 ${index === 1 ? 'md:translate-y-6' : 'md:translate-y-0'
                }`}
            >
              {/* Large Image with Rounded Corners */}
              <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden shadow-lg border border-white mb-8">
                <Image
                  src={branch.imageUrl}
                  alt={branch.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Branch Name - Serif */}
              <h3 className="text-2xl md:text-3xl font-playfair font-bold text-[#503223] mb-4">
                {branch.name}
              </h3>

              {/* Address - Sans */}
              <p className="text-[13px] md:text-[14px] text-[#503223]/70 font-dm-sans mb-3 px-4 leading-relaxed max-w-[280px]">
                {branch.address}
              </p>

              {/* Stars */}
              <div className="flex gap-1 mb-8">
                {[...Array(branch.rating)].map((_, i) => (
                  <span key={i} className="text-[#D4A373] text-xl">★</span>
                ))}
              </div>

              {/* Links */}
              <div className="flex flex-col items-center gap-3 mt-2">
                <Link
                  href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#FE8E02] text-white px-6 py-3 text-[11px] font-flama tracking-[0.2em] uppercase rounded-full transition-all duration-300 hover:bg-[#D87A0A] hover:scale-105 shadow-md active:scale-95 w-full max-w-[220px]"
                >
                  <FiPhone className="w-3.5 h-3.5" />
                  Contact Now
                </Link>

                <Link
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[12px] font-flama tracking-[0.2em] uppercase text-[#503223] border-b border-[#503223]/40 pb-1 hover:border-[#FE8E02] hover:text-[#FE8E02] transition-all duration-300"
                >
                  <FiMapPin className="w-3.5 h-3.5" />
                  View on Map
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
