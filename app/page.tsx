'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import HeroSection from '@/components/HeroSection';
import FeaturedCollection from '@/components/sections/FeaturedCollection';
import PromotionalBanner from '@/components/sections/PromotionalBanner';
import AboutSection from '@/components/sections/AboutSection';
import CategoriesSection from '@/components/sections/CategoriesSection';
import ProductSection from '@/components/sections/ProductSection';
import InstaBookSection from '@/components/sections/InstaBookSection';
import InstaPostSection from '@/components/sections/InstaPostSection';
import GallerySection from '@/components/sections/GallerySection';
import GiftBoxSection from '@/components/sections/GiftBoxSection';
import BlogSection from '@/components/sections/BlogSection';
import Footer from '@/components/Footer';
import DecorativeBanner from '@/components/DecorativeBanner';
import ScrollAnimation from '@/components/ScrollAnimation';
import { fetchProducts, fetchCategories, fetchInstaBooks, fetchInstaPosts, fetchGallery, fetchGiftBoxes, fetchBlogs } from '@/lib/api';
import { Product, Category, InstagramPost } from '@/types';

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
      
      setClassicProducts(classicFlagged.slice(0, 8));
      setPremiumProducts(premiumFlagged.slice(0, 8));
      
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

  if (loading) {
    return (
      <main className="min-h-screen bg-white w-full overflow-x-hidden">
        <Header />
        <Navigation />
        <Cart />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white w-full overflow-x-hidden pb-24 md:pb-0">
      <Header />
      <Navigation />
      <Cart />
      <HeroSection />
      
      {/* Promotional Banner with Intro Animation */}
      <PromotionalBanner />
      
      <ScrollAnimation delay={100}>
        <div id="featured">
          <FeaturedCollection products={featuredProducts.slice(0, 8)} />
        </div>
      </ScrollAnimation>
      
      <ScrollAnimation delay={150}>
        <CategoriesSection categories={categories} />
      </ScrollAnimation>
      
      <ScrollAnimation delay={200}>
        <div id="sweets">
          <ProductSection 
            title="Classic Sweets"
            subtitle="Savour The Timeless Taste of Tradition With Kesar Classic Sweets"
            products={classicProducts}
            viewMoreLink="/products?category=sweets"
          />
        </div>
      </ScrollAnimation>
      
      <ScrollAnimation delay={200}>
        <ProductSection 
          title="Premium Sweets"
          subtitle="Savour The Timeless Taste of Tradition With Kesar Classic Sweets"
          products={premiumProducts}
          viewMoreLink="/products?category=sweets"
        />
      </ScrollAnimation>
      
      <ScrollAnimation delay={150}>
        <div id="about">
          <AboutSection />
        </div>
      </ScrollAnimation>
      
      <ScrollAnimation delay={200}>
        <GiftBoxSection giftBoxes={giftBoxes} />
      </ScrollAnimation>
      
      <ScrollAnimation delay={150}>
        <InstaBookSection instaBooks={instaBooks} />
      </ScrollAnimation>
      
      <ScrollAnimation delay={200}>
        <GallerySection galleryItems={galleryItems} />
      </ScrollAnimation>
      
      <ScrollAnimation delay={150}>
        <InstaPostSection instaPosts={instaPosts} />
      </ScrollAnimation>
      
      <ScrollAnimation delay={200}>
        <BlogSection blogs={blogs} />
      </ScrollAnimation>
      
      <Footer />
    </main>
  );
}
