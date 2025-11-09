'use client';

import React from 'react';
import ProductCard from '../ProductCard';
import { Product } from '@/types';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

interface FeaturedCollectionProps {
  products: Product[];
}

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products }) => {
  return (
    <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-white to-gray-50 w-full">
      <div className="w-full">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-serif text-black mb-1 font-[100]">
            OCCASION FEATURED COLLECTION
          </h2>
          <p className="text-sm md:text-md font-serif text-gray-700 mb-12 max-w-5xl mx-auto leading-relaxed">
            From traditional treasures to modern delights, find the perfect picks for gifting and celebrating
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary-red text-white px-4 py-3  font-[200] font-poppins text-[13px] hover:bg-primary-darkRed transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            View All Products
            <FiArrowRight className="w-3 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
