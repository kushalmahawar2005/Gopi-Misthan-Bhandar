import React from 'react';
import { Product } from '@/types';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="flex flex-col w-full max-w-[306px] mx-auto items-center">
      <div className="relative h-[309px] w-[306px] mb-3 overflow-hidden">
        <Image
          src={product.image && product.image.trim() !== '' ? product.image : `https://picsum.photos/seed/product${product.id}/306/309`}
          alt={product.name}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      {/* Brand Name */}
      <p className="text-black text-xs font-serif mb-0.5 text-center font-normal">GOPI MISTHAN BHANDAR</p>
      {/* Product Name */}
      <p className="text-black text-sm font-serif mb-0.5 text-center font-medium">{product.name}</p>
      {/* Price */}
      <p className="text-black text-xs font-serif text-center font-normal">₹{product.price}</p>
    </div>
  );
};

export default ProductCard;
