'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  FiHome,
  FiPackage,
  FiFolder,
  FiShoppingBag,
  FiUsers,
  FiLogOut,
  FiMenu,
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiSettings,
  FiImage,
  FiTrendingUp,
  FiFile,
  FiBarChart2,
  FiGift,
  FiBox,
  FiEye,
  FiInstagram,
  FiGrid,
  FiStar,
  FiTruck,
  FiHeart,
  FiType,
} from 'react-icons/fi';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect if not admin
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const mainMenuItems = [
    { href: '/admin', icon: FiHome, label: 'Dashboard' },
    { href: '/admin/products', icon: FiPackage, label: 'Products' },
    { href: '/admin/products/bulk', icon: FiPackage, label: 'Bulk Operations' },
    { href: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    { href: '/admin/wedding-enquiries', icon: FiHeart, label: 'Wedding Enquiries' },
    { href: '/admin/users', icon: FiUsers, label: 'Users' },
    { href: '/admin/categories', icon: FiFolder, label: 'Categories' },
    { href: '/admin/inventory', icon: FiBox, label: 'Inventory' },
    { href: '/admin/coupons', icon: FiGift, label: 'Coupons' },
    { href: '/admin/delivery', icon: FiTruck, label: 'Delivery' },
    { href: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
    { href: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  const contentMenuItems = [
    { href: '/admin/hero-slider', icon: FiImage, label: 'Hero Slider' },
    { href: '/admin/about-us', icon: FiType, label: 'About Us' },
    { href: '/admin/site-content', icon: FiType, label: 'Offer Line' },
    { href: '/admin/featured', icon: FiTrendingUp, label: "What's Trending" },
    { href: '/admin/blog', icon: FiFile, label: 'Blog Posts' },
    { href: '/admin/giftbox', icon: FiGift, label: 'Gift Box' },
    { href: '/admin/instabook', icon: FiEye, label: 'InstaBook' },
    { href: '/admin/instapost', icon: FiInstagram, label: 'InstaPost' },
    { href: '/admin/gallery', icon: FiGrid, label: 'Gallery' },
    { href: '/admin/reviews', icon: FiStar, label: 'Reviews' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm font-geom">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiMenu size={20} />
          </button>
          <Link
            href="/"
            className="flex items-center gap-1 md:gap-2 text-gray-700 hover:text-primary-red transition-colors text-xs md:text-sm font-medium font-geom"
          >
            <FiArrowLeft size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="hidden sm:inline">Back to Store</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="text-lg md:text-2xl font-bold text-primary-brown font-geom">Admin Panel</div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-xs md:text-sm text-gray-600 hidden lg:block font-geom">Welcome, {user.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 hover:text-primary-red transition-colors font-geom"
          >
            <span className="hidden sm:inline">Logout</span>
            <FiArrowRight size={14} className="md:w-4 md:h-4" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:static md:translate-x-0 z-50 w-64 bg-white border-r border-gray-200 h-[calc(100vh-73px)] transition-transform duration-300 overflow-y-auto shadow-sm`}
        >
          {/* Mobile Menu Button */}
          <div className="md:hidden p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary-brown font-geom">Admin Panel</h2>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-700">
              {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          <nav className="p-4 font-geom">
            {/* MAIN Section */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 font-geom">
                MAIN
              </h3>
              <div className="space-y-1">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-geom ${
                        active
                          ? 'bg-primary-red text-white'
                          : 'text-gray-700 hover:bg-red-50 hover:text-primary-red'
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium font-geom">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CONTENT MANAGEMENT Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 font-geom">
                CONTENT MANAGEMENT
              </h3>
              <div className="space-y-1">
                {contentMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-geom ${
                        active
                          ? 'bg-primary-red text-white'
                          : 'text-gray-700 hover:bg-red-50 hover:text-primary-red'
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium font-geom">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-73px)] p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 overflow-x-hidden font-geom">
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
