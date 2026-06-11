'use client';

import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import React from 'react';

export default function TermsPage() {
  return (
    <main className="min-h-screen w-full">
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
              <ol className="list-decimal pl-5 space-y-3">
                <li>All prices displayed on the website are inclusive of applicable taxes. A GST invoice can be provided upon request.</li>
                <li>Product weights mentioned are approximate gross packed weights, including packaging. A minor variation of up to ±5% may occur in sweets, namkeen, and savoury items.</li>
                <li>Product images are for representation purposes. While we strive to maintain consistency, slight variations in appearance, colour, or packaging may occur.</li>
                <li>Delivery is available only to serviceable PIN codes. Estimated delivery timelines are indicative and may be affected by weather conditions, festivals, public holidays, or courier-related delays.</li>
                <li>By placing an order, you confirm that the recipient will be available to receive the parcel at the provided delivery address.</li>
                <li>Customers are responsible for providing accurate shipping details. We shall not be liable for delays, losses, or additional charges arising from incorrect or incomplete information.</li>
                <li>Once an order has been dispatched, modifications to the delivery address or order contents may not be possible.</li>
                <li>We reserve the right to refuse, cancel, or limit any order in case of pricing errors, stock unavailability, suspected fraud, or unforeseen circumstances.</li>
                <li>By using this website and placing an order, you agree to these Terms &amp; Conditions and all related policies.</li>
              </ol>
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
