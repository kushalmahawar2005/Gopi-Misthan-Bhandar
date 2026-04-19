'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { FiShoppingCart, FiEye, FiHeart } from 'react-icons/fi';

interface ProductListCardProps {
  product: Product;
  showAddToCart?: boolean;
}

const ProductListCard: React.FC<ProductListCardProps> = ({ product, showAddToCart = true }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
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

  useEffect(() => {
    setSelectedWeight(defaultSizeOption?.weight || '');
  }, [defaultSizeOption?.weight, product.id]);

  const activeSize = sizeOptions.find((size) => size.weight === selectedWeight) || defaultSizeOption;
  const displayPrice = activeSize ? activeSize.price : product.price;
  const hasMultipleSizes = sizeOptions.length > 1;

  const handleAddToCart = async (e: React.MouseEvent) => {
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
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <Link href={productUrl} className="group block">
      <div 
        className="flex flex-row gap-4 md:gap-6 p-4 md:p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 bg-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
          <Image
            src={product.image && product.image.trim() !== '' ? product.image : `https://picsum.photos/seed/product${product.id}/240/240`}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* Brand Name */}
            <p className="text-black text-[10px] md:text-xs font-general-sansal-sansal-sansal-sans mb-1 font-normal">
              GOPI MISTHAN BHANDAR
            </p>

            {showAddToCart && hasMultipleSizes && (
              <div
                className="mb-3 max-w-[320px]"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {sizeOptions.map((size) => (
                    <button
                      key={`${product.id}-${size.weight}`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedWeight(size.weight);
                      }}
                      className={`min-w-[88px] rounded-md border px-2 pt-1.5 pb-2 text-left transition-colors ${
                        selectedWeight === size.weight
                          ? 'border-[#FE8E02] bg-orange-50'
                          : 'border-[#d6cec6] bg-white hover:border-[#FE8E02]/60'
                      }`}
                    >
                      <p className={`text-[12px] font-bold leading-tight ${selectedWeight === size.weight ? 'text-[#FE8E02]' : 'text-[#503223]'}`}>
                        {size.weight}
                      </p>
                      <p className="text-[11px] leading-tight text-[#503223]">₹{size.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Product Name */}
            <h3 className="text-base md:text-lg lg:text-xl font-general-sansal-sansal-sansal-sans font-bold text-black mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm md:text-base text-gray-600 mb-3 line-clamp-2 hidden md:block">
              {product.description}
            </p>
            
            {/* Price */}
            <p className="text-primary-red font-bold text-lg md:text-xl lg:text-2xl font-general-sansal-sansal-sansal-sans mb-4">
              ₹{displayPrice}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
            {showAddToCart && (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex items-center gap-2 bg-primary-red text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold font-general-sansal-sansal-sansal-sans text-sm md:text-base hover:bg-primary-darkRed transition-colors disabled:opacity-50"
              >
                <FiShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
            )}
            
            <Link
              href={productUrl}
              onClick={(e) => e.stopPropagation()}
              className="p-2 md:p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="View details"
            >
              <FiEye className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </Link>
            
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
              className={`p-2 md:p-3 border rounded-lg transition-colors ${
                isFavorite 
                  ? 'border-red-300 bg-red-50 text-red-600' 
                  : 'border-gray-300 hover:bg-gray-100 text-gray-600'
              }`}
              aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'fill-red-600' : ''}`} />
            </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductListCard;

