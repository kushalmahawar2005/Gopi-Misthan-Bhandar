'use client';

import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import React from 'react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white w-full">
      <Header />
      <Navigation />
      <Cart />

      <section className="w-full py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-brown font-general-sans tracking-tight mb-4">
              Terms & Conditions
            </h1>
            <p className="text-gray-600 text-sm md:text-base font-general-sans mb-6">
              By using this website and purchasing our products, you agree to the following terms.
            </p>

            <div className="space-y-6 text-gray-700 font-general-sans">
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Orders</h2>
                <p>All orders are subject to availability and confirmation. We may cancel or refund where necessary.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Pricing</h2>
                <p>Prices may change without prior notice. Final price is confirmed at checkout.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Delivery</h2>
                <p>Estimated delivery timelines are indicative and may vary due to logistics or location.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Use of Content</h2>
                <p>Website content, images, and branding are owned by Gopi Misthan Bhandar and cannot be reused without permission.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Contact</h2>
                <p>For support, reach us at info@gopimisthanbhandar.com.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
