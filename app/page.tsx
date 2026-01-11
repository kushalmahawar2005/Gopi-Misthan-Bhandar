'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import { fetchProducts, fetchCategories, fetchInstaBooks, fetchInstaPosts, fetchGallery, fetchGiftBoxes, fetchBlogs } from '@/lib/api';
import { Product, Category, InstagramPost } from '@/types';

// Dynamic Imports for performance
const FeaturedCollection = dynamic(() => import('@/components/sections/FeaturedCollection'), { 
  loading: () => <div className="h-96 w-full bg-gray-50 animate-pulse" /> 
});
const PromotionalBanner = dynamic(() => import('@/components/sections/PromotionalBanner'), { ssr: false });
const AboutSection = dynamic(() => import('@/components/sections/AboutSection'));
const CategoriesSection = dynamic(() => import('@/components/sections/CategoriesSection'));
const ProductSection = dynamic(() => import('@/components/sections/ProductSection'));
const InstaBookSection = dynamic(() => import('@/components/sections/InstaBookSection'));
const InstaPostSection = dynamic(() => import('@/components/sections/InstaPostSection'));
const MapSection = dynamic(() => import('@/components/sections/MapSection'));
const GallerySection = dynamic(() => import('@/components/sections/GallerySection'));
const GiftBoxSection = dynamic(() => import('@/components/sections/GiftBoxSection'));
const BlogSection = dynamic(() => import('@/components/sections/BlogSection'));

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [classicProducts, setClassicProducts] = useState<Product[]>([]);
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instaBooks, setInstaBooks] = useState<InstagramPost[]>([]);
  const [instaPosts, setInstaPosts] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [giftBoxes, setGiftBoxes] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  // loading state is kept for data fetching logic but not used to block UI
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Optimized: Fetch only what we need, avoid duplicate calls
      const [featured, categoriesData, classicFlagged, premiumFlagged, instaBooksData, instaPostsData, galleryData, giftBoxesData, blogsData] = await Promise.all([
        fetchProducts({ featured: true, limit: 8 }),
        fetchCategories(),
        fetchProducts({ isClassic: true, limit: 8 }),
        fetchProducts({ isPremium: true, limit: 8 }),
        fetchInstaBooks(),
        fetchInstaPosts(),
        fetchGallery(),
        fetchGiftBoxes(),
        fetchBlogs(),
      ]);

      setFeaturedProducts(featured);
      setCategories(categoriesData);
      
      // Restrict Classic/Premium sections to Sweets and well-known subcategories
      const sweetsCategory = categoriesData.find((c) => c.slug === 'sweets');
      const defaultSweetsSubs = ['classic-sweets', 'premium-sweets'];
      const sweetsSlugs = sweetsCategory
        ? Array.from(new Set([sweetsCategory.slug, ...(sweetsCategory.subCategories?.map((s: any) => s.slug) || []), ...defaultSweetsSubs]))
        : ['sweets', ...defaultSweetsSubs];
      const isSweetCategory = (slug: string | undefined) => !!slug && /sweet/i.test(slug);
      
      const classicFiltered = classicFlagged.filter((p) => sweetsSlugs.includes(p.category) || isSweetCategory(p.category));
      const premiumFiltered = premiumFlagged.filter((p) => sweetsSlugs.includes(p.category) || isSweetCategory(p.category));
      
      setClassicProducts(classicFiltered.slice(0, 8));
      setPremiumProducts(premiumFiltered.slice(0, 8));
      
      setInstaBooks(instaBooksData);
      setInstaPosts(instaPostsData);
      setGalleryItems(galleryData);
      setGiftBoxes(giftBoxesData);
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white w-full overflow-x-hidden pb-24 md:pb-0">
      <Header />
      <Navigation />
      <Cart />
      <HeroSection />
      
      {/* Promotional Banner with Intro Animation */}
      <PromotionalBanner />
      
      {featuredProducts.length > 0 && (
        <ScrollAnimation delay={100}>
          <div id="featured">
            <FeaturedCollection products={featuredProducts.slice(0, 8)} />
          </div>
        </ScrollAnimation>
      )}
      
      {categories.length > 0 && (
        <ScrollAnimation delay={150}>
          <CategoriesSection categories={categories} />
        </ScrollAnimation>
      )}
      
      {classicProducts.length > 0 && (
        <ScrollAnimation delay={200}>
          <div id="sweets">
            <ProductSection 
              title="Classic Sweets"
              subtitle="Savour The Timeless Taste of Tradition With Gopi Sweets"
              products={classicProducts}
              viewMoreLink="/products?category=sweets"
            />
          </div>
        </ScrollAnimation>
      )}
      
      {premiumProducts.length > 0 && (
        <ScrollAnimation delay={200}>
          <ProductSection 
            title="Premium Sweets"
            subtitle="Savour The Timeless Taste of Tradition With Gopi Premium Sweets"
            products={premiumProducts}
            viewMoreLink="/products?category=sweets"
          />
        </ScrollAnimation>
      )}
      
      <ScrollAnimation delay={150}>
        <div id="about">
          <AboutSection />
        </div>
      </ScrollAnimation>
      
      {giftBoxes.length > 0 && (
        <ScrollAnimation delay={200}>
          <GiftBoxSection giftBoxes={giftBoxes} />
        </ScrollAnimation>
      )}
      
      {instaBooks.length > 0 && (
        <ScrollAnimation delay={150}>
          <InstaBookSection instaBooks={instaBooks} />
        </ScrollAnimation>
      )}
      
      {galleryItems.length > 0 && (
        <ScrollAnimation delay={200}>
          <GallerySection galleryItems={galleryItems} />
        </ScrollAnimation>
      )}
      
      {instaPosts.length > 0 && (
        <ScrollAnimation delay={150}>
          <InstaPostSection instaPosts={instaPosts} />
        </ScrollAnimation>
      )}

      <ScrollAnimation delay={150}>
        <MapSection />
      </ScrollAnimation>
      
      {blogs.length > 0 && (
        <ScrollAnimation delay={200}>
          <BlogSection blogs={blogs} />
        </ScrollAnimation>
      )}
      
      <Footer />
    </main>
  );
}
