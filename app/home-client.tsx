'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
const Cart = dynamic(() => import('@/components/Cart'), { ssr: false, loading: () => null });
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import LazySection from '@/components/LazySection';
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
// Hidden for now — kept for easy restore of the Exclusive Gifting section
// const GiftBoxSection = dynamic(() => import('@/components/sections/GiftBoxSection'));
const BlogSection = dynamic(() => import('@/components/sections/BlogSection'));
const PurityBanner = dynamic(() => import('@/components/sections/PurityBanner'));

interface HomeClientProps {
  featuredProducts: Product[];
  classicProducts: Product[];
  premiumProducts: Product[];
  savouryProducts: Product[];
  comboProducts: Product[];
  comboViewMoreLink: string;
  categories: Category[];
  instaBooks: InstagramPost[];
  galleryItems: any[];
  blogs: any[];
}

export default function HomeClient({
  featuredProducts,
  classicProducts,
  premiumProducts,
  savouryProducts,
  comboProducts,
  comboViewMoreLink,
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

      <LazySection
        fallback={<div className="h-80 w-full rounded-3xl bg-white/5" />}
      >
        <ScrollAnimation>
          <div id="about">
            <AboutSection />
          </div>
        </ScrollAnimation>
      </LazySection>

      <LazySection
        fallback={<div className="h-24 md:h-28 w-full rounded-3xl bg-white/5" />}
      >
        <div className="my-5 md:my-7">
          <PurityBanner />
        </div>
      </LazySection>

      {/* Exclusive Gifting hidden for now — replaced with Savoury section below.
          To restore, uncomment the GiftBoxSection block and remove the Savoury block.
      <LazySection
        fallback={<div className="h-80 w-full rounded-3xl bg-white/5" />}
      >
        <ScrollAnimation>
          <div id="gifting">
            <GiftBoxSection />
          </div>
        </ScrollAnimation>
      </LazySection>
      */}

      {savouryProducts.length > 0 && (
        <LazySection
          fallback={<div className="h-80 w-full rounded-3xl bg-white/5" />}
        >
          <ScrollAnimation>
            <div id="savoury">
              <ProductSection
                title="Namkeen & Savouries"
                subtitle="Crispy Traditional Snacks"
                products={savouryProducts}
                viewMoreLink="/products?category=namkeen"
              />
            </div>
          </ScrollAnimation>
        </LazySection>
      )}

      {instaBooks.length > 0 && (
        <LazySection
          fallback={<div className="h-64 w-full rounded-3xl bg-white/5" />}
        >
          <ScrollAnimation>
            <InstaBookSection instaBooks={instaBooks} />
          </ScrollAnimation>
        </LazySection>
      )}

      {/* Combo Packs — sits right below the reels. Renders only once combo
          products exist (any category/subcategory slug containing "combo"). */}
      {comboProducts.length > 0 && (
        <LazySection
          fallback={<div className="h-80 w-full rounded-3xl bg-white/5" />}
        >
          <ScrollAnimation>
            <div id="combo">
              <ProductSection
                title="Combo Packs"
                subtitle="Value Packs, Handpicked Together"
                products={comboProducts.slice(0, 4)}
                viewMoreLink={comboViewMoreLink}
              />
            </div>
          </ScrollAnimation>
        </LazySection>
      )}

      {galleryItems.length > 0 && (
        <LazySection
          fallback={<div className="h-80 w-full rounded-3xl bg-white/5" />}
        >
          <ScrollAnimation className={blogs.length === 0 ? 'mb-10 md:mb-16' : ''}>
            <GallerySection galleryItems={galleryItems} />
          </ScrollAnimation>
        </LazySection>
      )}

      {blogs.length > 0 && (
        <LazySection
          fallback={<div className="h-72 w-full rounded-3xl bg-white/5" />}
        >
          <ScrollAnimation>
            <BlogSection blogs={blogs} />
          </ScrollAnimation>
        </LazySection>
      )}

      <Footer />
    </main>
  );
}
