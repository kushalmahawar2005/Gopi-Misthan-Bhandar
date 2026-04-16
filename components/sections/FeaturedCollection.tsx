'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

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
  const [isGridVisible, setIsGridVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsGridVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-8 md:py-10 w-full">
      <div className="max-w-[1600px] mx-auto px-4 md:px-[50px]">
        {/* Header: Centered Titles */}
        <div className="text-center mb-8 md:mb-10">
          <p className="text-[12px] md:text-[14px] font-flama tracking-[0.3em] uppercase text-[#FE8E02] mb-3">
            Featured Collection
          </p>
          <h2 className="text-3xl md:text-5xl font-flama-condensed tracking-[0.1em] uppercase text-[#503223]">
            Our Best Sellers
          </h2>
        </div>

        {/* Product Grid - 4 Columns on Desktop */}
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-[50px]">
          {products.slice(0, 4).map((product, index) => (
            <div
              key={product.id}
              data-cascade
              className={`m-scroll-trigger animate--fade-in-up ${isGridVisible ? '' : 'm-scroll-trigger--offscreen'}`}
              style={{ '--animation-order': index } as React.CSSProperties}
            >
              <FeaturedProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View All Button - Bottom Center with Khoya Sliding Effect */}
        <div className="text-center mt-8 md:mt-10">
          <Link
            href="/products"
            className="group relative inline-flex items-center justify-center py-[14px] px-[40px] font-flama tracking-[0.15em] uppercase text-[13px] border-2 border-[#FE8E02] transition-colors duration-500 overflow-hidden"
          >
            {/* Sliding Background Layer */}
            <span
              className="absolute inset-0 bg-[#FE8E02] transition-transform duration-500 group-hover:translate-x-full"
              style={{ transitionTimingFunction: 'cubic-bezier(0.785,0.135,0.15,0.86)' }}
            ></span>

            {/* Button Text */}
            <span
              className="relative z-10 text-white transition-colors duration-500 group-hover:text-[#FE8E02]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.785,0.135,0.15,0.86)' }}
            >
              View All
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
