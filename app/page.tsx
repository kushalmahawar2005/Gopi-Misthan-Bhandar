'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import { fetchProducts, fetchCategories, fetchInstaBooks, fetchInstaPosts, fetchGallery, fetchBlogs } from '@/lib/api';
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
const PurityBanner = dynamic(() => import('@/components/sections/PurityBanner'));
const NewsletterSection = dynamic(() => import('@/components/sections/NewsletterSection'));

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [classicProducts, setClassicProducts] = useState<Product[]>([]);
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instaBooks, setInstaBooks] = useState<InstagramPost[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  // loading state is kept for data fetching logic but not used to block UI
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Optimized: Fetch only what we need, avoid duplicate calls
      const [featured, categoriesData, classicFlagged, premiumFlagged, allProducts, instaBooksData, galleryData, blogsData] = await Promise.all([
        fetchProducts({ featured: true, limit: 8 }),
        fetchCategories(),
        fetchProducts({ isClassic: true, limit: 8 }),
        fetchProducts({ isPremium: true, limit: 8 }),
        fetchProducts(), // Fetch all products to count by category
        fetchInstaBooks(),
        fetchGallery(),
        fetchBlogs(),
      ]);

      setFeaturedProducts(featured);

      // Calculate product counts for each category (including subcategories)
      const categoriesWithCounts = categoriesData.map((category) => {
        // Get all subcategory slugs for this category
        const subCategorySlugs = category.subCategories?.map((sub) => sub.slug) || [];
        // Include the category itself and all its subcategories
        const relevantSlugs = [category.slug, ...subCategorySlugs];

        // Count products that match any of these slugs
        const count = allProducts.filter((product) =>
          relevantSlugs.includes(product.category) || 
          (product.subcategory && relevantSlugs.includes(product.subcategory))
        ).length;

        return {
          ...category,
          productsCount: count,
        };
      });

      setCategories(categoriesWithCounts);

      // Filter Classic/Premium products - prefer sweets category but show all if none found
      const sweetsCategory = categoriesWithCounts.find((c) => c.slug === 'sweets');
      const defaultSweetsSubs = ['classic-sweets', 'premium-sweets'];
      const sweetsSlugs = sweetsCategory
        ? Array.from(new Set([sweetsCategory.slug, ...(sweetsCategory.subCategories?.map((s: any) => s.slug) || []), ...defaultSweetsSubs]))
        : ['sweets', ...defaultSweetsSubs];
      const isSweetCategory = (slug: string | undefined) => !!slug && /sweet/i.test(slug);

      // Filter classic products - prefer sweets but show all if no sweets found
      let classicFiltered = classicFlagged.filter((p) => 
        sweetsSlugs.includes(p.category) || 
        (p.subcategory && sweetsSlugs.includes(p.subcategory)) ||
        isSweetCategory(p.category) ||
        isSweetCategory(p.subcategory)
      );
      if (classicFiltered.length === 0) {
        // If no sweets found, show all classic products
        classicFiltered = classicFlagged;
      }

      // Filter premium products - prefer sweets but show all if no sweets found
      let premiumFiltered = premiumFlagged.filter((p) => 
        sweetsSlugs.includes(p.category) || 
        (p.subcategory && sweetsSlugs.includes(p.subcategory)) ||
        isSweetCategory(p.category) ||
        isSweetCategory(p.subcategory)
      );
      if (premiumFiltered.length === 0) {
        // If no sweets found, show all premium products
        premiumFiltered = premiumFlagged;
      }

      setClassicProducts(classicFiltered.slice(0, 8));
      setPremiumProducts(premiumFiltered.slice(0, 8));

      setInstaBooks(instaBooksData);
      setGalleryItems(galleryData);
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full relative">
      <Header />
      <Navigation />
      <Cart />
      <HeroSection />

      {/* Promotional Banner removed as requested */}
      {/* <PromotionalBanner /> */}
      {featuredProducts.length > 0 && (
        <ScrollAnimation delay={100}>
          <div id="featured">
            <FeaturedCollection products={featuredProducts.slice(0, 8)} />
          </div>
        </ScrollAnimation>
      )}

      {categories.length > 0 && (
        <ScrollAnimation delay={150}>
          <div id="categories">
            <CategoriesSection categories={categories} />
          </div>
        </ScrollAnimation>
      )}

      {classicProducts.length > 0 && (
        <ScrollAnimation delay={200}>
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
        <ScrollAnimation delay={200}>
          <ProductSection
            title="Premium Sweets"
            subtitle="The Luxury Signature Collection"
            products={premiumProducts}
            viewMoreLink="/products?category=sweets"
          />
        </ScrollAnimation>
      )}

      {/* Purity Guarantee Marquee */}
      <PurityBanner />

      <ScrollAnimation delay={150}>
        <div id="about">
          <AboutSection />
        </div>
      </ScrollAnimation>

      {/* Repurposed Gift Box Section - Showing Gifting Subcategories */}
      <ScrollAnimation delay={200}>
        <div id="gifting">
          <GiftBoxSection />
        </div>
      </ScrollAnimation>


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

      {/* InstaPostSection removed as per request */}

      {/* MapSection removed as per request, moved to Footer */}

      {blogs.length > 0 && (
        <ScrollAnimation delay={200}>
          <BlogSection blogs={blogs} />
        </ScrollAnimation>
      )}

      {/* Newsletter - Become A GOPI Insider */}
      <ScrollAnimation delay={150}>
        <NewsletterSection />
      </ScrollAnimation>

      <Footer />
    </main>
  );
}