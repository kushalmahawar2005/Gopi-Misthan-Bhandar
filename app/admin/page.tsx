'use client';

import React, { useEffect, useState } from 'react';
import {
  FiPackage,
  FiFolder,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
  FiAlertTriangle,
  FiGift,
  FiEye,
  FiImage,
  FiFile,
  FiInstagram,
  FiSettings,
  FiEdit,
} from 'react-icons/fi';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
    avgOrderValue: 0,
    lowStockItems: 0,
    couponUses: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes, usersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/orders'),
        fetch('/api/users'),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();

      const totalRevenue = ordersData.data?.reduce((sum: number, order: any) => sum + order.total, 0) || 0;
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = ordersData.data?.filter((order: any) =>
        order.createdAt?.startsWith(today)
      ).length || 0;
      const todayRevenue =
        ordersData.data
          ?.filter((order: any) => order.createdAt?.startsWith(today))
          .reduce((sum: number, order: any) => sum + order.total, 0) || 0;
      const avgOrderValue = ordersData.data?.length > 0 ? totalRevenue / ordersData.data.length : 0;

      setStats({
        products: productsData.data?.length || 0,
        categories: categoriesData.data?.length || 0,
        orders: ordersData.data?.length || 0,
        users: usersData.data?.length || 0,
        revenue: totalRevenue,
        todayOrders,
        todayRevenue,
        avgOrderValue: Math.round(avgOrderValue),
        lowStockItems: 0,
        couponUses: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const metricCards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: FiCalendar, color: 'text-blue-600' },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'text-green-600' },
    { label: 'Avg Order Value', value: `₹${stats.avgOrderValue.toLocaleString()}`, icon: FiTrendingUp, color: 'text-purple-600' },
    { label: 'Low Stock Items', value: stats.lowStockItems, icon: FiAlertTriangle, color: 'text-red-600', highlight: stats.lowStockItems > 0 },
    { label: 'Coupon Uses', value: stats.couponUses, icon: FiGift, color: 'text-yellow-600' },
  ];

  const quickActions = [
    { label: 'Add Product', icon: FiPackage, href: '/admin/products/new', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { label: 'Hero Slider', icon: FiImage, href: '/admin/hero-slider', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
    { label: 'About Us', icon: FiEdit, href: '/admin/about-us', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { label: 'Shop Now', icon: FiShoppingBag, href: '/admin/products', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { label: 'Add Blog', icon: FiFile, href: '/admin/blog/new', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
    { label: 'Categories', icon: FiFolder, href: '/admin/categories', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
    { label: 'InstaBook', icon: FiEye, href: '/admin/instabook', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
    { label: 'InstaPost', icon: FiInstagram, href: '/admin/instapost', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
    { label: 'Add Coupon', icon: FiGift, href: '/admin/coupons/new', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
    { label: 'User Roles', icon: FiUsers, href: '/admin/users', color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' },
  ];

  const contentCards = [
    {
      title: 'Hero Slider',
      icon: FiImage,
      stats: ['Active Slides: 4', 'Auto-play: Enabled'],
      action: { label: '+ Add New Slide', href: '/admin/hero-slider/new' },
      manage: { href: '/admin/hero-slider' },
    },
    {
      title: 'Featured Categories',
      icon: FiFolder,
      stats: [`Total Categories: ${stats.categories}`, 'Slider Speed: 3s'],
      action: { label: '+ Add Category', href: '/admin/categories/new' },
      manage: { href: '/admin/categories' },
    },
    {
      title: 'Blog Posts',
      icon: FiFile,
      stats: ['Published: 4', 'Draft: 0'],
      action: { label: '+ New Blog Post', href: '/admin/blog/new' },
      manage: { href: '/admin/blog' },
    },
    {
      title: 'InstaBook',
      icon: FiEye,
      stats: ['Active Items: 5', 'Auto-play: Enabled'],
      action: { label: '+ Add Item', href: '/admin/instabook/new' },
      manage: { href: '/admin/instabook' },
    },
    {
      title: 'InstaPost',
      icon: FiInstagram,
      stats: ['Active Posts: 4', 'Grid Display'],
      action: { label: '+ Add Post', href: '/admin/instapost/new' },
      manage: { href: '/admin/instapost' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-brown font-geom">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 font-geom">Monitor your store's performance</p>
        </div>
        <Link
          href="/admin/settings"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium w-full sm:w-auto"
        >
          <FiSettings size={18} />
          <span>Settings</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={card.color} size={20} />
              </div>
              <p className="text-2xl font-bold text-primary-brown mb-1">{card.value}</p>
              <p className="text-xs text-gray-600">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-brown font-geom mb-4">+ Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className={`${action.color} rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors border border-transparent hover:border-gray-200`}
              >
                <Icon size={24} />
                <span className="text-sm font-medium text-center">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary-brown font-geom">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-sm text-primary-red hover:underline font-medium"
            >
              View All
            </Link>
          </div>
          <p className="text-gray-500 text-sm">No recent orders</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary-brown font-geom">Low Stock Alert</h3>
            <Link
              href="/admin/products"
              className="text-sm text-primary-red hover:underline font-medium"
            >
              Manage Stock
            </Link>
          </div>
          <p className="text-gray-500 text-sm">No low stock items</p>
        </div>
      </div>

      {/* Content Management Cards */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-brown font-geom mb-4">Content Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="text-primary-red" size={20} />
                    <h3 className="text-lg font-semibold text-primary-brown font-geom">{card.title}</h3>
                  </div>
                  <Link
                    href={card.manage.href}
                    className="text-primary-red hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    <FiEdit size={14} />
                    Manage
                  </Link>
                </div>
                <div className="space-y-2 mb-4">
                  {card.stats.map((stat, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      {stat}
                    </p>
                  ))}
                </div>
                <Link
                  href={card.action.href}
                  className="block w-full text-center px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors text-sm font-medium"
                >
                  {card.action.label}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
