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
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  // Mock data for visual consistency with reference image
  // Using product.id to keep it consistent for the same product
  const seed = parseInt(product.id.substring(0, 8), 16) || 0;
  const rating = (4.5 + (seed % 5) * 0.1).toFixed(1);
  
  // Random badges for variety like in the image
  const badges = ["Best Seller", "Mumbai only", "Seasonal", "Trending"];
  const badge = badges[seed % badges.length];
  const badgeColor = badge === "Mumbai only" ? "bg-[#503223]" : (badge === "Seasonal" ? "bg-[#D4A373]" : "bg-[#503223]");

  return (
    <div className="group block h-full">
      <div 
        className="flex flex-col w-full cursor-pointer mb-0 h-full transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - Square with Rounded Corners */}
        <div className="relative w-full aspect-square mb-4 rounded-[20px] overflow-hidden bg-[#F9F6F3] border border-gray-100/50">
          <Link href={`/product/${product.id}`} className="block relative w-full h-full">
            {/* Main Image */}
            <Image
              src={product.image && product.image.trim() !== '' ? product.image : `https://picsum.photos/seed/product${product.id}/500/500`}
              alt={product.name}
              fill
              className={`object-cover object-center transition-opacity duration-700 ${
                isHovered && product.images && product.images.length > 0 ? 'opacity-0' : 'opacity-100'
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {/* Second Image on Hover (if available) */}
            {product.images && product.images.length > 0 && (
              <Image
                src={product.images[0]}
                alt={`${product.name} - Alternate View`}
                fill
                className={`object-cover object-center transition-opacity duration-700 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
          </Link>
          
          {/* Badge Top Left (e.g., Mumbai Only) */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 ${badgeColor} text-white text-[10px] md:text-[11px] font-bold tracking-wider uppercase rounded-sm z-10`}>
            {badge}
          </div>

          {/* Rating Badge Bottom Right */}
          <div className="absolute bottom-3 right-3 bg-[#0A2647] bg-opacity-[0.85] text-white px-2 py-1 rounded-md flex items-center gap-1 z-10 backdrop-blur-sm">
            <span className="text-[10px] md:text-[11px] font-bold">{rating}</span>
            <span className="text-[10px] text-yellow-400">★</span>
          </div>
          
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
            <h3 className="text-[#2D2D2D] text-[14px] md:text-[15px] font-medium font-geom leading-relaxed line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          {/* Price Section - Bold Current, Struckthrough Original, Tag for Discount */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span className="text-[#503223] font-bold text-[16px] md:text-[17px] font-inter">
              ₹{product.price}
            </span>
          </div>
          
          {/* Add to Cart Button - Maroon, Full Width, Premium Style */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="mt-auto w-full py-3 md:py-3.5 bg-white text-[#503223] border-2 border-[#503223]/20 text-[11px] md:text-[12px] font-bold tracking-[0.15em] uppercase rounded-lg transition-all duration-500 hover:bg-[#FE8E02] hover:border-[#FE8E02] hover:text-white hover:shadow-lg active:scale-[0.97] disabled:opacity-75 flex items-center justify-center overflow-hidden relative group"
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
      </div>
    </div>
  );
};

export default ProductCard;