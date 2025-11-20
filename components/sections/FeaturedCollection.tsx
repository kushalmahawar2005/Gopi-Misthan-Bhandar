'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

interface FeaturedCollectionProps {
  products: Product[];
}

// Round Product Card (clean white circle)
const FeaturedProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasSecondImage = product.images && product.images.length > 0;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div
        className="relative flex flex-col items-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Big circle frame */}
        <div className="relative w-full">
          <div className="relative w-full aspect-square flex items-center justify-center">
            {/* Outer clean white circle with shadow + hover scale */}
            <div
              className={`relative rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] bg-white overflow-hidden transform transition-transform duration-300
                w-[80%] h-[80%] md:w-[88%] md:h-[88%] lg:w-[95%] lg:h-[95%]
                ${isHovered ? 'scale-95' : 'scale-100'}
              `}
            >
              <div className="relative w-full h-full">
                {/* Main Image */}
                <Image
                  src={
                    product.image && product.image.trim() !== ''
                      ? product.image
                      : `https://picsum.photos/seed/product${product.id}/240/240`
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
                  sizes="(max-width: 640px) 55vw, (max-width: 1024px) 35vw, 25vw"
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
                    sizes="(max-width: 640px) 55vw, (max-width: 1024px) 35vw, 25vw"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Info Below Circle */}
        <div className="mt-3 text-center w-full px-2">
          <h3 className="text-xs md:text-sm font-[450] text-black line-clamp-2 font-general-sans">
            {product.name}
          </h3>
        </div>
      </div>
    </Link>
  );
};

const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({ products }) => {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (!sliderRef.current || products.length === 0) return;

    const container = sliderRef.current;
    let index = 0;

    const interval = setInterval(() => {
      if (!container) return;

      const children = Array.from(
        container.children
      ) as HTMLElement[];

      if (children.length === 0) return;

      index = (index + 1) % children.length;
      const target = children[index];

      container.scrollTo({
        left: target.offsetLeft,
        behavior: 'smooth',
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length]);

  return (
    <section className="pt-10 pb-14 md:pt-16 md:pb-20 px-4 bg-white w-full">
      <div className="max-w-6xl lg:max-w-7xl mx-auto">
        {/* Misree style: left text, right products */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-10">
          {/* Left: Heading + Description + Button */}
          <div className="w-full lg:w-5/12 pr-4 lg:pr-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-general-sans text-black mb-4 font-[500]">
              New Arrivals
            </h2>
            <p className="text-sm md:text-base lg:text-lg font-jost text-gray-700 mb-6 leading-relaxed max-w-md">
              From traditional treasures to modern delights, discover the freshest picks
              crafted for gifting, celebrations, and every sweet craving in between.
            </p>

            <div className="mt-2">
              {/* Button hidden on mobile, visible from md+ */}
              <Link
                href="/products"
                className="hidden md:inline-flex items-center gap-2 bg-primary-red text-white px-5 py-3 font-[400] tracking-wide font-general-sans text-[15px] hover:bg-primary-darkRed transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                View All Products
                <FiArrowRight className="w-3 h-4" />
              </Link>
            </div>
          </div>

          {/* Right: Horizontal scroll product slider */}
          <div className="w-full lg:w-7/12">
            <div className="relative">
              <div
                ref={sliderRef}
                className="flex gap-4 md:gap-6 overflow-x-auto pb-3 no-scrollbar scroll-smooth snap-x snap-mandatory"
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="snap-start shrink-0 w-[60%] xs:w-[50%] sm:w-[38%] md:w-[30%] lg:w-[25%]"
                  >
                    <FeaturedProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
