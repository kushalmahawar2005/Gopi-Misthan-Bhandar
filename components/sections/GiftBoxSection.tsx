'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface GiftBoxItem {
  _id: string;
  category: 'assorted' | 'dry-fruit' | 'souvenir' | string;
  title: string;
  description: string;
  imageUrl: string;
  size?: 'small' | 'large';
  price?: number;
}

interface GiftBoxSectionProps {
  giftBoxes: GiftBoxItem[];
}

const GiftBoxSection: React.FC<GiftBoxSectionProps> = ({ giftBoxes }) => {
  if (!giftBoxes || giftBoxes.length === 0) return null;

  // Group by size and sort by price
  const smallSizeBoxes = giftBoxes
    .filter((g) => g.size === 'small')
    .sort((a, b) => (a.price || 0) - (b.price || 0));
  const largeSizeBoxes = giftBoxes
    .filter((g) => g.size === 'large')
    .sort((a, b) => (a.price || 0) - (b.price || 0));

  return (
    <section className="py-6 mt-6 md:py-12 md:mt-8 px-4 bg-white w-full">
      <div className="w-full max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-4xl text-black mb-2 font-jost font-[500] text-center">
          GIFT BOX
        </h2>
        <p className="text-gray-800 text-sm md:text-[15px] font-geom mb-6 md:mb-8 text-center max-w-3xl mx-auto leading-relaxed">
          Exquisitely packaged to benefit every occasion, we celebrate your pride, happiness and relationships with absolute grandeur.
        </p>

        {/* Small Size Gifts */}
        {smallSizeBoxes.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-brown mb-6 font-general-sans text-center">
              Small Size Gifts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 items-start">
              {smallSizeBoxes.map((item) => (
                <article key={item._id} className="group bg-white overflow-hidden flex flex-col rounded-md">
                  {/* Image block */}
                  <div className="relative w-full h-[220px] sm:h-[240px] md:h-[260px] lg:h-[280px] overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={false}
                    />

                    {/* Hover gradient */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Button shown on hover */}
                    <div className="absolute inset-x-4 bottom-4 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Link
                        href={`/giftbox/${encodeURIComponent(item.category)}`}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-white text-black text-xs md:text-sm font-medium shadow-sm hover:shadow-md border border-gray-200 hover:bg-gray-50"
                      >
                        View Collection
                      </Link>
                    </div>
                  </div>

                  {/* Text area */}
                  <div className="px-4 md:px-5 py-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm md:text-base font-general-sans font-[600] text-primary-brown text-center md:text-left">
                        {item.title}
                      </h3>
                      <p className="text-[12px] sm:text-sm text-gray-700 mt-2 text-center md:text-left leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-lg md:text-xl font-bold text-primary-red mt-3 font-general-sans text-center md:text-left">
                        ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Large Size Gifts */}
        {largeSizeBoxes.length > 0 && (
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-primary-brown mb-6 font-general-sans text-center">
              Large Size Gifts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 items-start">
              {largeSizeBoxes.map((item) => (
                <article key={item._id} className="group bg-white overflow-hidden flex flex-col rounded-md">
                  {/* Image block */}
                  <div className="relative w-full h-[220px] sm:h-[240px] md:h-[260px] lg:h-[280px] overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={false}
                    />

                    {/* Hover gradient */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Button shown on hover */}
                    <div className="absolute inset-x-4 bottom-4 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Link
                        href={`/giftbox/${encodeURIComponent(item.category)}`}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-white text-black text-xs md:text-sm font-medium shadow-sm hover:shadow-md border border-gray-200 hover:bg-gray-50"
                      >
                        View Collection
                      </Link>
                    </div>
                  </div>

                  {/* Text area */}
                  <div className="px-4 md:px-5 py-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm md:text-base font-general-sans font-[600] text-primary-brown text-center md:text-left">
                        {item.title}
                      </h3>
                      <p className="text-[12px] sm:text-sm text-gray-700 mt-2 text-center md:text-left leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-lg md:text-xl font-bold text-primary-red mt-3 font-general-sans text-center md:text-left">
                        ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GiftBoxSection;
