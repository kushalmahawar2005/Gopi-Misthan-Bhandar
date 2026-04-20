'use client';

import React, { useEffect, useRef, useState } from 'react';
import ProductCard from '../ProductCard';
import { Product } from '@/types';
import Link from 'next/link';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  showViewMore?: boolean;
  viewMoreLink?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  products,
  showViewMore = true,
  viewMoreLink = '/products',
}) => {
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

  return (
    <section className="w-full py-7 sm:py-8 md:py-10">
      <div className="section-container max-w-6xl lg:max-w-7xl w-full">

        {/* ----------------------
            HEADING + SUBTITLE
        ---------------------- */}
        {title && (
          <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2 sm:px-4 md:px-6">
            {subtitle && (
              <p className="text-[12px] sm:text-[13px] md:text-[16px] font-flama tracking-[0.3em] uppercase text-[#FE8E02] mb-3">
                {subtitle}
              </p>
            )}
            <h2 className="text-[30px] leading-tight sm:text-4xl md:text-5xl lg:text-[64px] font-flama-condensed tracking-[0.05em] xl:tracking-[0.1em] uppercase text-[#503223]">
              {title}
            </h2>
          </div>
        )}

        {/* ----------------------
            PRODUCT GRID — FINAL PERFECT VERSION
        ---------------------- */}
        <div
          ref={gridRef}
          className="
            grid
            grid-cols-2
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-4
            sm:gap-5
            md:gap-8
            lg:gap-[50px]
            mb-6
          "
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              data-cascade
              className={`m-scroll-trigger animate--fade-in-up ${isGridVisible ? '' : 'm-scroll-trigger--offscreen'}`}
              style={{ '--animation-order': index } as React.CSSProperties}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* ----------------------
            VIEW MORE BUTTON
        ---------------------- */}
        {showViewMore && products.length > 0 && (
          <div className="text-center mt-8 md:mt-10">
            <Link
              href={viewMoreLink}
              className="group relative inline-flex items-center justify-center py-[12px] px-[28px] sm:py-[14px] sm:px-[40px] font-flama tracking-[0.15em] uppercase text-[12px] sm:text-[13px] border-2 border-[#FE8E02] transition-colors duration-500 overflow-hidden"
            >
              <span
                className="absolute inset-0 bg-[#FE8E02] transition-transform duration-500 group-hover:translate-x-full"
                style={{ transitionTimingFunction: 'cubic-bezier(0.785,0.135,0.15,0.86)' }}
              ></span>
              <span
                className="relative z-10 text-white transition-colors duration-500 group-hover:text-[#FE8E02]"
                style={{ transitionTimingFunction: 'cubic-bezier(0.785,0.135,0.15,0.86)' }}
              >
                View All
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
