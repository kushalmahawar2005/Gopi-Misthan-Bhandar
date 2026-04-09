'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const aboutCards = [
  {
    image: '/5.png',
    alt: 'Pure Ingredients',
    title: '100% Pure & Authentic Ingredients',
    description:
      'At Gopi Misthan Bhandar, we believe that true sweetness begins with the finest raw materials. Our dedicated team sources the purest saffron from Kashmir and farm-fresh organic milk.',
    link: '/about',
    linkText: 'Read More',
  },
  {
    image: '/1.png',
    alt: 'Traditional Craftsmanship',
    title: 'Crafting Joy Since 1995',
    description:
      'For nearly three decades, we have been custodians of India’s rich culinary heritage. Each sweet is handcrafted using centuries-old techniques, preserving authentic flavors.',
    link: '/collections',
    linkText: 'Discover More',
  },
  {
    image: '/1.png',
    alt: 'Gift of Tradition',
    title: 'The Gift of Tradition',
    description:
      'From festive celebrations to heartfelt gestures, our handcrafted sweets make every occasion memorable. Beautifully packed gift boxes created with love and tradition.',
    link: '/giftbox',
    linkText: 'Explore Gifts',
  },
];

const AboutSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 4 seconds for mobile
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % aboutCards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-white py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-flama-condensed tracking-[0.15em] uppercase text-[#503223] mb-4">
            Our Story
          </h2>
          <div className="w-16 h-[2px] bg-[#FE8E02] mx-auto"></div>
        </div>

        {/* =========================================
            MOBILE VIEW: AUTO-LOOPING SLIDER 
        ========================================= */}
        <div className="block md:hidden w-full relative">
          <div className="overflow-hidden w-full rounded-sm">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {aboutCards.map((card, index) => (
                <div key={index} className="w-full flex-shrink-0 flex flex-col">
                  {/* Image on Top */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden mb-6 rounded-sm">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Text Below */}
                  <div className="flex flex-col flex-grow">
                    <h3 className="text-xl font-flama-condensed tracking-[0.12em] uppercase text-[#503223] mb-3 leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-[#503223]/70 font-dm-sans text-[14px] leading-[1.7] mb-5">
                      {card.description}
                    </p>
                    <Link
                      href={card.link}
                      className="inline-block text-[12px] font-flama tracking-[0.2em] uppercase text-[#503223] border-b border-[#503223]/40 pb-1 w-max"
                    >
                      {card.linkText}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {aboutCards.map((_, idx) => (
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
            DESKTOP VIEW: 3-COLUMN GRID 
        ========================================= */}
        <div className="hidden md:grid grid-cols-3 gap-10">
          {aboutCards.map((card, index) => (
            <div
              key={index}
              className="group flex flex-col"
            >
              {/* Image on Top */}
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm mb-6">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#503223]/0 group-hover:bg-[#503223]/10 transition-colors duration-500" />
              </div>

              {/* Text Below */}
              <div className="flex flex-col flex-grow">
                <h3 className="text-xl font-flama-condensed tracking-[0.12em] uppercase text-[#503223] mb-3 leading-tight">
                  {card.title}
                </h3>
                <p className="text-[#503223]/70 font-dm-sans text-[15px] leading-[1.8] mb-5 flex-grow">
                  {card.description}
                </p>
                <Link
                  href={card.link}
                  className="inline-block text-[12px] font-flama tracking-[0.2em] uppercase text-[#503223] border-b border-[#503223]/40 pb-1 hover:border-[#FE8E02] hover:text-[#FE8E02] transition-all duration-300 self-start"
                >
                  {card.linkText}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutSection;