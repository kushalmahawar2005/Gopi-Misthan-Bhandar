import React from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import HeroSection from '@/components/HeroSection';
import FeaturedCollection from '@/components/sections/FeaturedCollection';
import AboutSection from '@/components/sections/AboutSection';
import CategoriesSection from '@/components/sections/CategoriesSection';
import ProductSection from '@/components/sections/ProductSection';
import InstagramSection from '@/components/sections/InstagramSection';
import Footer from '@/components/Footer';
import DecorativeBanner from '@/components/DecorativeBanner';
import { featuredProducts, categories, instagramPosts, getClassicProducts, getPremiumProducts } from '@/lib/data';

export default function Home() {
  // Get classic and premium products
  const classicProducts = getClassicProducts();
  const premiumProducts = getPremiumProducts();

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />
      <HeroSection />
      
      <div id="featured">
        <FeaturedCollection products={featuredProducts.slice(0, 8)} />
      </div>
      
      <div id="about">
        <AboutSection />
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
          title="CLASSIC SWEETS"
          subtitle="Traditional sweets made with authentic recipes"
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
        title="PREMIUM SWEETS"
        subtitle="Premium quality sweets for special occasions"
        products={premiumProducts}
        bgColor="beige"
      />
      
      <InstagramSection posts={instagramPosts} />
      
      <Footer />
    </main>
  );
}
