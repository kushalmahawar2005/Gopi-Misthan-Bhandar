'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  const productUrl = `/product/${product.slug || product.id}`;
  const isFavorite = isInWishlist(product.id);
  const maxQuantity = typeof product.stock === 'number' && product.stock > 0 ? product.stock : 99;

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

  useEffect(() => {
    setSelectedWeight(defaultSizeOption?.weight || '');
  }, [defaultSizeOption?.weight, product.id]);

  const activeSize = sizeOptions.find((size) => size.weight === selectedWeight) || defaultSizeOption;
  const displayPrice = activeSize ? activeSize.price : product.price;
  const hasMultipleSizes = sizeOptions.length > 1;

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

    const variantWeight = activeSize?.weight || String(product.defaultWeight || '').trim();
    const productForCart: Product = {
      ...product,
      price: displayPrice,
      selectedSize: variantWeight || undefined,
      selectedWeight: variantWeight || undefined,
      defaultWeight: variantWeight || product.defaultWeight,
    };

    addToCart(productForCart, quantity);
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
          <Link href={productUrl} className="block relative w-full h-full">
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
          <div className="mb-3 w-full grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0 flex-1">
              <Link href={productUrl} className="block mb-1 group-hover:opacity-80 transition-opacity">
                <h3 className="text-[#1A1A1A] text-[16px] md:text-[17px] font-medium font-flama leading-relaxed line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              <span className="text-[#503223] font-bold text-[16px] md:text-[17px] font-inter">
                ₹{displayPrice}
              </span>
            </div>

            {showAddToCart && hasMultipleSizes && (
              <div className="w-[152px] self-start">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {sizeOptions.map((size) => (
                    <button
                      key={`${product.id}-${size.weight}`}
                      type="button"
                      onClick={() => setSelectedWeight(size.weight)}
                      className={`min-w-[72px] min-h-[58px] rounded border px-3 py-2 text-left transition-colors ${
                        selectedWeight === size.weight
                          ? 'border-[#FE8E02] bg-orange-50'
                          : 'border-[#d6cec6] bg-white hover:border-[#FE8E02]/60'
                      }`}
                    >
                      <p className={`text-[14px] font-bold leading-tight ${selectedWeight === size.weight ? 'text-[#FE8E02]' : 'text-[#503223]'}`}>
                        {size.weight}
                      </p>
                      <p className="text-[12px] leading-[1.2] text-[#503223]">₹{size.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {showAddToCart && (
            <div className="mt-auto w-full flex flex-col gap-2 md:gap-3">
              <div className="w-full flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <div className="w-full md:w-auto flex items-center justify-between h-[42px] md:h-[50px] md:min-w-[120px] px-2.5 md:px-3 border border-[#d6cec6] bg-white">
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
                className="w-full md:flex-1 h-[42px] md:h-[50px] bg-[#FE8E02] text-white text-[11px] md:text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.97] disabled:opacity-75 flex items-center justify-center overflow-hidden relative"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;