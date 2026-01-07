'use client';

import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import React from 'react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white w-full">
      <Header />
      <Navigation />
      <Cart />

      <section className="w-full py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-brown font-general-sans tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-sm md:text-base font-general-sans mb-6">
              We value your privacy. This policy describes how we collect, use, and protect your information.
            </p>

            <div className="space-y-6 text-gray-700 font-general-sans">
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Information We Collect</h2>
                <p>Contact details, order information, payment confirmations, and browsing activity on our website.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">How We Use Information</h2>
                <p>To process orders, provide support, improve services, and communicate updates or offers.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Data Security</h2>
                <p>We use standard encryption and access controls to protect your data from unauthorized access.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Your Rights</h2>
                <p>You can request data access, corrections, or deletion by contacting support.</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary-brown mb-2">Contact</h2>
                <p>For privacy queries, email info@gopimisthanbhandar.com.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
