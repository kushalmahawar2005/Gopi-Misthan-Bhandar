'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FiPackage, FiShoppingBag, FiCalendar, FiMapPin, FiDollarSign, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shipping: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch orders
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const userId = user?.id || user?.userId;
      const userEmail = user?.email;

      // Try to fetch by userId first, then by email
      let url = '/api/orders';
      if (userId) {
        url += `?userId=${userId}`;
      } else if (userEmail) {
        url += `?email=${encodeURIComponent(userEmail)}`;
      } else {
        setLoadingOrders(false);
        return;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading || loadingOrders) {
    return (
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
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <Cart />

        {/* Page Header */}
        <div className="bg-gradient-to-r from-primary-red to-primary-darkRed py-8 md:py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-white">
              My Orders
            </h1>
            <p className="text-lg text-gray-100 mt-2">
              View your order history and track deliveries
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {orders.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FiPackage className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold font-serif text-gray-800 mb-4">
                No Orders Yet
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-primary-red text-white px-8 py-3 rounded-lg font-bold font-serif text-lg hover:bg-primary-darkRed transition-colors"
              >
                <FiShoppingBag className="w-5 h-5" />
                Start Shopping
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold font-serif text-primary-brown">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiDollarSign className="w-4 h-4" />
                            ₹{order.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <button
                          onClick={() => router.push(`/orders/track?orderNumber=${order.orderNumber}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors text-sm font-medium"
                        >
                          <FiEye className="w-4 h-4" />
                          Track Order
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.image || '/placeholder-product.jpg'}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary-brown">{item.name}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary-red">₹{(item.price * item.quantity).toLocaleString()}</p>
                            <p className="text-sm text-gray-500">₹{item.price.toLocaleString()} each</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-start gap-2 text-sm">
                        <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-700 mb-1">Shipping Address:</p>
                          <p className="text-gray-600">
                            {order.shipping.name}<br />
                            {order.shipping.street}<br />
                            {order.shipping.city}, {order.shipping.state} - {order.shipping.zipCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-semibold capitalize">{order.paymentMethod}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`font-semibold capitalize ${
                        order.paymentStatus === 'paid' ? 'text-green-600' : 
                        order.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}

