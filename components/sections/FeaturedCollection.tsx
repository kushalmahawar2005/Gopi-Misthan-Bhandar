import React from 'react';
import ProductCard from '../ProductCard';
import { Product } from '@/types';

interface FeaturedCollectionProps {
  products: Product[];
}

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products }) => {
  return (
    <section className="py-12 md:py-16 px-2 md:px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-serif text-black mb-2 font-[50]">
          OCCASION FEATURED COLLECTION
        </h2>
        <p className="text-center text-sm md:text-base font-serif text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          From traditional treasures to modern delights, find the perfect picks for gifting and celebrating
        </p>

        {/* Product Cards Grid - Minimal side margins, proper gaps between cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
