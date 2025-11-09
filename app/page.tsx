'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import HeroSection from '@/components/HeroSection';
import FeaturedCollection from '@/components/sections/FeaturedCollection';
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
      const [featured, categoriesData, allSweets, instaBooksData, instaPostsData, galleryData, giftBoxesData, blogsData] = await Promise.all([
        fetchProducts({ featured: true, limit: 8 }),
        fetchCategories(),
        fetchProducts({ category: 'sweets' }), // Fetch all sweets once
        fetchInstaBooks(),
        fetchInstaPosts(),
        fetchGallery(),
        fetchGiftBoxes(),
        fetchBlogs(),
      ]);

      setFeaturedProducts(featured);
      setCategories(categoriesData);
      
      // Split sweets into classic and premium (by price)
      const sortedSweets = allSweets.sort((a, b) => a.price - b.price);
      const midPoint = Math.floor(sortedSweets.length / 2);
      setClassicProducts(sortedSweets.slice(0, midPoint).slice(0, 8));
      setPremiumProducts(sortedSweets.slice(midPoint).slice(0, 8));
      
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
    <main className="min-h-screen bg-white w-full overflow-x-hidden">
      <Header />
      <Navigation />
      <Cart />
      <HeroSection />
      
      <div id="featured">
        <FeaturedCollection products={featuredProducts.slice(0, 8)} />
      </div>
      
      <CategoriesSection categories={categories} />
      
      {/* Decorative Banner - 2nd Image */}
      <DecorativeBanner 
        image="/banner-2.png"
        alt="Classic Sweets Banner"
        bgColor="brown"
        height="h-20 md:h-28"
      />
      
      <div id="sweets">
        <ProductSection 
          title=""
          products={classicProducts}
          bgColor="beige"
        />
      </div>
      
      {/* Decorative Banner - 3rd Image */}
      <DecorativeBanner 
        image="/banner-3.png"
        alt="Premium Sweets Banner"
        bgColor="red"
        height="h-20 md:h-28"
      />
      
      <ProductSection 
        title=""
        products={premiumProducts}
        bgColor="beige"
      />
      
      <div id="about">
        <AboutSection />
      </div>
      
      <GiftBoxSection giftBoxes={giftBoxes} />
      
      <InstaBookSection instaBooks={instaBooks} />
      
      <GallerySection galleryItems={galleryItems} />
      
      <InstaPostSection instaPosts={instaPosts} />
      
      <BlogSection blogs={blogs} />
      
      <Footer />
    </main>
  );
}
