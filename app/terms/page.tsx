import React from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <Cart />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-red to-primary-darkRed py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-white">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-100 mt-2">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the Gopi Misthan Bhandar website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-4">2. Products and Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We offer traditional Indian sweets, snacks, and namkeen products. All products are subject to availability. We reserve the right to discontinue any product at any time without notice.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Product images are for illustrative purposes only</li>
              <li>Actual products may vary slightly from images</li>
              <li>Prices are subject to change without prior notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-4">3. Orders and Payment</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you place an order, you are making an offer to purchase products. We reserve the right to accept or decline your order for any reason.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Payment must be made at the time of order placement</li>
              <li>We accept Cash on Delivery (COD), UPI, and Credit/Debit Cards</li>
              <li>All prices are in Indian Rupees (INR)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-4">4. Delivery</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We aim to deliver your orders within 2-3 business days. Delivery times may vary based on your location.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Free shipping on orders above ₹500</li>
              <li>Standard shipping charges apply for orders below ₹500</li>
              <li>We deliver to addresses within India only</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-4">5. Returns and Refunds</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Due to the perishable nature of our products, we have a strict no-return policy. However, if you receive a damaged or incorrect product, please contact us within 24 hours of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-4">6. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Gopi Misthan Bhandar shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our website or products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-serif text-gray-800 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms & Conditions, please contact us at:
            </p>
            <div className="mt-4 text-gray-700">
              <p>Email: info@gopimisthanbhandar.com</p>
              <p>Phone: +91 98765 43210</p>
              <p>Address: Shop No. 123, Main Street, Neemuch, MP 458441</p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-primary-red text-white px-6 py-3 rounded-lg font-bold font-serif hover:bg-primary-darkRed transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

