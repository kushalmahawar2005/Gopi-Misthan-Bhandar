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
    <Link href={`/category/${category.slug}`} className="block">
      <div className="flex flex-col">
        {/* IMAGE */}
        <div className="relative w-full mb-2 aspect-[294/410] overflow-hidden rounded-[15px]">

          <Image
            src={imageSrc}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 ease-out hover:scale-105"
            unoptimized
          />
        </div>

        {/* TEXT */}
        {/* ⬇️ mt-4 → mt-2 (image-text gap kam) */}
        <div className="mt-2 text-center">
          {/* ⬇️ line-height tight */}
          <h3
            className="text-[21px] leading-snug"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 600,
            }}
          >
            {category.name}
          </h3>

          {/* ⬇️ mt-0.5 → mt-0 (text-text gap kam) */}
          <p
            className="mt-0 text-[15px] text-gray-600"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 400,
            }}
          >
            {category.productsCount ?? 0} Products
          </p>
        </div>
      </div>
    </Link>
  );
}
