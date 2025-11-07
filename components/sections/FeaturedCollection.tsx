import React from 'react';
import ProductCard from '../ProductCard';
import { Product } from '@/types';

interface FeaturedCollectionProps {
  products: Product[];
}

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products }) => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-base font-serif text-black mb-4">
          OCCASION FEATURED COLLECTION
        </h2>
        <p className="text-center text-[10px] font-serif text-text-secondary mb-8 max-w-lg mx-auto">
          From traditional treasures to modern delights, find the perfect picks for gifting and celebrating
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
