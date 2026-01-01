'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductCard from '@/components/ProductCard';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist, getWishlistCount } = useWishlist();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
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
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <Cart />

        {/* Page Header */}
        <div className="bg-gradient-to-r from-primary-red to-primary-darkRed py-8 md:py-12 px-4">
          <div className="max-w-7xl text-center mx-auto">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-[500] font-general-sans text-white">
                  My Wishlist
                </h1>
                <p className="text-lg text-gray-100 mt-2">
                  {getWishlistCount()} {getWishlistCount() === 1 ? 'item' : 'items'} saved
                </p>
              </div>
              {wishlistItems.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 className="w-5 h-5" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {wishlistItems.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FiHeart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-[500] font-general-sans text-gray-800 mb-4">
                Your Wishlist is Empty
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start adding your favorite products to your wishlist. You can save items for later and purchase them anytime.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-primary-red text-white px-8 py-3 rounded-lg font-[450] font-general-sans text-lg hover:bg-primary-darkRed transition-colors"
              >
                <FiShoppingBag className="w-5 h-5" />
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Wishlist Items */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
                {wishlistItems.map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard product={product} />
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 z-10 w-10 h-10 bg-white hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                      aria-label="Remove from wishlist"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-12 text-center">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white border-2 border-primary-red text-primary-red px-8 py-3 rounded-lg font-bold font-general-sansal-sansal-sans text-lg hover:bg-primary-red hover:text-white transition-colors"
                >
                  <FiShoppingBag className="w-5 h-5" />
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}

