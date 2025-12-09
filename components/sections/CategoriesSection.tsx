'use client';

import React from 'react';
import CategoryCard from '../CategoryCard';
import { Category } from '@/types';
import Link from 'next/link';

interface CategoriesSectionProps {
  categories: Category[];
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <section className="py-12 md:py-20 px-4 bg-white w-full">
        <div className="w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-2xl lg:text-4xl text-black mb-4 font-bold ">
              OUR CATEGORIES
            </h2>
            <p className="text-base md:text-lg font-jost text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of traditional Indian sweets, snacks, and namkeen
            </p>
          </div>
          <div className="text-center text-gray-500 py-8">
            <p>No categories available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-white w-full">
      <div className="section-container w-full">
        <div className="md:text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-jost  text-black mb-2 leading-relaxed font-[450]">
            Our Categories
          </h2>
          <p className="text-base md:text-lg font-jost text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Explore our wide range of traditional Indian sweets, snacks, and namkeen
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
            >
              <CategoryCard category={category} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
