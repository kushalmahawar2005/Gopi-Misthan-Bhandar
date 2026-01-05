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
      updateUser(formData);
      setSaveMessage('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error updating profile');
    }

    setSaveLoading(false);
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
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />

      <div className="bg-gradient-to-br from-red-700 to-red-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 ring-2 ring-white/30 flex items-center justify-center">
                <FiUser className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-white">{user.name}</h1>
                <p className="text-white/80">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-6 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <p className="text-2xl font-bold text-white">{ordersCount}</p>
                <p className="text-white/80 text-xs">Total Orders</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <p className="text-2xl font-bold text-white">{getWishlistCount()}</p>
                <p className="text-white/80 text-xs">Wishlist</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <p className="text-2xl font-bold text-white">{pendingOrdersCount}</p>
                <p className="text-white/80 text-xs">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sticky top-24">
              <div className="space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <FiEdit2 className="w-5 h-5 text-gray-700" />
                  <span className="text-gray-800">Edit Profile</span>
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <FiPackage className="w-5 h-5 text-gray-700" />
                  <span className="text-gray-800">My Orders</span>
                </button>
                <button
                  onClick={() => router.push('/wishlist')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <FiHeart className="w-5 h-5 text-gray-700" />
                  <span className="text-gray-800">Wishlist</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-semibold">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-700 text-white hover:bg-red-800 transition-colors"
                  >
                    <FiEdit2 className="w-5 h-5" />
                    Edit
                  </button>
                )}
              </div>

              {saveMessage && (
                <div className={`mb-6 px-4 py-3 rounded-lg ${
                  saveMessage.includes('success') 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {saveMessage}
                </div>
              )}

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="inline w-4 h-4 mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiPhone className="inline w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMapPin className="inline w-4 h-4 mr-2" />
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMapPin className="inline w-4 h-4 mr-2" />
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMapPin className="inline w-4 h-4 mr-2" />
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Pincode"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin className="inline w-4 h-4 mr-2" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="Your full address"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-red-700 text-white hover:bg-red-800 transition-colors disabled:opacity-50"
                    >
                      <FiSave className="w-5 h-5" />
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 text-center">
                <FiShoppingBag className="w-7 h-7 text-red-700 mx-auto mb-3" />
                <p className="text-2xl font-semibold">{ordersCount}</p>
                <p className="text-gray-600 text-sm">Total Orders</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 text-center">
                <FiHeart className="w-7 h-7 text-red-700 mx-auto mb-3" />
                <p className="text-2xl font-semibold">{getWishlistCount()}</p>
                <p className="text-gray-600 text-sm">Wishlist Items</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 text-center">
                <FiPackage className="w-7 h-7 text-red-700 mx-auto mb-3" />
                <p className="text-2xl font-semibold">{pendingOrdersCount}</p>
                <p className="text-gray-600 text-sm">Pending Orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

