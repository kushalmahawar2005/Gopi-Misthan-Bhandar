import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { FiHome, FiShoppingBag, FiSearch } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <Cart />

      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-9xl font-bold font-serif text-primary-red mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary-red text-white px-8 py-3 rounded-lg font-bold font-serif text-lg hover:bg-primary-darkRed transition-colors"
            >
              <FiHome className="w-5 h-5" />
              Go to Home
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-primary-red text-primary-red px-8 py-3 rounded-lg font-bold font-serif text-lg hover:bg-primary-red hover:text-white transition-colors"
            >
              <FiShoppingBag className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

