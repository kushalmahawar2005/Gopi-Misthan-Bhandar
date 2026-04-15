'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import Image from 'next/image';
import { FiCheckCircle, FiShoppingBag, FiHome, FiPackage, FiMapPin, FiCreditCard, FiTruck, FiCopy, FiClipboard } from 'react-icons/fi';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const paymentIdParam = searchParams.get('paymentId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    // Prevent double-fetch in React strict mode
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchOrder();
  }, [orderId, router]);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Fetch by orderNumber — we need to search via the orders API
      const resp = await fetch(`/api/orders?orderNumber=${orderId}`);
      const data = await resp.json();

      if (data.success && data.data) {
        // The API returns an array, find our specific order
        const found = Array.isArray(data.data)
          ? data.data.find((o: any) => o.orderNumber === orderId)
          : data.data;

        if (found) {
          setOrder(found);
        } else {
          setError('Order not found');
        }
      } else {
        setError('Could not load order details');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Network error. Your order was placed successfully, but we could not load the details right now.');
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'upi': return 'UPI / GPay / PhonePe';
      case 'card': return 'Debit / Credit Card';
      case 'cod': return 'Cash on Delivery';
      default: return method?.toUpperCase() || 'Online';
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="hidden lg:block"><Header /><Navigation /><Cart /></div>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 animate-spin"></div>
              <FiCheckCircle className="absolute inset-0 m-auto w-8 h-8 text-green-500 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verifying your payment...</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your order</p>
          </div>
        </div>
        <div className="hidden lg:block"><Footer /></div>
      </div>
    );
  }

  // Error State (but payment likely went through)
  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="hidden lg:block"><Header /><Navigation /><Cart /></div>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Order Placed!</h2>
            <p className="text-gray-600 mb-2">{error}</p>
            {orderId && (
              <p className="text-sm text-gray-500 mb-6">Your Order ID: <span className="font-bold text-gray-800">{orderId}</span></p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/orders" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
                View My Orders
              </Link>
              <Link href="/" className="px-6 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-all">
                Go Home
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden lg:block"><Footer /></div>
      </div>
    );
  }

  // Success State
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="hidden lg:block"><Header /><Navigation /><Cart /></div>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-[100] bg-white border-b border-gray-100 px-4 py-4">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">Order Confirmed</h1>
        </div>
      </header>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                opacity: 0,
                animation: `confettiFall ${2 + Math.random() * 3}s ease-out ${Math.random() * 1.5}s forwards`,
              }}
            >
              <div
                className="w-2 h-2 md:w-3 md:h-3 rounded-sm"
                style={{
                  backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
          <style jsx>{`
            @keyframes confettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Success Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="relative py-12 md:py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 animate-[scaleIn_0.5s_ease-out]">
              <FiCheckCircle className="w-10 h-10 md:w-14 md:h-14 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              Payment Successful!
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-4">
              Thank you for your order. We&apos;re preparing your sweets!
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5">
              <span className="text-white/80 text-sm">Order ID:</span>
              <span className="text-white font-bold">{orderId}</span>
              <button
                onClick={copyOrderId}
                className="ml-1 text-white/70 hover:text-white transition-colors"
                title="Copy Order ID"
              >
                {copied ? <FiClipboard className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-4 relative z-10 pb-12">

        {/* Payment Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
              <FiCreditCard className="w-5 h-5" />
              Payment Details
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Amount Paid</p>
                <p className="text-xl font-black text-gray-900">₹{order?.total?.toLocaleString() || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Mode</p>
                <p className="text-sm font-bold text-gray-900">{getPaymentMethodLabel(order?.paymentMethod)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Status</p>
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${order?.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${order?.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                  {order?.paymentStatus === 'paid' ? 'Paid' : 'Processing'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment ID</p>
                <p className="text-xs font-bold text-gray-700 break-all">{paymentIdParam || order?.paymentId || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Card */}
        {order?.items && order.items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FiPackage className="w-5 h-5 text-primary-red" />
                Order Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                    <Image
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Qty: {item.quantity} {item.weight && `• ${item.weight}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">₹{item.price.toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Order Summary */}
            <div className="bg-gray-50 px-6 py-4 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold">₹{order.subtotal?.toLocaleString() || '—'}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="font-bold">
                  {(order.shippingCost || 0) === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${order.shippingCost?.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2.5 border-t border-gray-200">
                <span>Total</span>
                <span className="text-green-600">₹{order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Shipping & Order Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
              <FiMapPin className="w-4 h-4 text-primary-red" />
              Delivery Address
            </h3>
            {order?.shipping && (
              <div className="text-gray-600 space-y-1 text-sm">
                <p className="font-bold text-gray-900">{order.shipping.name}</p>
                <p>{order.shipping.street}</p>
                <p>{order.shipping.city}, {order.shipping.state} - {order.shipping.zipCode}</p>
                <p className="pt-2 text-gray-500">📞 {order.shipping.phone}</p>
                <p className="text-gray-500">✉️ {order.shipping.email}</p>
              </div>
            )}
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
              <FiTruck className="w-4 h-4 text-primary-red" />
              Order Timeline
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Order Placed', desc: formatDate(order?.createdAt || new Date().toISOString()), done: true },
                { label: 'Payment Confirmed', desc: 'Your payment has been received', done: order?.paymentStatus === 'paid' },
                { label: 'Processing', desc: 'We are preparing your order', done: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order?.status) },
                { label: 'Shipped', desc: order?.awbNumber ? `AWB: ${order.awbNumber}` : 'Will be shipped soon', done: ['shipped', 'delivered', 'in_transit'].includes(order?.status) },
                { label: 'Delivered', desc: 'Enjoy your sweets!', done: order?.status === 'delivered' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      step.done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.done ? '✓' : idx + 1}
                    </div>
                    {idx < 4 && (
                      <div className={`w-0.5 h-5 mt-1 ${step.done ? 'bg-green-300' : 'bg-gray-100'}`}></div>
                    )}
                  </div>
                  <div className="-mt-0.5">
                    <p className={`text-sm font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's Next Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📦 What happens next?</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
              You will receive a confirmation email at <strong>{order?.shipping?.email || 'your email'}</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
              An SMS with tracking details will be sent to <strong>{order?.shipping?.phone || 'your phone'}</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
              You can track your order anytime from the <Link href="/orders" className="text-primary-red font-bold underline">My Orders</Link> page
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl"
          >
            <FiPackage className="w-5 h-5" />
            Track My Order
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
          >
            <FiShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-500 border border-gray-200 px-6 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
          >
            <FiHome className="w-5 h-5" />
            Home
          </Link>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block"><Footer /></div>

      {/* Mobile Bottom Spacer */}
      <div className="lg:hidden h-6"></div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="hidden lg:block"><Header /><Navigation /><Cart /></div>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
        <div className="hidden lg:block"><Footer /></div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
