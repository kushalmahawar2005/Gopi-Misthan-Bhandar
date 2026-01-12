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

        {/* ----------------------
            VIEW MORE BUTTON
        ---------------------- */}
        {showViewMore && products.length > 0 && (
          <div className="text-center px-4 md:px-6">
            <Link
              href={viewMoreLink}
              className="inline-flex items-center gap-1.5 bg-red-700 text-white px-4 py-2 md:px-5 md:py-2.5 font-light text-xs md:text-sm rounded-md transition-all duration-300 hover:bg-red-800 hover:scale-105 shadow-md"
            >
              View More Products
              <FiArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
