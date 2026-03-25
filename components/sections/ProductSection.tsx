'use client';

import React from 'react';
import ProductCard from '../ProductCard';
import { Product } from '@/types';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

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
  return (
    <section className="w-full pt-8 pb-8 md:pt-12 md:pb-12">
      <div className="section-container max-w-6xl lg:max-w-7xl mx-auto px-0 md:px-0 w-full">

        {/* ----------------------
            HEADING + SUBTITLE
        ---------------------- */}
        {title && (
          <div className="text-center mb-12 md:mb-16 px-4 md:px-6">
            {subtitle && (
              <p className="text-[12px] md:text-[14px] font-flama tracking-[0.3em] uppercase text-[#8b4513] mb-3">
                {subtitle}
              </p>
            )}
            <h2 className="text-3xl md:text-5xl font-flama-condensed tracking-[0.1em] uppercase text-[#503223]">
              {title}
            </h2>
          </div>
        )}

        {/* ----------------------
            PRODUCT GRID — FINAL PERFECT VERSION
        ---------------------- */}
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-6
            md:gap-[50px]
            mb-8
          "
        >
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* ----------------------
            VIEW MORE BUTTON
        ---------------------- */}
        {showViewMore && products.length > 0 && (
          <div className="text-center mt-12 md:mt-16">
            <Link
              href={viewMoreLink}
              className="group relative inline-flex items-center justify-center py-[14px] px-[40px] font-flama tracking-[0.15em] uppercase text-[13px] border-2 border-[#7B1F2E] transition-colors duration-500 overflow-hidden"
            >
              <span className="absolute inset-0 bg-[#7B1F2E] transition-transform duration-[450ms] [transition-timing-function:cubic-bezier(0.785,0.135,0.15,0.86)] group-hover:translate-x-full"></span>
              <span className="relative z-10 text-white transition-colors duration-[450ms] [transition-timing-function:cubic-bezier(0.785,0.135,0.15,0.86)] group-hover:text-[#7B1F2E]">
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
