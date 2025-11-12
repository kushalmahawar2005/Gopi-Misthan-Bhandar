'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { FiShoppingCart, FiEye, FiHeart } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showAddToCart = true }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isFavorite = isInWishlist(product.id);

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
        className="flex flex-col w-full items-center cursor-pointer "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-[200px] md:h-[280px] lg:h-[300px] xl:h-[320px] w-full mb-2 overflow-hidden  shadow-md group-hover:shadow-xl transition-shadow">
          {/* Main Image */}
          <Image
            src={product.image && product.image.trim() !== '' ? product.image : `https://picsum.photos/seed/product${product.id}/240/240`}
            alt={product.name}
            fill
            className={`object-cover object-center transition-all duration-500 ${
              isHovered && product.images && product.images.length > 0 ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Second Image on Hover */}
          {product.images && product.images.length > 0 && (
            <Image
              src={product.images[0]}
              alt={`${product.name} - View 2`}
              fill
              className={`object-cover object-center transition-all duration-500 ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
          
          {/* Dark overlay background - appears on hover */}
          <div className={`absolute inset-0  transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
          
          {/* Icons Stack - Top Right - Vertical Layout - Slides from Right */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 z-10 transition-all duration-500 ease-out ${
            isHovered 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-full'
          } group-hover:opacity-100 group-hover:translate-x-0`}>
            {/* Wishlist Button - Top */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isFavorite) {
                  removeFromWishlist(product.id);
                } else {
                  addToWishlist(product);
                }
              }}
              className="w-9 h-9 md:w-10 md:h-10 bg-white hover:bg-gray-100 text-black flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-black'}`} />
            </button>

            {/* Quick View Button - Below Heart */}
            <Link
              href={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 md:w-10 md:h-10 bg-white hover:bg-gray-100 text-black  flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Quick view"
            >
              <FiEye className="w-4 h-4 md:w-5 md:h-5 text-black" />
            </Link>

            {/* Add to Cart Button - Below Quick View */}
            {showAddToCart && (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-9 h-9 md:w-10 md:h-10 bg-white hover:bg-primary-red hover:text-white text-black  flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 shadow-lg"
                aria-label="Add to cart"
              >
                {isAdding ? (
                  <span className="text-sm font-bold text-green-600">✓</span>
                ) : (
                  <FiShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>
            )}
          </div>
        </div>
        {/* Brand Name */}
        <p className="text-black text-[8px] md:text-xs font-serif mb-1 text-center font-normal px-2">GOPI MISTHAN BHANDAR</p>
        {/* Product Name */}
        <p className="text-black text-md md:text-md  font-montserrat font-[600]  text-center tracking-wide font-medium line-clamp-2 min-h-[0.9rem] md:min-h-[0.5rem] px-2">{product.name}</p>
        {/* Price */}
        <p className="text-primary-red font-bold text-sm md:text-base font-serif text-center mb-3 px-2">₹{product.price}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
