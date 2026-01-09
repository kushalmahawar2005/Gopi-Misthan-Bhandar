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
    <Link href={`/product/${product.id}`} prefetch={true} className="group block h-full">
      <div 
        className="flex flex-col w-full items-center cursor-pointer mb-0 h-full rounded-xl overflow-hidden active:scale-95 transform transition-transform duration-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative w-full aspect-[4/5] md:aspect-[2/2] mb-0 rounded-xl overflow-hidden bg-gray-100">
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
        
        {/* Product Info Section with Background Color */}
        <div className="w-full relative" style={{ backgroundColor: 'white' }}>
          {/* Product Name on Colored Background */}
          <div className="px-3 pt-4 pb-2 md:px-4 md:pt-5">
            <p className="text-black text-sm md:text-base font-light  line-clamp-2 font-geom leading-tight">
              {product.name}
            </p>
          </div>
          
          {/* Category */}
          <div className="px-3 pb-1 md:px-4">
            <p className="text-gray-600 text-xs md:text-sm  font-jost capitalize">
              {product.category ? product.category.replace('-', ' ') : 'Product'}
            </p>
          </div>
          
          {/* Price with Cart Icon */}
          <div className="px-3 pb-4 md:px-4 md:pb-5 relative">
            <p className="text-black font-[450] text-md md:text-lg font-inter ">
              ₹{product.price}
            </p>
            {/* Cart Icon on Bottom Right */}
            {showAddToCart && (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="absolute bottom-2 right-3 md:right-4 w-8 h-8 md:w-9 md:h-9 bg-white hover:bg-primary-black hover:text-primary-red text-black flex items-center justify-center transition-all duration-300 hover:scale-110 rounded-full  disabled:opacity-50"
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
      </div>
    </Link>
  );
};

export default ProductCard;