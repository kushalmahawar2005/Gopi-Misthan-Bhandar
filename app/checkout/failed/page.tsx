'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { FiXCircle, FiRefreshCw, FiHome, FiPhone, FiShoppingBag, FiAlertTriangle, FiHelpCircle } from 'react-icons/fi';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');
  const errorCode = searchParams.get('code');
  const [retrying, setRetrying] = useState(false);

  const getErrorMessage = () => {
    if (reason) return decodeURIComponent(reason);
    switch (errorCode) {
      case 'BAD_REQUEST_ERROR':
        return 'The payment request was invalid. Please try again.';
      case 'GATEWAY_ERROR':
        return 'The payment gateway encountered an error. Please try a different payment method.';
      case 'SERVER_ERROR':
        return 'Our servers encountered an issue. Please try again in a few minutes.';
      default:
        return 'Your payment could not be completed. Don\'t worry, no money has been deducted.';
    }
  };

  const getErrorTitle = () => {
    if (reason?.includes('cancelled')) return 'Payment Cancelled';
    return 'Payment Failed';
  };

  const getErrorIcon = () => {
    if (reason?.includes('cancelled')) {
      return <FiAlertTriangle className="w-10 h-10 md:w-14 md:h-14 text-white" />;
    }
    return <FiXCircle className="w-10 h-10 md:w-14 md:h-14 text-white" />;
  };

  const handleRetryPayment = async () => {
    if (!orderId) {
      router.push('/checkout');
      return;
    }
    setRetrying(true);
    // Redirect to orders page where user can see the pending order
    // and potentially retry payment (or go back to checkout with cart)
    router.push('/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="hidden lg:block"><Header /><Navigation /><Cart /></div>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-[100] bg-white border-b border-gray-100 px-4 py-4">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">{getErrorTitle()}</h1>
        </div>
      </header>

      {/* Error Hero Banner */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 ${reason?.includes('cancelled') ? 'bg-gradient-to-br from-yellow-500 via-amber-600 to-orange-700' : 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700'}`}></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="relative py-12 md:py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${reason?.includes('cancelled') ? 'bg-yellow-400/30' : 'bg-red-400/30'} backdrop-blur-sm flex items-center justify-center mx-auto mb-6`}>
              {getErrorIcon()}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {getErrorTitle()}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-lg mx-auto">
              {getErrorMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-8 -mt-4 relative z-10 pb-12">

        {/* Order Details Card */}
        {orderId && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                  <FiShoppingBag className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order ID</p>
                  <p className="text-lg font-bold text-gray-900">{orderId}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800 mb-1">Your order has been saved</p>
                    <p className="text-sm text-amber-700">
                      Your order is saved with a pending payment status. You can view it in your orders page.
                      {!reason?.includes('cancelled') && ' If any amount was deducted, it will be refunded within 5-7 business days.'}
                    </p>
                  </div>
                </div>
              </div>

              {errorCode && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Error Code</p>
                  <p className="text-sm font-mono text-gray-600">{errorCode}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What You Can Do Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiHelpCircle className="w-5 h-5 text-primary-red" />
              What can you do?
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Try a different payment method</p>
                <p className="text-gray-500 text-sm mt-0.5">If UPI failed, try with a debit/credit card or vice versa</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Check your bank account</p>
                <p className="text-gray-500 text-sm mt-0.5">Ensure you have sufficient balance and no daily limits are exceeded</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Contact your bank</p>
                <p className="text-gray-500 text-sm mt-0.5">If the issue persists, your bank may be blocking the transaction</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm flex-shrink-0">4</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Need help? Contact us</p>
                <p className="text-gray-500 text-sm mt-0.5">Call us or WhatsApp at the number below for immediate assistance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <FiRefreshCw className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Redirecting...' : 'View My Orders'}
          </button>

          <Link
            href="/products"
            className="w-full inline-flex items-center justify-center gap-2 bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all text-center"
          >
            <FiShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-gray-500 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all text-center text-sm"
            >
              <FiHome className="w-4 h-4" />
              Home
            </Link>
            <a
              href="tel:+919876543210"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 px-6 py-3 rounded-xl font-bold hover:bg-green-100 transition-all text-center text-sm"
            >
              <FiPhone className="w-4 h-4" />
              Call Us
            </a>
          </div>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block"><Footer /></div>

      {/* Mobile Bottom Spacer */}
      <div className="lg:hidden h-6"></div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="hidden lg:block"><Header /><Navigation /><Cart /></div>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <div className="hidden lg:block"><Footer /></div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
