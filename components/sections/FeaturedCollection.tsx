'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface FeaturedCollectionProps {
  products: Product[];
}

/* ---------------- PRODUCT CARD ---------------- */
const FeaturedProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const hasSecondImage = product.images && product.images.length > 0;

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div
        className="bg-white rounded-xl overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
          <Image
            src={product.image?.trim() || '/placeholder.jpg'}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-500 ${
              hovered && hasSecondImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            sizes="(max-width:768px) 50vw, 25vw"
          />

          {hasSecondImage && (
            <Image
              src={product.images![0]}
              alt={`${product.name} second view`}
              fill
              className={`object-cover transition-all duration-500 ${
                hovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
              sizes="(max-width:768px) 50vw, 25vw"
            />
          )}
        </div>

        {/* Info */}
        <div className="p-4 text-center">
          <h3 className="text-[15px] font-[500] text-primary-brown line-clamp-2">
            {product.name}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-widest text-gray-500">
            {product.category?.replace('-', ' ') || 'Sweet Delight'}
          </p>
        </div>
      </div>
    </Link>
  );
};

/* ---------------- COLLECTION ---------------- */
const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    checkScroll();
    scrollRef.current?.addEventListener('scroll', checkScroll);
    return () => scrollRef.current?.removeEventListener('scroll', checkScroll);
  }, []);

  if (!products.length) return null;

  return (
    <section className="bg-white pt-14 pb-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-brown">
              New Arrivals
            </h2>
            <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
              Fresh from our kitchen to your home
            </p>
          </div>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              disabled={!canLeft}
              className={`p-3 rounded-full border ${
                canLeft
                  ? 'border-gray-300 text-primary-brown'
                  : 'border-gray-100 text-gray-300'
              }`}
            >
              <FiChevronLeft />
            </button>

            <button
              onClick={() => scroll('right')}
              disabled={!canRight}
              className={`p-3 rounded-full border ${
                canRight
                  ? 'border-gray-300 text-primary-brown'
                  : 'border-gray-100 text-gray-300'
              }`}
            >
              <FiChevronRight />
            </button>

            <Link
              href="/products"
              className="ml-3 bg-primary-red text-white px-6 py-2.5 rounded-full text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[48%] sm:w-[48%] md:w-[24%]"
            >
              <FeaturedProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="md:hidden text-center mt-6">
          <Link
            href="/products"
            className="inline-block bg-primary-red text-white px-6 py-2.5 rounded-lg font-medium"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
