'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface FeaturedCollectionProps {
  products: Product[];
}

// Rectangular Product Card (like Chhappan Bhog style)
const FeaturedProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasSecondImage = product.images && product.images.length > 0;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div
        className="relative flex flex-col cursor-pointer mb-0 h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Rectangular Image Container */}
        <div className="relative w-full aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={
              product.image && product.image.trim() !== ''
                ? product.image
                : `https://picsum.photos/seed/product${product.id}/400/300`
            }
            alt={product.name}
            fill
            className={`object-cover transition-all duration-500
              ${isHovered ? 'scale-110' : 'scale-100'}
              ${
                hasSecondImage
                  ? isHovered
                    ? 'opacity-0'
                    : 'opacity-100'
                  : 'opacity-100'
              }
            `}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Second Image on Hover (optional) */}
          {hasSecondImage && (
            <Image
              src={product.images![0]}
              alt={`${product.name} - View 2`}
              fill
              className={`object-cover transition-all duration-500
                ${isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}
              `}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </div>

        {/* Product Info Below Image */}
        <div className="mt-3 text-center px-2">
          <h3 className="text-sm md:text-xl font-light text-black line-clamp-2 font-geom  mb-1">
            {product.name}
          </h3>
          <p className="text-xs md:text-sm text-gray-600 font-jost">
            {product.category ? `${product.category.replace('-', ' ')}` : 'Product'}
          </p>
        </div>
      </div>
    </Link>
  );
};

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products }) => {
  // Limit to 4 products for grid display
  const displayProducts = products.slice(0, 4);

  return (
    <section className="pt-8 pb-8 md:pt-12 md:pb-12 bg-white w-full">
      <div className="section-container max-w-6xl lg:max-w-7xl mx-auto px-0 md:px-0">
        {/* Header: Title on left, View All button on right (Desktop only) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 px-4 md:px-6">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-[450] text-black font-general-sans mb-2">
              New Arrivals
            </h2>
          </div>
          {/* View All Button - Hidden on mobile, visible on desktop */}
          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-2 bg-primary-red text-white px-6 py-2.5 md:px-8 md:py-3 font-medium tracking-wide font-general-sans text-sm md:text-base hover:bg-primary-darkRed transition-all duration-300 rounded-lg shadow-md"
          >
            View All
          </Link>
        </div>

        {/* Product Grid - 4 columns on desktop, 2 on tablet and mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
          {displayProducts.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button - Visible on mobile only, below products */}
        <div className="md:hidden text-center mt-6 px-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary-red text-white px-6 py-2.5 font-medium tracking-wide font-general-sans text-base hover:bg-primary-darkRed transition-all duration-300 rounded-lg shadow-md"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
