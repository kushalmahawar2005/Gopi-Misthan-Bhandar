'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Product, Category, InstagramPost } from '@/types';

// Dynamic Imports for performance
const FeaturedCollection = dynamic(() => import('@/components/sections/FeaturedCollection'), {
  loading: () => <div className="h-96 w-full bg-gray-50 animate-pulse" />,
});
const AboutSection = dynamic(() => import('@/components/sections/AboutSection'));
const CategoriesSection = dynamic(() => import('@/components/sections/CategoriesSection'));
const ProductSection = dynamic(() => import('@/components/sections/ProductSection'));
const InstaBookSection = dynamic(() => import('@/components/sections/InstaBookSection'));
const GallerySection = dynamic(() => import('@/components/sections/GallerySection'));
const GiftBoxSection = dynamic(() => import('@/components/sections/GiftBoxSection'));
const BlogSection = dynamic(() => import('@/components/sections/BlogSection'));
const PurityBanner = dynamic(() => import('@/components/sections/PurityBanner'));

interface HomeClientProps {
  featuredProducts: Product[];
  classicProducts: Product[];
  premiumProducts: Product[];
  categories: Category[];
  instaBooks: InstagramPost[];
  galleryItems: any[];
  blogs: any[];
}

export default function HomeClient({
  featuredProducts,
  classicProducts,
  premiumProducts,
  categories,
  instaBooks,
  galleryItems,
  blogs,
}: HomeClientProps) {
  return (
    <main className="min-h-screen w-full relative">
      <h1 className="sr-only">Gopi Misthan Bhandar Neemuch - Traditional Indian Sweets Since 1968</h1>
      <Header />
      <Navigation />
      <Cart />
      <HeroSection />

      {featuredProducts.length > 0 && (
        <ScrollAnimation>
          <div id="featured">
            <FeaturedCollection products={featuredProducts.slice(0, 8)} />
          </div>
        </ScrollAnimation>
      )}

      {categories.length > 0 && (
        <ScrollAnimation>
          <div id="categories">
            <CategoriesSection categories={categories} />
          </div>
        </ScrollAnimation>
      )}

      {classicProducts.length > 0 && (
        <ScrollAnimation>
          <div id="sweets">
            <ProductSection
              title="Classic Sweets"
              subtitle="Timeless Traditional Flavors"
              products={classicProducts}
              viewMoreLink="/products?category=sweets"
            />
          </div>
        </ScrollAnimation>
      )}

      {premiumProducts.length > 0 && (
        <ScrollAnimation>
          <ProductSection
            title="Premium Sweets"
            subtitle="The Luxury Signature Collection"
            products={premiumProducts}
            viewMoreLink="/products?category=sweets"
          />
        </ScrollAnimation>
      )}

      <ScrollAnimation>
        <div id="about">
          <AboutSection />
        </div>
      </ScrollAnimation>

      <div className="my-5 md:my-7">
        <PurityBanner />
      </div>

      <ScrollAnimation>
        <div id="gifting">
          <GiftBoxSection />
        </div>
      </ScrollAnimation>

      {instaBooks.length > 0 && (
        <ScrollAnimation>
          <InstaBookSection instaBooks={instaBooks} />
        </ScrollAnimation>
      )}

      {galleryItems.length > 0 && (
        <ScrollAnimation className={blogs.length === 0 ? 'mb-10 md:mb-16' : ''}>
          <GallerySection galleryItems={galleryItems} />
        </ScrollAnimation>
      )}

      {blogs.length > 0 && (
        <ScrollAnimation>
          <BlogSection blogs={blogs} />
        </ScrollAnimation>
      )}

      <Footer />
    </main>
  );
}
