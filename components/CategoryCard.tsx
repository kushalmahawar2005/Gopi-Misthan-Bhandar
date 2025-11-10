'use client';

import React from 'react';
import { Category } from '@/types';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const imageSrc = category.image && category.image.trim() !== '' 
    ? category.image 
    : "/c-1.jpg";

  return (
    <div className="relative h-[400px] md:h-[450px] lg:h-[500px] w-[320px] md:w-[350px] lg:w-[400px] overflow-hidden group cursor-pointer  shadow-lg hover:shadow-2xl transition-all duration-300 bg-gray-200">
      {/* Background Image with Transition */}
      <Image
        src={imageSrc}
        alt={category.name}
        fill
        className="object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-110"
        sizes="(max-width: 640px) 320px, (max-width: 1024px) 350px, 380px"
        unoptimized
      />
      
      {/* Overlay on hover */}
      <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Category Name Button - Orange/Red Style */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-primary-red tracking-wide px-8 py-4 font-[200] font-poppins text-[15px] z-10 group-hover:bg-primary-darkRed transition-all duration-300 group-hover:scale-105 shadow-lg">
        <div className="flex items-center gap-2">
          <p className="text-white text-sm font-sans tracking-wide font-bold uppercase">
            {category.name}
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
