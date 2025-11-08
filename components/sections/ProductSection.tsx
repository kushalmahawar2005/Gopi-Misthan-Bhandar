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
  bgColor?: 'beige' | 'red';
  showViewMore?: boolean;
  viewMoreLink?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({ 
  title, 
  subtitle, 
  products, 
  bgColor = 'beige',
  showViewMore = true,
  viewMoreLink = '/products',
}) => {
  const bgClass = bgColor === 'red' ? 'bg-primary-red' : 'bg-gradient-to-b from-white to-gray-50';
  const textColor = bgColor === 'red' ? 'text-white' : 'text-black';

  return (
    <section className={`${bgClass} py-12 md:py-20 px-2 md:px-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-serif ${textColor} mb-4 font-bold`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-base md:text-lg font-serif ${bgColor === 'red' ? 'text-gray-100' : 'text-gray-600'} mb-8 max-w-3xl mx-auto leading-relaxed`}>
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-5 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View More Button */}
        {showViewMore && products.length > 0 && (
          <div className="text-center">
            <Link
              href={viewMoreLink}
              className={`inline-flex items-center gap-2 ${
                bgColor === 'red'
                  ? 'bg-white text-primary-red hover:bg-gray-100'
                  : 'bg-primary-red text-white hover:bg-primary-darkRed'
              } px-8 py-3 rounded-lg font-bold font-serif text-lg transition-all duration-300 transform hover:scale-105 shadow-lg`}
            >
              View More {title}
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
