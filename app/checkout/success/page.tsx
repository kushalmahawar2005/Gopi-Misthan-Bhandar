'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import Image from 'next/image';
import { FiCheckCircle, FiShoppingBag, FiHome, FiPackage } from 'react-icons/fi';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    // Get order data from localStorage
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      try {
        setOrderData(JSON.parse(lastOrder));
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    } else if (!orderId) {
      // Redirect to home if no order data
      router.push('/');
    }
  }, [orderId, router]);

  if (!orderData && !orderId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <Navigation />
        <Cart />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <p className="text-xl text-gray-600 mb-4">No order found</p>
          <Link
            href="/"
            className="bg-primary-red text-white px-6 py-3 rounded-lg font-bold font-general-sansal-sansal-sans hover:bg-primary-darkRed transition-colors"
          >
            Go to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const displayOrderId = orderId || orderData?.orderId || 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <Cart />

      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FiCheckCircle className="w-20 h-20 md:w-24 md:h-24 text-white mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-general-sansal-sansal-sans text-white mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-2">
            Thank you for your order
          </p>
          <p className="text-base text-white/80">
            Order ID: <span className="font-bold">{displayOrderId}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold font-general-sansal-sansal-sans mb-6 flex items-center gap-2">
            <FiPackage className="w-6 h-6 text-primary-red" />
            Order Details
          </h2>

          {orderData && (
            <>
              {/* Shipping Address */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold font-general-sansal-sansal-sans mb-3">Shipping Address</h3>
                <div className="text-gray-700">
                  <p className="font-medium">
                    {orderData.shipping.firstName} {orderData.shipping.lastName}
                  </p>
                  <p>{orderData.shipping.address}</p>
                  {orderData.shipping.landmark && <p>{orderData.shipping.landmark}</p>}
                  <p>
                    {orderData.shipping.city}, {orderData.shipping.state} - {orderData.shipping.pincode}
                  </p>
                  <p className="mt-2">Phone: {orderData.shipping.phone}</p>
                  <p>Email: {orderData.shipping.email}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold font-general-sansal-sansal-sans mb-4">Order Items</h3>
                <div className="space-y-4">
                  {orderData.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-general-sansal-sansal-sans font-medium mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Quantity: {item.quantity} × ₹{item.price}
                        </p>
                        <p className="text-primary-red font-bold">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Total */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold font-general-sansal-sansal-sans mb-3">Payment Method</h3>
                  <p className="text-gray-700 capitalize">
                    {orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                     orderData.paymentMethod === 'upi' ? 'UPI Payment' : 
                     'Debit/Credit Card'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-general-sansal-sansal-sans mb-3">Order Summary</h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{orderData.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>
                        {orderData.shippingCost === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `₹${orderData.shippingCost}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (GST 5%):</span>
                      <span>₹{orderData.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold font-general-sansal-sansal-sans pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span className="text-primary-red">₹{orderData.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold font-general-sansal-sansal-sans mb-4">What's Next?</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-red text-white flex items-center justify-center font-bold flex-shrink-0 mt-1">
                1
              </div>
              <div>
                <p className="font-medium mb-1">Order Confirmation</p>
                <p className="text-sm text-gray-600">
                  You will receive an email confirmation shortly at {orderData?.shipping.email || 'your email'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-red text-white flex items-center justify-center font-bold flex-shrink-0 mt-1">
                2
              </div>
              <div>
                <p className="font-medium mb-1">Order Processing</p>
                <p className="text-sm text-gray-600">
                  We will prepare your order and update you with tracking information
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-red text-white flex items-center justify-center font-bold flex-shrink-0 mt-1">
                3
              </div>
              <div>
                <p className="font-medium mb-1">Delivery</p>
                <p className="text-sm text-gray-600">
                  Your order will be delivered within 2-3 business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-primary-red text-white px-8 py-4 rounded-lg font-bold font-general-sansal-sansal-sans text-lg hover:bg-primary-darkRed transition-colors"
          >
            <FiShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary-red border-2 border-primary-red px-8 py-4 rounded-lg font-bold font-general-sansal-sansal-sans text-lg hover:bg-gray-50 transition-colors"
          >
            <FiHome className="w-5 h-5" />
            Go to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
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
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

