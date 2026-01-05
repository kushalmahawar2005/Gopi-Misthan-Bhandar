'use client';

import React, { useRef, useEffect, useState } from 'react';
import CategoryCard from '../CategoryCard';
import { Category } from '@/types';
import Link from 'next/link';

interface CategoriesSectionProps {
  categories: Category[];
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractingRef = useRef(false);

  if (!categories || categories.length === 0) {
    return (
      <section className="py-16 md:py-24 px-4 bg-white w-full">
        <div className="w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-primary-brown mb-6 font-bold font-general-sans tracking-tight">
              Our Categories
            </h2>
            <p className="text-base md:text-lg font-general-sans text-gray-500 max-w-2xl mx-auto tracking-wide uppercase text-xs">
              Explore our wide range of traditional Indian sweets, snacks, and namkeen
            </p>
          </div>
          <div className="text-center text-gray-500 py-8">
            <p>No categories available</p>
          </div>
        </div>
      </section>
    );
  }

  // Create duplicate categories for seamless infinite loop
  const duplicatedCategories = [...categories, ...categories, ...categories];

  // Auto scroll function for circular/infinite loop
  const autoScroll = () => {
    if (scrollContainerRef.current && !isUserInteractingRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.5; // Scroll half viewport width
      
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });

      // Reset to beginning when we reach the end (seamless loop)
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          // If we've scrolled past the first set of categories, reset to beginning
          if (scrollLeft >= scrollWidth / 3) {
            scrollContainerRef.current.scrollTo({
              left: 0,
              behavior: 'auto', // Instant reset for seamless loop
            });
          }
        }
      }, 500);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Handle user interaction
      const handleTouchStart = () => {
        isUserInteractingRef.current = true;
      };
      const handleTouchEnd = () => {
        // Resume auto-scroll after 3 seconds of no interaction
        setTimeout(() => {
          isUserInteractingRef.current = false;
        }, 3000);
      };
      const handleScroll = () => {
        isUserInteractingRef.current = true;
        setTimeout(() => {
          isUserInteractingRef.current = false;
        }, 3000);
      };

      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);
      container.addEventListener('scroll', handleScroll);

      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Auto-scroll every 2 seconds
  useEffect(() => {
    if (categories.length > 2) {
      autoScrollIntervalRef.current = setInterval(() => {
        autoScroll();
      }, 2000);

      return () => {
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current);
        }
      };
    }
  }, [categories]);

  return (
    <section className="py-16 md:py-24 bg-white w-full">
      <div className="section-container w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-general-sans font-bold text-primary-brown mb-4 tracking-tight">
            Our Categories
          </h2>
          <p className="text-xs md:text-sm font-general-sans text-gray-500 tracking-widest uppercase max-w-2xl mx-auto">
            Explore our wide range of traditional Indian sweets, snacks, and namkeen
          </p>
        </div>
        {/* Mobile: Circular/Infinite Auto-Scrolling Carousel */}
        <div 
          ref={scrollContainerRef}
          className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {duplicatedCategories.map((category, index) => (
              <Link 
                key={`${category.id}-${index}`} 
                href={`/category/${category.slug}`}
                className="flex-shrink-0 w-[calc(50vw-1rem)]"
              >
                <CategoryCard category={category} />
              </Link>
            ))}
          </div>
        </div>
        
        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
            >
              <CategoryCard category={category} />
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default CategoriesSection;
