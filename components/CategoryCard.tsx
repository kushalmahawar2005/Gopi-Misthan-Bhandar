'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const imageSrc =
    category.image && category.image.trim() !== ''
      ? category.image
      : '/c-1.jpg';

  return (
    <Link href={`/category/${category.slug}`} className="block group">
      <div className="flex flex-col items-center">
        {/* IMAGE */}
        <div className="relative w-full mb-3 aspect-square overflow-hidden rounded-lg group-hover:rounded-full">
          <Image
            src={imageSrc}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            unoptimized
          />
        </div>

        {/* TEXT */}
        <div className="text-center">
          <h3 className="text-xs md:text-sm font-medium uppercase tracking-widest text-primary-brown font-geom">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}