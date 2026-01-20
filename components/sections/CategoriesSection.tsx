
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

  // Handle user interaction to pause auto-scroll
  const handleUserInteractionStart = () => {
    isUserInteractingRef.current = true;
  };

  const handleUserInteractionEnd = () => {
    isUserInteractingRef.current = false;
  };

  const autoScroll = () => {
    if (scrollContainerRef.current && !isUserInteractingRef.current) {
      const container = scrollContainerRef.current;
      // Calculate width of one card + gap (approximate based on styling)
      // We can get the first child's width if available
      const firstCard = container.firstElementChild as HTMLElement;
      const cardWidth = firstCard ? firstCard.clientWidth + 24 : container.clientWidth * 0.3; // 24px is gap-6

      const maxScroll = container.scrollWidth - container.clientWidth;

      // If we are close to the end, scroll back to start
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Otherwise scroll by one card width
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleUserInteractionStart);
      container.addEventListener('touchend', handleUserInteractionEnd);
      container.addEventListener('mouseenter', handleUserInteractionStart);
      container.addEventListener('mouseleave', handleUserInteractionEnd);
    }

    if (categories.length > 0) {
      autoScrollIntervalRef.current = setInterval(autoScroll, 10000); // 10 seconds interval
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      if (container) {
        container.removeEventListener('touchstart', handleUserInteractionStart);
        container.removeEventListener('touchend', handleUserInteractionEnd);
        container.removeEventListener('mouseenter', handleUserInteractionStart);
        container.removeEventListener('mouseleave', handleUserInteractionEnd);
      }
    };
  }, [categories]);

  return (
    <section className="py-16 md:py-24 bg-white w-full">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* HEADING */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-brown">
            Our Categories
          </h2>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mt-3 font-geom">
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
