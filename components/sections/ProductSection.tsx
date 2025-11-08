import React from 'react';
import ProductCard from '../ProductCard';
import { Product } from '@/types';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  bgColor?: 'beige' | 'red';
}

const ProductSection: React.FC<ProductSectionProps> = ({ 
  title, 
  subtitle, 
  products, 
  bgColor = 'beige' 
}) => {
  const bgClass = bgColor === 'red' ? 'bg-primary-red' : 'bg-gradient-to-b from-white to-gray-50';
  const textColor = bgColor === 'red' ? 'text-white' : 'text-black';

  return (
    <section className={`${bgClass} py-12 md:py-16 px-2 md:px-4`}>
      <div className="max-w-7xl mx-auto">
        <h2 className={`text-center text-2xl md:text-3xl font-serif ${textColor} mb-4 font-bold`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-center text-sm md:text-base font-serif ${bgColor === 'red' ? 'text-gray-100' : textColor} mb-12 max-w-3xl mx-auto leading-relaxed`}>
            {subtitle}
          </p>
        )}
        
        {/* Product Cards Grid - Same spacing as FeaturedCollection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
