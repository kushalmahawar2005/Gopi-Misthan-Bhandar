'use client';

import React from 'react';
import { Category } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const imageSrc = category.image && category.image.trim() !== '' 
    ? category.image 
    : "/c-1.jpg";

  const router = useRouter();
  const handleNavigation = () => {
    router.push(`/category/${category.slug}`);
  };

  return (
    <Link href={`/category/${category.slug}`} prefetch={true} className="block w-full h-full">
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 bg-gray-200 rounded-xl border border-gray-100 active:scale-95 transform">
        {/* Background Image with Transition */}
        <Image
          src={imageSrc}
          alt={category.name}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
        
        {/* Dark Overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Name Button - Premium Style */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg z-10 group-hover:bg-primary-red transition-all duration-300 group-hover:scale-105 border border-white/20 min-w-[120px] text-center">
          <p className="text-gray-900 text-xs md:text-sm font-general-sans font-bold uppercase tracking-widest whitespace-nowrap group-hover:text-white transition-colors duration-300">
            {category.name}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
