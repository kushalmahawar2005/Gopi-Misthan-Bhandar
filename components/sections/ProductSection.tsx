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
  const bgClass = bgColor === 'red' ? 'bg-primary-red' : 'bg-white';
  const textColor = bgColor === 'red' ? 'text-white' : 'text-black';

  return (
    <section className={`${bgClass} py-12 px-4`}>
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-center text-base font-serif ${textColor} mb-4`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-center text-[10px] font-serif ${textColor} mb-8 max-w-lg mx-auto`}>
            {subtitle}
          </p>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
