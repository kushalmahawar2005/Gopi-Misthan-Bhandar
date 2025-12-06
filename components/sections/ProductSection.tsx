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
            Heading + Subtitle (Clean)
        ----------------------- */}
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
            Product Grid
        ----------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* ---------------------- 
            View More Button
        ----------------------- */}
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
