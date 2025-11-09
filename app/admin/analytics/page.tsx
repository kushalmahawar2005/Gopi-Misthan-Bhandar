'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiCalendar } from 'react-icons/fi';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    todayRevenue: 0,
    todayOrders: 0,
    thisMonthRevenue: 0,
    thisMonthOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/users'),
        fetch('/api/products'),
      ]);

      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();
      const productsData = await productsRes.json();

      const orders = ordersData.data || [];
      const users = usersData.data || [];
      const products = productsData.data || [];

      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter((order: any) => order.createdAt?.startsWith(today));
      const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + order.total, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthOrders = orders.filter((order: any) => new Date(order.createdAt) >= thisMonth);
      const thisMonthRevenue = thisMonthOrders.reduce((sum: number, order: any) => sum + order.total, 0);

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalProducts: products.length,
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        todayRevenue,
        todayOrders: todayOrders.length,
        thisMonthRevenue,
        thisMonthOrders: thisMonthOrders.length,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Avg Order Value',
      value: `₹${Math.round(stats.avgOrderValue).toLocaleString()}`,
      icon: FiTrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: "Today's Revenue",
      value: `₹${stats.todayRevenue.toLocaleString()}`,
      icon: FiCalendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      label: "Today's Orders",
      value: stats.todayOrders,
      icon: FiShoppingBag,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      label: "This Month's Revenue",
      value: `₹${stats.thisMonthRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-serif">Analytics</h1>
          <p className="text-gray-600 mt-1">View your store's performance metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={card.color} size={24} />
              </div>
              <p className="text-3xl font-bold text-primary-brown mb-1">{card.value}</p>
              <p className="text-sm text-gray-600">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-primary-brown font-serif mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Chart will be implemented here</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-primary-brown font-serif mb-4">Order Trends</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Chart will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

