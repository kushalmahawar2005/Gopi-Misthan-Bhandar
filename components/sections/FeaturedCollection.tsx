'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface FeaturedCollectionProps {
  products: Product[];
}

// Rectangular Product Card (like Chhappan Bhog style)
const FeaturedProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasSecondImage = product.images && product.images.length > 0;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div
        className="relative flex flex-col cursor-pointer mb-0 h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Rectangular Image Container */}
        <div className="relative w-full aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={
              product.image && product.image.trim() !== ''
                ? product.image
                : `https://picsum.photos/seed/product${product.id}/400/300`
            }
            alt={product.name}
            fill
            className={`object-cover transition-all duration-500
              ${isHovered ? 'scale-110' : 'scale-100'}
              ${
                hasSecondImage
                  ? isHovered
                    ? 'opacity-0'
                    : 'opacity-100'
                  : 'opacity-100'
              }
            `}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Second Image on Hover (optional) */}
          {hasSecondImage && (
            <Image
              src={product.images![0]}
              alt={`${product.name} - View 2`}
              fill
              className={`object-cover transition-all duration-500
                ${isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}
              `}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </div>

        {/* Product Info Below Image */}
        <div className="mt-3 text-center px-2">
          <h3 className="text-sm md:text-xl font-light text-black line-clamp-2 font-geom  mb-1">
            {product.name}
          </h3>
          <p className="text-xs md:text-sm text-gray-600 font-jost">
            {product.category ? `${product.category.replace('-', ' ')}` : 'Product'}
          </p>
        </div>
      </div>
    </Link>
  );
};

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractingRef = useRef(false);

  // Check scroll position
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Auto scroll function
  const autoScroll = () => {
    if (scrollContainerRef.current && !isUserInteractingRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      
      // Check if we've reached the end
      if (scrollLeft >= scrollWidth - clientWidth - 10) {
        // Reset to beginning
        scrollContainerRef.current.scrollTo({
          left: 0,
          behavior: 'smooth',
        });
      } else {
        // Scroll to next
        const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
        scrollContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      
      // Handle user interaction
      const handleMouseEnter = () => {
        isUserInteractingRef.current = true;
      };
      const handleMouseLeave = () => {
        isUserInteractingRef.current = false;
      };
      const handleTouchStart = () => {
        isUserInteractingRef.current = true;
      };
      const handleTouchEnd = () => {
        // Resume auto-scroll after 3 seconds of no interaction
        setTimeout(() => {
          isUserInteractingRef.current = false;
        }, 3000);
      };

      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);

      return () => {
        container.removeEventListener('scroll', checkScroll);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [products]);

  // Auto-scroll every 2 seconds
  useEffect(() => {
    if (products.length > 4) {
      autoScrollIntervalRef.current = setInterval(() => {
        autoScroll();
      }, 2000);

      return () => {
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current);
        }
      };
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Pause auto-scroll when user manually scrolls
      isUserInteractingRef.current = true;
      
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      
      // Resume auto-scroll after 3 seconds
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 3000);
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="pt-8 pb-8 md:pt-12 md:pb-12 bg-white w-full">
      <div className="section-container max-w-6xl lg:max-w-7xl mx-auto px-0 md:px-0">
        {/* Header: Title on left, View All button and arrows on right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 px-4 md:px-6">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-[450] text-black font-general-sans mb-2">
              New Arrivals
            </h2>
          </div>
          {/* View All Button and Navigation Arrows - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Navigation Arrows */}
            {products.length > 4 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`p-2 rounded-full transition-all ${
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
                  className={`p-2 rounded-full transition-all ${
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
            {/* View All Button */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary-red text-white px-6 py-2.5 md:px-8 md:py-3 font-medium tracking-wide font-general-sans text-sm md:text-base hover:bg-primary-darkRed transition-all duration-300 rounded-lg shadow-md"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Product Carousel - Scrollable */}
        <div className="relative px-4 md:px-6">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(25%-1rem)]"
              >
                <FeaturedProductCard product={product} />
              </div>
            ))}
          </div>

        </div>

        {/* View All Button - Visible on mobile only, below products */}
        <div className="md:hidden text-center mt-6 px-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary-red text-white px-6 py-2.5 font-medium tracking-wide font-general-sans text-base hover:bg-primary-darkRed transition-all duration-300 rounded-lg shadow-md"
          >
            View All
          </Link>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedCollection;
