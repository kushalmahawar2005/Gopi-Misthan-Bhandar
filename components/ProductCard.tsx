'use client';

import React, { useMemo, useState } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiX, FiHeart } from 'react-icons/fi';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showAddToCart = true }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const productUrl = `/product/${product.slug || product.id}`;
  const isFavorite = isInWishlist(product.id);

  const sizeOptions = useMemo(() => {
    if (!Array.isArray(product.sizes)) return [];

    return product.sizes
      .map((size) => {
        const weight = String(size?.weight || '').trim();
        const price = Number(size?.price);

        if (!weight || !Number.isFinite(price)) return null;

        return {
          weight,
          price,
        };
      })
      .filter((size): size is { weight: string; price: number } => Boolean(size));
  }, [product.sizes]);

  const defaultSizeOption = useMemo(() => {
    if (sizeOptions.length === 0) return null;
    const preferredWeight = String(product.defaultWeight || '').trim().toLowerCase();
    return sizeOptions.find((size) => size.weight.toLowerCase() === preferredWeight) || sizeOptions[0];
  }, [sizeOptions, product.defaultWeight]);

  const [selectedWeight, setSelectedWeight] = useState(defaultSizeOption?.weight || '');

  const activeSize = sizeOptions.find((size) => size.weight === selectedWeight) || defaultSizeOption;
  const displayPrice = activeSize ? activeSize.price : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);

    const variantWeight = activeSize?.weight || String(product.defaultWeight || '').trim();
    const productForCart: Product = {
      ...product,
      price: displayPrice,
      selectedSize: variantWeight || undefined,
      selectedWeight: variantWeight || undefined,
      defaultWeight: variantWeight || product.defaultWeight,
    };

    addToCart(productForCart, 1);
    setTimeout(() => {
      setIsAdding(false);
      setIsOverlayOpen(false);
    }, 600);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const variantWeight = activeSize?.weight || String(product.defaultWeight || '').trim();
    const productForCart: Product = {
      ...product,
      price: displayPrice,
      selectedSize: variantWeight || undefined,
      selectedWeight: variantWeight || undefined,
      defaultWeight: variantWeight || product.defaultWeight,
    };

    addToCart(productForCart, 1);
    // Optionally redirect to checkout directly
    // router.push('/checkout'); 
    setIsOverlayOpen(false);
  };

  // Render the hover overlay
  const renderOverlay = () => (
    <div
      className={`absolute inset-0 bg-white/95 flex flex-col transition-opacity duration-300 ease-in-out z-20 ${
        isOverlayOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => e.stopPropagation()} // Prevent navigating when clicking inside overlay
    >
      {/* Top Content Area */}
      <div className="flex-1 flex flex-col p-2 sm:p-4">
        {/* Close Button */}
        <div className="flex justify-end mb-1 sm:mb-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOverlayOpen(false);
            }}
            className="flex items-center gap-1 text-[10px] sm:text-[13px] font-semibold text-gray-800 hover:text-black tracking-wide"
          >
            <FiX className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">CLOSE</span>
          </button>
        </div>

        {/* Content Centered */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-2 sm:-mt-4">
          <div className="text-[12px] sm:text-[15px] text-black mb-1.5 sm:mb-3">
            <span className="font-semibold">Weight :</span> <span className="text-gray-500">: {selectedWeight}</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-6">
            {sizeOptions.length > 0 ? (
              sizeOptions.map((size) => {
                const isSelected = selectedWeight === size.weight;
                return (
                  <button
                    key={size.weight}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedWeight(size.weight);
                    }}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[14px] transition-colors rounded-[4px] leading-tight ${
                      isSelected
                        ? 'border-[1.5px] border-black text-black font-semibold'
                        : 'border border-gray-300 text-black hover:border-gray-400'
                    }`}
                  >
                    {size.weight}
                  </button>
                );
              })
            ) : (
              <span className="text-[10px] sm:text-[14px] text-gray-500">Standard Size</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section (Price & Buttons) */}
      <div className="w-full mt-auto flex flex-col">
        <div className="text-center w-full mb-1.5 sm:mb-3 text-[14px] sm:text-[18px] md:text-[20px] font-semibold text-[#444444]">
          ₹ {displayPrice}
        </div>
        <div className="flex w-full">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-[#3e5c4a] hover:bg-[#2d4738] text-white py-2 sm:py-3.5 text-[9px] sm:text-[12px] md:text-[13px] font-medium tracking-wide transition-colors disabled:opacity-75"
          >
            <FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">{isAdding ? 'ADDING...' : 'ADD TO CART'}</span>
          </button>
          <div className="w-[1px] bg-white/20"></div>
          <button
            onClick={handleBuyNow}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-[#3e5c4a] hover:bg-[#2d4738] text-white py-2 sm:py-3.5 text-[9px] sm:text-[12px] md:text-[13px] font-medium tracking-wide transition-colors"
          >
            <FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">BUY NOW</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="group flex flex-col w-full h-full">
      {/* Image & Overlay Wrapper */}
      <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-[6px] bg-[#F9F6F3]">
        <Link href={productUrl} className="block relative w-full h-full">
          <Image
            src={product.image && product.image.trim() !== '' ? product.image : `https://picsum.photos/seed/product${product.id}/500/500`}
            alt={product.name}
            fill
            className={`object-cover object-center transition-all duration-700 scale-100 group-hover:scale-110 ${
              product.images && product.images.length > 0 ? 'group-hover:opacity-0' : ''
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Second Image on Hover */}
          {product.images && product.images.length > 0 && (
            <Image
              src={product.images[0]}
              alt={`${product.name} - View 2`}
              fill
              loading="lazy"
              className="object-cover object-center transition-all duration-700 opacity-0 scale-100 group-hover:opacity-100 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Wishlist Heart Icon (Top Right) - Appears on Hover */}
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
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all z-10 shadow-sm opacity-0 group-hover:opacity-100"
          >
            <FiHeart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-[#FE8E02] text-[#FE8E02]' : 'text-gray-500 hover:text-[#FE8E02]'}`} />
          </button>
        </Link>
        
        {/* Hover Overlay */}
        {renderOverlay()}
      </div>

      {/* Product Info (Default State) */}
      <div className="w-full flex flex-col items-start text-left px-1 mt-1">
        <Link href={productUrl} className="block mb-1 hover:opacity-80 transition-opacity w-full">
          <h3 className="text-[#333333] text-[13px] sm:text-[15px] md:text-[16px] lg:text-[18px] font-bold font-sans leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price (Visible Default) / Select Options (Visible Hover) */}
        <div className="w-full text-left relative min-h-[24px]">
          {/* Price */}
          <span className="text-[#555555] font-normal text-[14px] sm:text-[15px] md:text-[16px] font-inter absolute top-0 left-0 transition-opacity duration-200 group-hover:opacity-0 group-hover:pointer-events-none pointer-events-auto">
            ₹ {displayPrice}
          </span>

          {/* Select Options Link */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOverlayOpen(true);
            }}
            className="text-[#555555] text-[14px] sm:text-[15px] absolute top-0 left-0 transition-opacity duration-200 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none"
          >
            <span className="border-b border-[#555555] pb-[1px] hover:text-black hover:border-black transition-colors">
              Select Options
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;