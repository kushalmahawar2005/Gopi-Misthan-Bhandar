'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchCategoryBySlug } from '@/lib/api';
import { Category, SubCategory } from '@/types';

const GiftBoxSection: React.FC = () => {
  const [giftingCategory, setGiftingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGiftingCategory = async () => {
      try {
        const category = await fetchCategoryBySlug('gifting-');
        if (category && category.subCategories && category.subCategories.length > 0) {
          setGiftingCategory(category);
        }
      } catch (error) {
        console.error('Error fetching gifting category:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGiftingCategory();
  }, []);

  // Don't render if no subcategories found
  if (!loading && (!giftingCategory || !giftingCategory.subCategories || giftingCategory.subCategories.length === 0)) return null;

  const subCategories = giftingCategory?.subCategories || [];

  return (
    <section className="w-full bg-white py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Heading */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-flama-condensed tracking-[0.15em] uppercase text-[#503223] mb-4">
            Exclusive Gifting
          </h2>
          <p className="text-[#503223]/60 font-dm-sans text-[14px] md:text-[15px] max-w-lg mx-auto">
            Traditional Indian gift hampers and customized boxes for every memorable occasion.
          </p>
          <div className="w-16 h-[2px] bg-[#FE8E02] mx-auto mt-5"></div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-[4/5] bg-gray-200 rounded-lg" />
                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid of Subcategories */}
        {!loading && subCategories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {subCategories.slice(0, 4).map((sub) => (
              <Link
                key={sub.slug}
                href={`/products?category=${giftingCategory!.slug}&subcategory=${sub.slug}`}
                className="group block"
              >
                {/* Product Card Styled like a premium gift box */}
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg bg-[#FDF8F3] shadow-sm border border-transparent transition-all duration-300 group-hover:border-[#FE8E02]/30 group-hover:shadow-md">
                  {sub.image ? (
                    <Image
                      src={sub.image}
                      alt={sub.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#FE8E02]/30 font-flama text-4xl">
                      🎁
                    </div>
                  )}
                  {/* Hover overlay with modern blur */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Name Below Card */}
                <div className="mt-4 text-center">
                  <h3 className="text-[14px] md:text-[18px] font-flama-condensed tracking-wider uppercase text-[#503223] transition-colors group-hover:text-[#FE8E02]">
                    {sub.name}
                  </h3>
                  <div className="w-8 h-[1px] bg-[#FE8E02]/20 mx-auto mt-2 transition-all duration-300 group-hover:w-16 group-hover:bg-[#FE8E02]/50"></div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All */}
        {!loading && giftingCategory && (
          <div className="text-center mt-8 md:mt-10">
            <Link
              href={`/products?category=${giftingCategory.slug}`}
              className="inline-flex items-center gap-2 text-[12px] md:text-[13px] font-flama tracking-[0.2em] uppercase text-[#503223] group transition-all duration-300"
            >
              <span className="border-b border-[#503223]/20 group-hover:border-[#FE8E02] group-hover:text-[#FE8E02] pb-0.5">
                Explore All Gifts
              </span>
              <span className="text-[#FE8E02] translate-x-0 transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default GiftBoxSection;
