'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { fetchGiftBoxes } from '@/lib/api';

interface GiftBoxItem {
  _id: string;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  size?: 'small' | 'large';
  price?: number;
}

function GiftBoxCategoryContent() {
  const params = useParams();
  const categorySlug = (params.category as string) || '';
  const [giftBoxes, setGiftBoxes] = useState<GiftBoxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await fetchGiftBoxes();
        const filtered = all.filter((g) => g.category === categorySlug);
        setGiftBoxes(filtered);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categorySlug]);

  const smallSizeBoxes = giftBoxes.filter((g) => g.size === 'small').sort((a, b) => (a.price || 0) - (b.price || 0));
  const largeSizeBoxes = giftBoxes.filter((g) => g.size === 'large').sort((a, b) => (a.price || 0) - (b.price || 0));

  const headingMap: Record<string, string> = {
    'assorted': 'Assorted Gift Box',
    'dry-fruit': 'Dry Fruit Box',
    'souvenir': 'Souvenir Box',
  };
  const heading = headingMap[categorySlug] || 'Gift Box';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />

      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-brown font-general-sans tracking-tight">
              {heading}
            </h1>
            <p className="text-gray-600 text-sm md:text-base mt-2 font-general-sans">
              Explore curated {heading.toLowerCase()} options.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-red"></div>
            </div>
          ) : giftBoxes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">No gift boxes found in this category.</p>
              <Link href="/" className="inline-block mt-4 px-6 py-3 bg-primary-red text-white rounded-full hover:bg-primary-darkRed transition">
                Go Home
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Small Size Gifts Section */}
              {smallSizeBoxes.length > 0 && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary-brown mb-6 font-general-sans">
                    Small Size Gifts
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {smallSizeBoxes.map((item) => (
                      <article key={item._id} className="group bg-white overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                        <div className="relative w-full h-[220px] md:h-[260px] overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        </div>
                        <div className="px-4 md:px-5 py-4">
                          <h3 className="text-sm md:text-base font-general-sans font-semibold text-primary-brown">
                            {item.title}
                          </h3>
                          <p className="text-[12px] sm:text-sm text-gray-600 mt-2 line-clamp-2">
                            {item.description}
                          </p>
                          <p className="text-lg md:text-xl font-bold text-primary-red mt-3 font-general-sans">
                            ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Large Size Gifts Section */}
              {largeSizeBoxes.length > 0 && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary-brown mb-6 font-general-sans">
                    Large Size Gifts
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {largeSizeBoxes.map((item) => (
                      <article key={item._id} className="group bg-white overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                        <div className="relative w-full h-[220px] md:h-[260px] overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        </div>
                        <div className="px-4 md:px-5 py-4">
                          <h3 className="text-sm md:text-base font-general-sans font-semibold text-primary-brown">
                            {item.title}
                          </h3>
                          <p className="text-[12px] sm:text-sm text-gray-600 mt-2 line-clamp-2">
                            {item.description}
                          </p>
                          <p className="text-lg md:text-xl font-bold text-primary-red mt-3 font-general-sans">
                            ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function GiftBoxCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
        </div>
      }
    >
      <GiftBoxCategoryContent />
    </Suspense>
  );
}
