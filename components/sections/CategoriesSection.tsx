'use client';

import React from 'react';
import CategoryCard from '../CategoryCard';
import { Category } from '@/types';
import Link from 'next/link';

interface CategoriesSectionProps {
  categories: Category[];
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories }) => {
  return (
    <section className="py-12 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-black mb-4 font-bold">
            OUR CATEGORIES
          </h2>
          <p className="text-base md:text-lg font-serif text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of traditional Indian sweets, snacks, and namkeen
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 justify-items-center">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <CategoryCard category={category} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
