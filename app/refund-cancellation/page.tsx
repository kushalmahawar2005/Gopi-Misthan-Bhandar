'use client';

import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import React from 'react';

export default function RefundCancellationPage() {
  return (
    <main className="min-h-screen w-full">
      <Header />
      <Navigation />
      <Cart />

      <section className="w-full py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-brown font-general-sans tracking-tight mb-4">
              Refund, Return & Cancellation Policy
            </h1>
            <p className="text-gray-600 text-sm md:text-base font-general-sans mb-6">
              As our products are freshly prepared and fall under the category of perishable food items,
              we follow a strict No Return Policy. However, customer satisfaction remains our top priority.
            </p>

            <div className="space-y-6 text-gray-700 font-general-sans">
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">1. Order Cancellation</h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Orders can be cancelled free of charge within 1 hour of placement, provided the order has not been dispatched or processing has not begun.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">2. Damaged or Incorrect Items</h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>If you receive a damaged, defective, or incorrect product, please share clear unboxing photos and videos within 12 hours of delivery.</li>
                  <li>After verification, we will arrange a suitable replacement or resolution.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">3. Refund Eligibility</h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Refunds are not applicable for personal taste preferences.</li>
                  <li>Refunds will not be issued for delays caused by incorrect shipping details, courier-related delays, natural calamities, or recipient unavailability at the time of delivery.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">4. Quality Assurance</h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>All products are packed and dispatched only after quality checks to ensure freshness and hygiene.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Need Help?</h2>
                <p>For any concerns or assistance, please contact us via WhatsApp or Email at info@gopimisthanbhandar.com. Our team will be happy to help.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
