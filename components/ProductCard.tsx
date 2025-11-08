'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { FiShoppingCart, FiEye, FiHeart, FiSearch } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showAddToCart = true }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div 
        className="flex flex-col w-full items-center cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-[200px] md:h-[220px] lg:h-[340px] w-full mb-2 overflow-hidden  shadow-md group-hover:shadow-xl transition-shadow">
          <Image
            src={product.image && product.image.trim() !== '' ? product.image : `https://picsum.photos/seed/product${product.id}/240/240`}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Dark overlay background - appears on hover */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
          
          {/* Wishlist Button - Top Right - Circular Icon Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className={`absolute top-3 right-3 w-9 h-9 md:w-10 md:h-10 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10 shadow-lg ${isHovered ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}
            aria-label="Add to wishlist"
          >
            <FiHeart className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* Quick View Button - Center - Circular Icon Button */}
          <Link
            href={`/product/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10 shadow-lg ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} group-hover:opacity-100 group-hover:scale-100`}
            aria-label="Quick view"
          >
            <FiSearch className="w-4 h-4 md:w-5 md:h-5" />
          </Link>

          {/* Add to Cart Button - Bottom Right - Circular Icon Button */}
          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`absolute bottom-3 right-3 w-9 h-9 md:w-10 md:h-10 bg-black/70 hover:bg-primary-red backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 z-10 shadow-lg ${isHovered ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}
              aria-label="Add to cart"
            >
              {isAdding ? (
                <span className="text-sm font-bold">✓</span>
              ) : (
                <FiShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>
          )}
        </div>
        {/* Brand Name */}
        <p className="text-black text-[10px] md:text-xs font-serif mb-1 text-center font-normal px-2">GOPI MISTHAN BHANDAR</p>
        {/* Product Name */}
        <p className="text-black text-xs md:text-sm font-serif mb-1 text-center font-medium line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] px-2">{product.name}</p>
        {/* Price */}
        <p className="text-primary-red font-bold text-sm md:text-base font-serif text-center px-2">₹{product.price}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
