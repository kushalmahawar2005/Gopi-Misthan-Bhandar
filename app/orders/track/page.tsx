'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiSearch } from 'react-icons/fi';
import Image from 'next/image';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shipping: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: FiPackage },
  { key: 'processing', label: 'Processing', icon: FiClock },
  { key: 'shipped', label: 'Shipped', icon: FiTruck },
  { key: 'delivered', label: 'Delivered', icon: FiCheckCircle },
];

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/orders`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const foundOrder = data.data.find((o: Order) => o.orderNumber === orderNumber.toUpperCase());
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found. Please check your order number.');
          setOrder(null);
        }
      } else {
        setError('Error fetching order. Please try again.');
        setOrder(null);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      setError('Error tracking order. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: OrderStatus): number => {
    const index = statusSteps.findIndex(step => step.key === status);
    return index >= 0 ? index : 0;
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'delivered':
        return 'text-green-600';
      case 'shipped':
        return 'text-blue-600';
      case 'processing':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />

      <div className="bg-gradient-to-br from-red-700 to-red-800 py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
            Track Your Order
          </h1>
          <p className="text-white/80">
            Enter your order number to check the latest status
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Search Form */}
        <form onSubmit={handleTrack} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="Enter Order Number (e.g., ORD-12345)"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-red-700 text-white rounded-md font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>
          {error && (
            <p className="text-red-600 mt-2 text-sm">{error}</p>
          )}
        </form>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold font-general-sansal-sansal-sans mb-6">Order Status</h2>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                <div className="space-y-8">
                  {statusSteps.map((step, index) => {
                    const currentIndex = getStatusIndex(order.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                          isCompleted
                            ? 'bg-primary-red border-primary-red text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <Icon size={20} />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className={`font-bold text-lg ${
                            isCurrent ? getStatusColor(order.status) : isCompleted ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </h3>
                          {isCurrent && order.status !== 'cancelled' && (
                            <p className="text-sm text-gray-600 mt-1">
                              Your order is currently {order.status}
                            </p>
                          )}
                          {order.status === 'cancelled' && step.key === 'pending' && (
                            <p className="text-sm text-red-600 mt-1">Order has been cancelled</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Order Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold font-general-sansal-sansal-sans mb-4">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-semibold">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-semibold">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold uppercase">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-lg font-bold text-primary-red">₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold font-general-sansal-sansal-sans mb-4">Shipping Address</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold">{order.shipping.name}</p>
                  <p>{order.shipping.street}</p>
                  <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}</p>
                  <p className="pt-2">Phone: {order.shipping.phone}</p>
                  <p>Email: {order.shipping.email}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold font-general-sansal-sansal-sans mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary-brown mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-primary-red font-bold mt-1">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!order && !loading && !error && (
          <div className="text-center py-16">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Enter an order number to track your order</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}

