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
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full bg-white pt-10 pb-14">
      <div className="max-w-[1400px] mx-auto px-4 w-full">

        {/* ---------- HEADING ---------- */}
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-general-sans font-[500] text-black tracking-wide">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-4 text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-geom">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* ---------- PRODUCTS GRID (ANAND STYLE) ---------- */}
        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-x-4
            gap-y-8
            mb-12
          "
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* ---------- VIEW ALL ---------- */}
        {showViewMore && (
          <div className="text-center">
            <Link
              href={viewMoreLink}
              className="inline-flex items-center gap-2 bg-red-700 text-white px-6 py-3 text-sm rounded-md transition-all duration-300 hover:bg-red-800 hover:scale-105 shadow-md"
            >
              View All
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
