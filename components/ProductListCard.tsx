'use client';

import React, { useState } from 'react';
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
              ₹{product.price}
            </p>
          </div>

          {/* Action Buttons */}
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
              href={`/product/${product.id}`}
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
    </Link>
  );
};

export default ProductListCard;

