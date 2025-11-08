import React from 'react';
import { Category } from '@/types';
import Image from 'next/image';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="relative h-[450px] md:h-[500px] w-full max-w-[320px] md:max-w-[350px] lg:max-w-[380px] overflow-hidden group cursor-pointer">
      {/* Background Image with Transition */}
      <Image
        src={category.image && category.image.trim() !== '' ? category.image : "/1.jpg"}
        alt={category.name}
        fill
        className="object-cover object-center transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-110"
        sizes="(max-width: 768px) 320px, (max-width: 1024px) 350px, 380px"
      />
      
      {/* Category Name Button - Orange/Red Style */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-primary-red px-8 py-3 rounded-md z-10">
        <p className="text-white text-sm font-sans tracking-wide font-bold uppercase">
          {category.name}
        </p>
      </div>
    </div>
  );
};

export default CategoryCard;
