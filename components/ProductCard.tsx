import React from 'react';
import { Product } from '@/types';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="flex flex-col w-[192px] items-center">
      <div className="bg-primary-brown h-[187px] w-[182px] mb-2 overflow-hidden rounded">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={182}
            height={187}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-xs">Image</span>
          </div>
        )}
      </div>
      <p className="text-black text-xs font-serif mb-1 text-center">{product.name}</p>
      <p className="text-black text-xs font-serif mb-1 text-center">{product.description}</p>
      <p className="text-text-price text-xs font-serif text-center">₹{product.price}</p>
    </div>
  );
};

export default ProductCard;
