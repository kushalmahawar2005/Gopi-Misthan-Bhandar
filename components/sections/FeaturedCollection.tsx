'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

interface FeaturedCollectionProps {
  products: Product[];
}

// Special Product Card for Featured Collection with semi-circular frame
const FeaturedProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div 
        className="relative flex flex-col items-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Semi-circular frame with golden border */}
        <div className="relative w-full">
          {/* Golden border frame - semi-circular top, rounded bottom */}
          <div className="relative w-full aspect-[4/4] overflow-hidden">
            {/* Outer golden border */}
            <div className="absolute inset-0 border-[4px] md:border-[5px] border-yellow-400 rounded-t-[50%] rounded-b-xl shadow-xl bg-white">
              {/* Inner content area */}
              <div className="absolute inset-[4px] md:inset-[5px] rounded-t-[50%] rounded-b-xl overflow-hidden bg-gradient-to-b from-yellow-50 via-yellow-100/50 to-green-50">
                {/* Product Image Container */}
                <div className="relative w-full h-full">
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
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info Below Frame */}
        <div className="mt-2 text-center w-full px-2">
          {/* Product Name */}
          <h3 className="text-xs md:text-sm font-bold text-black line-clamp-2 font-serif">
            {product.name}
          </h3>
        </div>
      </div>
    </Link>
  );
};

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products }) => {
  return (
    <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-white to-gray-50 w-full">
      <div className="w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-3xl lg:text-4xl font-serif text-black mb-1 font-[100]">
            New Arrivals
          </h2>
          <p className="text-sm md:text-md font-jost text-gray-700 mb-12 max-w-5xl mx-auto leading-relaxed">
            From traditional treasures to modern delights, find the perfect picks for gifting and celebrating
          </p>
        </div>

        {/* Product Cards Grid with Semi-circular Frame */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-12">
          {products.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary-red text-white px-4 py-3  font-[200] font-poppins text-[13px] hover:bg-primary-darkRed transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            View All Products
            <FiArrowRight className="w-3 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
