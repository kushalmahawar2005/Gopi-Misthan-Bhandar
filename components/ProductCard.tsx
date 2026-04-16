'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { FiHeart } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showAddToCart = true }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isFavorite = isInWishlist(product.id);
  const maxQuantity = typeof product.stock === 'number' && product.stock > 0 ? product.stock : 99;

  const increaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.min(maxQuantity, prev + 1));
  };

  const decreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, quantity);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <div className="group block h-full">
      <div 
        className="flex flex-col w-full cursor-pointer mb-0 h-full transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - Square with Rounded Corners */}
        <div className="relative w-full aspect-square mb-4 rounded-[20px] overflow-hidden bg-[#F9F6F3]">
          <Link href={`/product/${product.id}`} className="block relative w-full h-full">
            {/* Main Image */}
            <Image
              src={product.image && product.image.trim() !== '' ? product.image : `https://picsum.photos/seed/product${product.id}/500/500`}
              alt={`${product.name} | ${product.category?.replace(/-/g, ' ') || 'Indian Sweets'} - Gopi Misthan Bhandar`}
              fill
              className={`object-cover object-center transition-opacity duration-700 ${
                isHovered && product.images && product.images.length > 0 ? 'opacity-0' : 'opacity-100'
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {/* Second Image on Hover — lazy loaded since not visible initially */}
            {product.images && product.images.length > 0 && (
              <Image
                src={product.images[0]}
                alt={`${product.name} - View 2 | Gopi Misthan Bhandar`}
                fill
                loading="lazy"
                className={`object-cover object-center transition-opacity duration-700 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
          </Link>
          
          {/* Heart Icon Top Right - Subtly visible */}
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
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all z-10 shadow-sm"
          >
            <FiHeart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-[#FE8E02] text-[#FE8E02]' : 'text-gray-500 hover:text-[#FE8E02]'}`} />
          </button>
        </div>
        
        {/* Product Info Section - Left Aligned */}
        <div className="w-full flex-grow flex flex-col items-start text-left px-1">
          <Link href={`/product/${product.id}`} className="block mb-2 group-hover:opacity-80 transition-opacity">
            <h3 className="text-[#1A1A1A] text-[16px] md:text-[17px] font-medium font-flama leading-relaxed line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          {/* Price Section - Bold Current, Struckthrough Original, Tag for Discount */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span className="text-[#503223] font-bold text-[16px] md:text-[17px] font-inter">
              ₹{product.price}
            </span>
          </div>
          
          {showAddToCart && (
            <div className="mt-auto w-full flex items-center gap-2 md:gap-3">
              <div className="flex items-center justify-between h-[46px] md:h-[50px] min-w-[108px] md:min-w-[120px] px-2.5 md:px-3 border border-[#d6cec6]  bg-white">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center text-[18px] leading-none text-[#503223] disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="min-w-[16px] text-center text-[16px] md:text-[18px] leading-none text-[#2D2D2D] font-inter font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= maxQuantity}
                  className="w-7 h-7 flex items-center justify-center text-[18px] leading-none text-[#503223] disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 h-[46px] md:h-[50px] bg-[#FE8E02] text-white text-[11px] md:text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.97] disabled:opacity-75 flex items-center justify-center overflow-hidden relative"
              >
                <span className={`transition-all duration-300 ${isAdding ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                  ADD TO CART
                </span>
                {isAdding && (
                  <span className="absolute inset-0 flex items-center justify-center text-white bg-green-600 animate-in fade-in zoom-in duration-300">
                    ADDED!
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;