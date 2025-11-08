'use client';

import React from 'react';
import { Category } from '@/types';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="relative h-[450px] md:h-[500px] w-full max-w-[320px] md:max-w-[350px] lg:max-w-[380px] overflow-hidden group cursor-pointer rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Background Image with Transition */}
      <Image
        src={category.image && category.image.trim() !== '' ? category.image : "/1.jpg"}
        alt={category.name}
        fill
        className="object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-110"
        sizes="(max-width: 768px) 320px, (max-width: 1024px) 350px, 380px"
      />
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Category Name Button - Orange/Red Style */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-primary-red px-8 py-3 rounded-md z-10 group-hover:bg-primary-darkRed transition-all duration-300 group-hover:scale-105 shadow-lg">
        <div className="flex items-center gap-2">
          <p className="text-white text-sm font-sans tracking-wide font-bold uppercase">
            {category.name}
          </p>
          <FiArrowRight className="w-4 h-4 text-white transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
