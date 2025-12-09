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
    <section className="w-full py-12 md:py-20 px-4">
      <div className="w-full">

        {/* ----------------------
            HEADING + SUBTITLE
        ---------------------- */}
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-general-sans text-black font-[500] tracking-wide">
              {title}
            </h2>

            {subtitle && (
              <p className="text-base md:text-lg text-gray-600 mt-4 max-w-3xl mx-auto leading-relaxed font-serif">
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
            gap-6
            md:gap-8
            lg:gap-10
            mb-16
            px-2
          "
        >
          {products.map((product) => (
            <div key={product.id} className="p-2">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* ----------------------
            VIEW MORE BUTTON
        ---------------------- */}
        {showViewMore && products.length > 0 && (
          <div className="text-center">
            <Link
              href={viewMoreLink}
              className="inline-flex items-center gap-2 bg-red-700 text-white px-8 py-4 font-light text-lg md:text-xl rounded-md transition-all duration-300 hover:bg-red-800 hover:scale-105 shadow-md"
            >
              View More Products
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
