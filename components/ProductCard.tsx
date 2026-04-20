'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { FiChevronDown, FiHeart } from 'react-icons/fi';

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
  const [isMobileSizeMenuOpen, setIsMobileSizeMenuOpen] = useState(false);
  const mobileSizeMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedWeight(defaultSizeOption?.weight || '');
    setIsMobileSizeMenuOpen(false);
  }, [defaultSizeOption?.weight, product.id]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!mobileSizeMenuRef.current) return;
      if (mobileSizeMenuRef.current.contains(event.target as Node)) return;
      setIsMobileSizeMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileSizeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const activeSize = sizeOptions.find((size) => size.weight === selectedWeight) || defaultSizeOption;
  const displayPrice = activeSize ? activeSize.price : product.price;
  const hasMultipleSizes = sizeOptions.length > 1;
  const displayWeight = activeSize?.weight || String(product.defaultWeight || '').trim() || 'Default';

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
          <div className="mb-3 w-full flex flex-col gap-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-3">
            <div className="min-w-0 flex-1">
              <Link href={productUrl} className="block mb-1 group-hover:opacity-80 transition-opacity">
                <h3 className="text-[#1A1A1A] text-[14px] sm:text-[15px] md:text-[17px] font-medium font-flama leading-snug line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              <span className="text-[#503223] font-bold text-[15px] sm:text-[16px] md:text-[17px] font-inter">
                ₹{displayPrice}
              </span>
            </div>

            {showAddToCart && hasMultipleSizes && (
              <div className="hidden w-full self-start md:block md:w-auto md:max-w-[152px]">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar md:pb-0">
                  {sizeOptions.map((size) => (
                    <button
                      key={`${product.id}-${size.weight}`}
                      type="button"
                      onClick={() => setSelectedWeight(size.weight)}
                      className={`min-w-[66px] sm:min-w-[72px] min-h-[52px] sm:min-h-[58px] rounded border px-2.5 sm:px-3 py-1.5 sm:py-2 text-left transition-colors ${
                        selectedWeight === size.weight
                          ? 'border-[#FE8E02] bg-orange-50'
                          : 'border-[#d6cec6] bg-white hover:border-[#FE8E02]/60'
                      }`}
                    >
                      <p className={`text-[13px] sm:text-[14px] font-bold leading-tight ${selectedWeight === size.weight ? 'text-[#FE8E02]' : 'text-[#503223]'}`}>
                        {size.weight}
                      </p>
                      <p className="text-[11px] sm:text-[12px] leading-[1.2] text-[#503223]">₹{size.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {showAddToCart && (
            <div className="mt-auto w-full flex flex-col gap-2 md:gap-3">
              {/* Mobile controls: size selector + quantity row */}
              <div className="grid grid-cols-2 gap-2 md:hidden">
                <div ref={mobileSizeMenuRef} className="relative h-[42px]">
                  {sizeOptions.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsMobileSizeMenuOpen((prev) => !prev);
                        }}
                        className="flex h-full w-full items-center justify-between rounded-[12px] border border-[#d6cec6] bg-white px-3 text-[14px] font-semibold text-[#2D2D2D]"
                        aria-haspopup="listbox"
                        aria-expanded={isMobileSizeMenuOpen}
                        aria-label="Select weight"
                      >
                        <span className="truncate pr-3">{displayWeight}</span>
                        <FiChevronDown
                          className={`h-4 w-4 shrink-0 text-[#503223] transition-transform ${
                            isMobileSizeMenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isMobileSizeMenuOpen && (
                        <div
                          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-44 overflow-y-auto rounded-[12px] border border-[#d6cec6] bg-white py-1 shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                          role="listbox"
                          aria-label="Weight options"
                        >
                          {sizeOptions.map((size) => {
                            const isSelected = selectedWeight === size.weight;
                            return (
                              <button
                                key={`${product.id}-mobile-${size.weight}`}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedWeight(size.weight);
                                  setIsMobileSizeMenuOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-[13px] transition-colors ${
                                  isSelected
                                    ? 'bg-orange-50 font-semibold text-[#FE8E02]'
                                    : 'text-[#2D2D2D] hover:bg-[#f8f3ed]'
                                }`}
                                role="option"
                                aria-selected={isSelected}
                              >
                                {size.weight}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full items-center rounded-[12px] border border-[#d6cec6] bg-white px-3 text-[14px] font-semibold text-[#2D2D2D]">
                      {displayWeight}
                    </div>
                  )}
                </div>

                <div className="flex h-[42px] items-center justify-between rounded-[12px] border border-[#d6cec6] bg-white px-2.5">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="h-7 w-7 flex items-center justify-center text-[20px] leading-none text-[#503223] disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="min-w-[16px] text-center text-[16px] leading-none text-[#2D2D2D] font-inter font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= maxQuantity}
                    className="h-7 w-7 flex items-center justify-center text-[20px] leading-none text-[#503223] disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="md:hidden w-full h-[44px] rounded-[14px] bg-primary-red text-white text-[12px] font-semibold transition-all duration-300 active:scale-[0.97] disabled:opacity-75 flex items-center justify-center overflow-hidden relative"
              >
                <span className={`transition-all duration-300 ${isAdding ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                  Add To Cart
                </span>
                {isAdding && (
                  <span className="absolute inset-0 flex items-center justify-center text-white bg-green-600 animate-in fade-in zoom-in duration-300">
                    ADDED!
                  </span>
                )}
              </button>

              {/* Desktop controls */}
              <div className="hidden w-full md:flex md:flex-row md:items-center md:gap-3">
                <div className="w-full md:w-auto flex items-center justify-between h-[42px] md:h-[50px] md:min-w-[120px] px-2 md:px-3 border border-[#d6cec6] bg-white">
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
                  className="w-full md:flex-1 h-[42px] md:h-[50px] bg-[#FE8E02] text-white text-[10px] sm:text-[11px] md:text-[12px] font-bold tracking-[0.1em] md:tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.97] disabled:opacity-75 flex items-center justify-center overflow-hidden relative"
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