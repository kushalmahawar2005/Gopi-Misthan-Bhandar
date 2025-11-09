'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FiPackage, FiShoppingBag } from 'react-icons/fi';
import Link from 'next/link';

export default function OrdersPage() {
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
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-white">
              My Orders
            </h1>
            <p className="text-lg text-gray-100 mt-2">
              View your order history and track deliveries
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiPackage className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-4">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary-red text-white px-8 py-3 rounded-lg font-bold font-serif text-lg hover:bg-primary-darkRed transition-colors"
            >
              <FiShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}

