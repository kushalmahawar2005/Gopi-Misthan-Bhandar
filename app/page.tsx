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
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FFFFFF] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full border-[1px] border-[#8B4513] absolute" />
        <div className="w-[600px] h-[600px] rounded-full border-[1px] border-[#8B4513] absolute" />
        <div className="w-[400px] h-[400px] rounded-full border-[1px] border-[#8B4513] absolute" />
      </div>

      <div className="z-10 text-center space-y-8 p-8 max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-[120px] h-[80px] md:w-[180px] md:h-[120px] relative mb-4">
          {/* We assume there is a logo.png in the public folder */}
          <img
            src="/logo.png"
            alt="Gopi Misthan Bhandar"
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold font-serif tracking-[0.1em] text-[#503223] uppercase">
          Coming Soon
        </h1>

        <div className="w-16 h-1 bg-[#8B4513] mx-auto rounded-full" />

        <p className="text-lg md:text-xl font-light tracking-wide text-[#5a4e44] font-flama">
          We are currently crafting something sweet for you.
          <br className="hidden md:block" />
          Our new website will be launching very soon.
        </p>

        <div className="pt-12 text-[#8B4513] font-flama-condensed tracking-[0.2em] text-sm uppercase">
          Serving Tradition & Sweetness Since 1968
        </div>
      </div>
    </main>
  );
}