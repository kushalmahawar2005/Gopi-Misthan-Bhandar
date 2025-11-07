import React from 'react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="bg-primary-brown border border-[#080808] h-80 w-72 flex items-end justify-center pb-8 relative">
      <div className="absolute bottom-12 bg-black h-10 w-28 flex items-center justify-center">
        <p className="text-white text-xs font-sans tracking-wide">{category.name}</p>
      </div>
    </div>
  );
};

export default CategoryCard;
