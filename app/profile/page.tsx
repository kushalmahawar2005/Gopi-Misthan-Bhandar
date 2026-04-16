'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit2, 
  FiSave, 
  FiX,
  FiLogOut,
  FiShoppingBag,
  FiPackage,
  FiHeart
} from 'react-icons/fi';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser, isAuthenticated, isLoading } = useAuth();
  const { getWishlistCount } = useWishlist();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [ordersCount, setOrdersCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  // Fetch orders count
  useEffect(() => {
    if (user) {
      fetchOrdersCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrdersCount = async () => {
    try {
      const userId = user?.id || user?.userId;
      const userEmail = user?.email;

      // Try to fetch by userId first, then by email
      let url = '/api/orders';
      if (userId) {
        url += `?userId=${userId}`;
      } else if (userEmail) {
        url += `?email=${encodeURIComponent(userEmail)}`;
      } else {
        return;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data) {
        const orders = data.data || [];
        setOrdersCount(orders.length);
        setPendingOrdersCount(orders.filter((o: any) => 
          ['pending', 'processing', 'shipped'].includes(o.status?.toLowerCase())
        ).length);
      }
    } catch (error) {
      console.error('Error fetching orders count:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveMessage('');

    try {
      const result = await updateUser(formData);
      if (!result.success) {
        setSaveMessage(result.error || 'Error updating profile');
        return;
      }

      setSaveMessage('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error updating profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
    setIsEditing(false);
    setSaveMessage('');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] font-sans">
      <Header />
      <Navigation />
      <Cart />

      <div className="max-w-6xl lg:max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-20">
        
        {/* Back Button */}
        <div className="flex justify-start mb-6 md:mb-2">
          <button onClick={() => router.push('/')} className="inline-flex items-center justify-center gap-2 text-[#503223]/60 hover:text-[#FE8E02] transition-colors text-[11px] font-flama tracking-[0.2em] uppercase cursor-pointer">
            <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Home Page
          </button>
        </div>
        
        {/* Page Title */}
        <div className="text-center mb-12">
          <p className="text-[12px] md:text-[14px] font-flama tracking-[0.3em] uppercase text-[#FE8E02] mb-3">
            YOUR ACCOUNT
          </p>
          <h2 className="text-3xl md:text-5xl font-flama-condensed tracking-[0.1em] uppercase text-[#503223]">
            PROFILE SETTINGS
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Sidebar (Profile Info & Nav) */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="bg-white rounded-none border border-gray-200 p-8 shadow-sm">
              <div className="flex flex-col items-center text-center pb-8 border-b border-gray-100">
                <div className="w-24 h-24 mb-6 rounded-full border border-gray-200 bg-[#FDF8F3] flex items-center justify-center relative overflow-hidden">
                  <FiUser className="w-10 h-10 text-[#FE8E02] opacity-80" />
                </div>
                <h1 className="text-2xl font-flama-condensed tracking-[0.1em] uppercase text-[#503223] mb-2">{user?.name || 'User'}</h1>
                <p className="text-gray-500 text-[13px] font-flama tracking-wide mb-4">{user?.email}</p>
                <div className="text-[#FE8E02] px-4 py-1.5 text-[10px] font-bold font-flama tracking-[0.2em] uppercase border border-[#FE8E02]">
                  Premium Member
                </div>
              </div>

              <nav className="mt-8 space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className={`w-full flex items-center gap-4 px-4 py-3 border transition-colors duration-300 font-flama tracking-[0.1em] text-[13px] uppercase ${isEditing ? 'border-[#FE8E02] bg-[#FE8E02]/5 text-[#FE8E02]' : 'border-transparent text-[#503223] hover:text-[#FE8E02] hover:bg-gray-50'}`}
                >
                  <FiUser className="w-4 h-4 flex-shrink-0" />
                  <span>Personal Info</span>
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full flex items-center gap-4 px-4 py-3 border border-transparent transition-colors duration-300 font-flama tracking-[0.1em] text-[13px] uppercase text-[#503223] hover:text-[#FE8E02] hover:bg-gray-50 group"
                >
                  <FiPackage className="w-4 h-4 flex-shrink-0" />
                  <span>Order History</span>
                  {ordersCount > 0 && <span className="ml-auto bg-[#FE8E02] text-white py-0.5 px-2 rounded-full text-[10px] font-bold">{ordersCount}</span>}
                </button>
                <button
                  onClick={() => router.push('/wishlist')}
                  className="w-full flex items-center gap-4 px-4 py-3 border border-transparent transition-colors duration-300 font-flama tracking-[0.1em] text-[13px] uppercase text-[#503223] hover:text-[#FE8E02] hover:bg-gray-50 group"
                >
                  <FiHeart className="w-4 h-4 flex-shrink-0" />
                  <span>My Wishlist</span>
                  {getWishlistCount() > 0 && <span className="ml-auto bg-[#FE8E02] text-white py-0.5 px-2 rounded-full text-[10px] font-bold">{getWishlistCount()}</span>}
                </button>
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 border border-transparent transition-colors duration-300 font-flama tracking-[0.1em] text-[13px] uppercase text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="w-4 h-4 flex-shrink-0" />
                    <span>Logout Account</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 space-y-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Orders', value: ordersCount, icon: FiShoppingBag },
                { label: 'Wishlist Items', value: getWishlistCount(), icon: FiHeart },
                { label: 'Pending Orders', value: pendingOrdersCount, icon: FiPackage },
              ].map((stat, idx) => (
                <div key={idx} className={`bg-white rounded-none border border-gray-200 p-6 flex flex-col items-center text-center justify-center gap-3 transition-colors duration-300 hover:border-[#FE8E02] group`}>
                  <div className={`w-12 h-12 rounded-full bg-[#FDF8F3] text-[#FE8E02] flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon />
                  </div>
                  <div>
                    <p className="text-3xl font-flama-condensed text-[#503223] mb-1">{stat.value}</p>
                    <p className="text-[#503223]/70 text-[11px] font-flama tracking-[0.15em] uppercase">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-none shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="text-2xl font-flama-condensed tracking-[0.1em] uppercase text-[#503223] mb-2">Personal Information</h3>
                  <p className="text-[#FE8E02] text-[11px] font-flama tracking-[0.15em] uppercase">Manage your delivery addresses and account details</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center gap-2 px-[32px] py-[12px] bg-[#FE8E02] text-white border-2 border-[#FE8E02] font-flama tracking-[0.15em] uppercase text-[12px] hover:bg-transparent hover:text-[#FE8E02] transition-colors duration-500"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                    Edit Details
                  </button>
                )}
              </div>

              {saveMessage && (
                <div className={`mb-8 px-5 py-4 flex items-center gap-3 font-flama tracking-wide text-sm ${
                  saveMessage.includes('success') 
                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' 
                    : 'bg-red-50 border border-red-100 text-red-800'
                }`}>
                  <p className="font-medium text-sm">{saveMessage}</p>
                </div>
              )}

              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8">
                  {/* Name field */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-flama font-bold tracking-[0.15em] text-[#503223] uppercase flex items-center gap-2">
                      <FiUser className="text-[#FE8E02]" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3.5 border-2 rounded-lg bg-transparent focus:outline-none transition-all font-sans text-sm ${
                        isEditing ? 'border-gray-200 focus:border-[#FE8E02] text-gray-800' : 'border-gray-100 bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-flama font-bold tracking-[0.15em] text-[#503223] uppercase flex items-center gap-2">
                      <FiMail className="text-[#FE8E02]" /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3.5 border-2 border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed font-sans text-sm"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-flama font-bold tracking-[0.15em] text-[#503223] uppercase flex items-center gap-2">
                      <FiPhone className="text-[#FE8E02]" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3.5 border-2 rounded-lg bg-transparent focus:outline-none transition-all font-sans text-sm ${
                        isEditing ? 'border-gray-200 focus:border-[#FE8E02] text-gray-800' : 'border-gray-100 bg-gray-50 text-gray-500'
                      }`}
                      placeholder="+91"
                    />
                  </div>

                  {/* City field */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-flama font-bold tracking-[0.15em] text-[#503223] uppercase flex items-center gap-2">
                      <FiMapPin className="text-[#FE8E02]" /> City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3.5 border-2 rounded-lg bg-transparent focus:outline-none transition-all font-sans text-sm ${
                        isEditing ? 'border-gray-200 focus:border-[#FE8E02] text-gray-800' : 'border-gray-100 bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>

                  {/* State field */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-flama font-bold tracking-[0.15em] text-[#503223] uppercase flex items-center gap-2">
                      <FiMapPin className="text-[#FE8E02]" /> State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3.5 border-2 rounded-lg bg-transparent focus:outline-none transition-all font-sans text-sm ${
                        isEditing ? 'border-gray-200 focus:border-[#FE8E02] text-gray-800' : 'border-gray-100 bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>

                  {/* Pincode field */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-flama font-bold tracking-[0.15em] text-[#503223] uppercase flex items-center gap-2">
                      <FiMapPin className="text-[#FE8E02]" /> Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      disabled={!isEditing}
                      maxLength={6}
                      className={`w-full px-4 py-3.5 border-2 rounded-lg bg-transparent focus:outline-none transition-all font-sans text-sm tracking-wide ${
                        isEditing ? 'border-gray-200 focus:border-[#FE8E02] text-gray-800' : 'border-gray-100 bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Full Address */}
                <div className="space-y-3 pt-4">
                  <label className="text-[11px] font-flama font-bold tracking-[0.15em] text-[#503223] uppercase flex items-center gap-2">
                    <FiMapPin className="text-[#FE8E02]" /> Full Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className={`w-full px-4 py-3.5 border-2 rounded-lg bg-transparent focus:outline-none transition-all resize-none font-sans text-sm leading-relaxed ${
                      isEditing ? 'border-gray-200 focus:border-[#FE8E02] text-gray-800' : 'border-gray-100 bg-gray-50 text-gray-500'
                    }`}
                    placeholder="Enter your complete delivery address"
                  />
                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row gap-4 pt-10 mt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="inline-flex items-center justify-center gap-2 px-[40px] py-[14px] bg-[#FE8E02] text-white border-2 border-[#FE8E02] font-flama tracking-[0.15em] uppercase text-[12px] hover:bg-transparent hover:text-[#FE8E02] transition-colors duration-500 disabled:opacity-75"
                    >
                      <FiSave className="w-4 h-4 flex-shrink-0" />
                      {saveLoading ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center justify-center gap-2 px-[40px] py-[14px] bg-transparent text-[#503223] border-2 border-gray-200 font-flama tracking-[0.15em] uppercase text-[12px] hover:border-[#503223] transition-colors duration-500"
                    >
                      <FiX className="w-4 h-4 flex-shrink-0" />
                      CANCEL
                    </button>
                  </div>
                )}
              </form>
            </div>
            
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
