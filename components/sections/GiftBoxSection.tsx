'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface GiftBox {
  _id: string;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  size: string;
  price: number;
  order: number;
  isActive: boolean;
}

const GiftBoxSection: React.FC = () => {
  const [giftBoxes, setGiftBoxes] = useState<GiftBox[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGiftBoxes = async () => {
      try {
        const response = await fetch('/api/giftbox');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setGiftBoxes(data.data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching gift boxes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGiftBoxes();
  }, []);

  // Don't render if no gift boxes from admin
  if (!loading && giftBoxes.length === 0) return null;

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Heading */}
        <div className="text-center mb-14 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-flama-condensed tracking-[0.15em] uppercase text-[#503223] mb-4">
            Gift Boxes & Hampers
          </h2>
          <p className="text-[#503223]/60 font-dm-sans text-[14px] md:text-[15px] max-w-lg mx-auto">
            Handcrafted gift boxes for every celebration — made with love, packed with tradition.
          </p>
          <div className="w-16 h-[2px] bg-[#FE8E02] mx-auto mt-5"></div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-[4/3] bg-gray-200 rounded-sm" />
                <div className="mt-2 md:mt-4 flex flex-col items-center gap-1.5 md:gap-2">
                  <div className="h-3 md:h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-2 md:h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2 Rows × 3 Columns Grid */}
        {!loading && giftBoxes.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-8">
            {giftBoxes.map((box, index) => (
              <Link
                key={box._id}
                href={`/giftbox`}
                className="group block"
              >
                {/* Card Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm bg-gray-100">
                  <Image
                    src={box.imageUrl}
                    alt={box.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Price Badge */}
                  {box.price > 0 && (
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-[#503223]/90 text-white px-1.5 py-0.5 md:px-3 md:py-1.5 text-[9px] md:text-[11px] font-flama tracking-wider rounded-sm">
                      ₹{box.price}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#503223]/0 group-hover:bg-[#503223]/15 transition-colors duration-500" />
                </div>

                {/* Name & Info Below Card */}
                <div className="mt-3 md:mt-4 text-center px-1">
                  <h3 className="text-[11.5px] md:text-[16px] font-flama tracking-wide md:tracking-[0.05em] uppercase text-[#503223] leading-tight line-clamp-2">
                    {box.title}
                  </h3>
                  <p className="text-[#503223]/60 text-[9.5px] md:text-[12px] mt-1 line-clamp-1">
                    {box.description}
                  </p>
                  <div className="inline-block px-1.5 py-0.5 md:px-3 md:py-1 bg-[#FDF8F3] text-[#FE8E02] text-[8.5px] md:text-[10px] font-flama uppercase tracking-wide mt-1.5 md:mt-2 rounded-sm border border-[#FE8E02]/10">
                    {box.category}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Link */}
        {!loading && giftBoxes.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/giftbox"
              className="inline-block text-[12px] font-flama tracking-[0.2em] uppercase text-[#503223] border-b border-[#503223]/40 pb-1 hover:border-[#FE8E02] hover:text-[#FE8E02] transition-all duration-300"
            >
              View All Gift Boxes
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default GiftBoxSection;
