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
        className="relative flex flex-col cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Rectangular Image Container */}
        <div className="relative w-full aspect-[4/4] overflow-hidden rounded-lg bg-gray-100">
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
        <div className="mt-3 text-center">
          <h3 className="text-sm md:text-base font-semibold text-black line-clamp-2 font-general-sans mb-1">
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
    <section className="pt-10 pb-14 md:pt-16 md:pb-20 px-4 bg-white w-full">
      <div className="max-w-6xl lg:max-w-7xl mx-auto">
        {/* Header: Title on left, View All button on right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-[450] text-black font-general-sans mb-2">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary-red text-white px-6 py-2.5 md:px-8 md:py-3 font-medium tracking-wide font-general-sans text-sm md:text-base hover:bg-primary-darkRed transition-all duration-300 rounded-lg shadow-md"
          >
            View All
          </Link>
        </div>

        {/* Product Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
