
'use client';

import React, { useRef, useEffect } from 'react';
import CategoryCard from '../CategoryCard';
import { Category } from '@/types';

interface CategoriesSectionProps {
  categories: Category[];
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractingRef = useRef(false);

  const autoScroll = () => {
    if (scrollContainerRef.current && !isUserInteractingRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.6;

      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });

      setTimeout(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth } = scrollContainerRef.current;
          if (scrollLeft >= scrollWidth / 2) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'auto' });
          }
        }
      }, 500);
    }
  };

  useEffect(() => {
    if (categories.length > 3) {
      autoScrollIntervalRef.current = setInterval(autoScroll, 4000);
      return () => {
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current);
        }
      };
    }
  }, [categories]);

  return (
    <section className="py-16 md:py-24 bg-white w-full">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* HEADING */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-brown">
            Our Categories
          </h2>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mt-3">
            Explore our wide range of traditional Indian sweets, snacks, and namkeen
          </p>
        </div>

        {/* SLIDER */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex-shrink-0 w-[70vw] sm:w-[48vw] md:w-[26%] lg:w-[24%]"
            >
              <CategoryCard category={category} />
            </div>
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
