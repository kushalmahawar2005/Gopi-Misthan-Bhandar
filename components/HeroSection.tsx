'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

const HeroSection = () => {
  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full h-[500px] md:h-[600px] lg:h-[700px] relative overflow-hidden">
      <Image
        src="https://picsum.photos/seed/hero/1200/600"
        alt="Gopi Misthan Bhandar - Traditional Indian Sweets"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center md:justify-start">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-4 md:mb-6 leading-tight">
              Serving Tradition &<br />
              <span className="text-primary-yellow">Sweetness Since 1968</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 font-roboto text-gray-200 leading-relaxed">
              Authentic Indian sweets, snacks, and namkeen from the heart of Neemuch. 
              Experience the taste of tradition with every bite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleScrollToSection('featured')}
                className="bg-primary-red text-white px-8 py-4 rounded-lg font-bold font-serif text-lg hover:bg-primary-darkRed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                Explore Our Collection
                <FiArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleScrollToSection('about')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold font-serif text-lg hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
              >
                Our Story
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
