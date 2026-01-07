'use client';

import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import React from 'react';

export default function RefundCancellationPage() {
  return (
    <main className="min-h-screen bg-white w-full">
      <Header />
      <Navigation />
      <Cart />

      <section className="w-full py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-brown font-general-sans tracking-tight mb-4">
              Refund & Cancellation Policy
            </h1>
            <p className="text-gray-600 text-sm md:text-base font-general-sans mb-6">
              Please review our policy regarding order cancellations, returns, and refunds.
            </p>

            <div className="space-y-6 text-gray-700 font-general-sans">
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Cancellations</h2>
                <p>Orders can be cancelled before dispatch. Once shipped, cancellations are not possible.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Returns</h2>
                <p>Due to the perishable nature of sweets, returns are accepted only for damaged or incorrect items received.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Refunds</h2>
                <p>Approved refunds are processed to the original payment method within 5–7 business days.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">How to Raise a Request</h2>
                <p>Share your order ID, photos of the issue, and details at info@gopimisthanbhandar.com within 24 hours of delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
