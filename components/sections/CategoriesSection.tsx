
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CategoryCard from '../CategoryCard';
import { Category } from '@/types';

interface CategoriesSectionProps {
  categories: Category[];
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  // Define colors for the bento grid cards
  const cardColors = [
    { bg: '#B85C38', label: 'Terracotta' }, // Hero
    { bg: '#2A1A0E', label: 'Dark Brown' },
    { bg: '#2D4B37', label: 'Forest Green' },
    { bg: '#D4A017', label: 'Amber' },
    { bg: '#5D3A6B', label: 'Purple' },
  ];

  // Map categories to emojis for the strip (fallback if no emoji field)
  const getEmoji = (slug: string) => {
    const emojis: { [key: string]: string } = {
      'sweets': '🍬',
      'namkeen': '🥨',
      'gifts': '🎁',
      'bakery': '🍞',
      'snacks': '🍿',
      'festive': '✨',
    };
    return emojis[slug.toLowerCase()] || '🍽️';
  };

  return (
    <section className="pt-8 pb-20 md:pt-10 md:pb-28 w-full bg-[#F3EEE9]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-[50px]">
        {/* HEADER */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-[12px] md:text-[14px] font-dm-sans tracking-[0.25em] uppercase text-[#B85C38] font-semibold mb-3">
            Explore Our Collection
          </p>
          <h2 className="text-4xl md:text-6xl font-flama-condensed uppercase tracking-[0.05em] text-[#2A1A0E] mb-4">
            Our Categories
          </h2>
          <p className="text-sm md:text-base text-[#8B6B52] font-dm-sans max-w-2xl mx-auto">
            A curated selection of authentic Indian flavors, crafted with tradition and love.
          </p>
          <div className="w-[40px] h-[1.5px] bg-[#B85C38] mx-auto mt-6"></div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] md:grid-rows-2 gap-4 md:gap-5 h-auto md:h-[650px]">
          {/* Big Hero Card (Left) */}
          <Link 
            href={`/products?category=${categories[0]?.slug}`}
            className="md:row-span-2 group relative rounded-[14px] overflow-hidden cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-[1.02]"
          >
             {/* Image Zoom Effect */}
            <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.06]">
              {/* Image */}
              {categories[0]?.image && (
                 <Image 
                  src={categories[0].image} 
                  alt={categories[0].name} 
                  fill 
                  className="object-cover"
                />
              )}
              {/* Radial Dot Pattern Overlay (Subtle) */}
              <div 
                className="absolute inset-0 opacity-[0.4] pointer-events-none" 
                style={{ backgroundImage: `radial-gradient(rgba(0,0,0,0.1) 0.8px, transparent 0.8px)`, backgroundSize: '12px 12px' }}
              ></div>
            </div>
          </Link>

          {/* 4 Smaller Cards (Right) */}
          {categories.slice(1, 5).map((category) => (
            <Link 
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative rounded-[14px] overflow-hidden cursor-pointer h-[250px] md:h-auto transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-[1.02]"
            >
              <div 
                className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.06]"
              >
                 {category.image && (
                   <Image 
                    src={category.image} 
                    alt={category.name} 
                    fill 
                    className="object-cover"
                  />
                )}
                {/* Radial Dot Pattern Overlay (Subtle) */}
                <div 
                  className="absolute inset-0 opacity-[0.4] pointer-events-none" 
                  style={{ backgroundImage: `radial-gradient(rgba(0,0,0,0.1) 0.8px, transparent 0.8px)`, backgroundSize: '12px 12px' }}
                ></div>
              </div>
            </Link>
          ))}
        </div>

        {/* QUICK-NAV STRIP */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <Link 
              key={category.id} 
              href={`/products?category=${category.slug}`}
              className="group relative flex items-center gap-4 bg-white p-4 border-[0.5px] border-[#2A1A0E]/10 rounded-[12px] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg overflow-hidden"
            >
              {/* Animated Left Border Accent */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#B85C38] origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100"></div>
              
              {/* Image Box */}
              <div className="flex-shrink-0 w-12 h-12 relative rounded-[10px] overflow-hidden bg-[#FAF0E6] shadow-sm">
                {category.image ? (
                  <Image 
                    src={category.image} 
                    alt={category.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {getEmoji(category.slug)}
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-grow">
                <h4 className="text-[15px] font-dm-sans font-semibold text-[#2A1A0E]">
                  {category.name}
                </h4>
                <p className="text-[12px] font-dm-sans text-[#8B6B52]">
                  {category.productsCount || 0} Products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
