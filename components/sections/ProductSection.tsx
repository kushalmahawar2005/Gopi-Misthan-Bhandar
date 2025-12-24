'use client';

import React, { useEffect, useRef, useState } from 'react';
import ProductCard from '../ProductCard';
import { Product } from '@/types';
import Link from 'next/link';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  showViewMore?: boolean;
  viewMoreLink?: string;
  enableSlider?: boolean;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  products,
  showViewMore = true,
  viewMoreLink = '/products',
  enableSlider = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
      };
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };
  return (
    <section className="w-full pt-8 pb-8 md:pt-12 md:pb-12 bg-white">
      <div className="section-container max-w-6xl lg:max-w-7xl mx-auto px-0 md:px-0 w-full">

        {/* ----------------------
            HEADING + SUBTITLE
        ---------------------- */}
        {title && (
          <div className="text-center mb-6 md:mb-8 px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-general-sans text-black font-[500] tracking-wide">
              {title}
            </h2>

            {subtitle && (
              <p className="text-base md:text-lg text-gray-600 mt-4 max-w-3xl mx-auto leading-relaxed font-geom">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {enableSlider ? (
          <div className="relative px-4 md:px-6">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth mb-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-1rem)]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {products.length > 4 && (
              <div className="hidden md:flex items-center gap-2 absolute inset-y-1/2 -translate-y-1/2 left-2 right-2 justify-between pointer-events-none">
                <button
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`pointer-events-auto p-2 rounded-full transition-all ${
                    canScrollLeft
                      ? 'bg-primary-red text-white hover:bg-primary-darkRed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Previous products"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`pointer-events-auto p-2 rounded-full transition-all ${
                    canScrollRight
                      ? 'bg-primary-red text-white hover:bg-primary-darkRed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Next products"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className="
            grid
            grid-cols-2
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-4
            md:gap-4
            mb-8
          "
          >
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* ----------------------
            VIEW MORE BUTTON
        ---------------------- */}
        
        {showViewMore && products.length > 0 && (
          <div className="text-center px-4 md:px-6">
            <Link
              href={viewMoreLink}
              className="inline-flex items-center gap-1.5 bg-red-700 text-white px-4 py-2 md:px-5 md:py-2.5 font-light text-xs md:text-sm rounded-md transition-all duration-300 hover:bg-red-800 hover:scale-105 shadow-md"
            >
              View All
              <FiArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
