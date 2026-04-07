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
        {/* Square Image Container */}
        <div className="relative w-full aspect-square overflow-hidden bg-gray-50 mb-4">
          <Image
            src={
              product.image && product.image.trim() !== ''
                ? product.image
                : `https://picsum.photos/seed/product${product.id}/600/600`
            }
            alt={product.name}
            fill
            className={`object-cover 
              ${hasSecondImage
                ? isHovered
                  ? 'opacity-0'
                  : 'opacity-100'
                : 'opacity-100'
              }
            `}
            priority
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Second Image on Hover (optional) */}
          {hasSecondImage && (
            <Image
              src={product.images![0]}
              alt={`${product.name} - View 2`}
              fill
              className={`object-cover 
                ${isHovered ? 'opacity-100' : 'opacity-0'}
              `}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </div>

        {/* Product Info Below Image */}
        <div className="text-center">
          <h3 className="text-[12px] md:text-[14px] font-flama tracking-[0.1em] uppercase text-[#503223] mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[11px] md:text-[13px] font-flama text-[#FE8E02]">
            Rs. {product.price || '700.00'}
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
    <section className="pt-16 pb-16 md:pt-20 md:pb-20 w-full">
      <div className="max-w-[1600px] mx-auto px-4 md:px-[50px]">
        {/* Header: Centered Titles */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[12px] md:text-[14px] font-flama tracking-[0.3em] uppercase text-[#FE8E02] mb-3">
            Featured Collection
          </p>
          <h2 className="text-3xl md:text-5xl font-flama-condensed tracking-[0.1em] uppercase text-[#503223]">
            Our Best Sellers
          </h2>
        </div>

        {/* Product Grid - 4 Columns on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-[50px]">
          {products.slice(0, 4).map((product) => (
            <div key={product.id}>
              <FeaturedProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View All Button - Bottom Center with Khoya Sliding Effect */}
        <div className="text-center mt-12 md:mt-16">
          <Link
            href="/products"
            className="group relative inline-flex items-center justify-center py-[14px] px-[40px] font-flama tracking-[0.15em] uppercase text-[13px] border-2 border-[#FE8E02] transition-colors duration-500 overflow-hidden"
          >
            {/* Sliding Background Layer */}
            <span className="absolute inset-0 bg-[#FE8E02] transition-transform duration-[450ms] [transition-timing-function:cubic-bezier(0.785,0.135,0.15,0.86)] group-hover:translate-x-full"></span>

            {/* Button Text */}
            <span className="relative z-10 text-white transition-colors duration-[450ms] [transition-timing-function:cubic-bezier(0.785,0.135,0.15,0.86)] group-hover:text-[#FE8E02]">
              View All
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
