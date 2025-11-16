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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <Cart />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-red to-primary-darkRed py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-[500] font-general-sans text-white">
            My Profile
          </h1>
          <p className="text-lg text-gray-100 mt-2">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              {/* Profile Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary-red rounded-full mx-auto flex items-center justify-center mb-4">
                  <FiUser className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-[500] font-general-sans">{user.name}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiEdit2 className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiPackage className="w-5 h-5" />
                  <span>My Orders</span>
                </button>
                <button
                  onClick={() => router.push('/wishlist')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiHeart className="w-5 h-5" />
                  <span>Wishlist</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-[500] font-general-sans">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-primary-red hover:text-primary-darkRed font-medium"
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
                      className="flex items-center gap-2 bg-primary-red text-white px-6 py-3 rounded-lg font-bold font-serif hover:bg-primary-darkRed transition-colors disabled:opacity-50"
                    >
                      <FiSave className="w-5 h-5" />
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold font-serif hover:bg-gray-300 transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <FiShoppingBag className="w-8 h-8 text-primary-red mx-auto mb-3" />
                <p className="text-2xl font-bold font-serif">{ordersCount}</p>
                <p className="text-gray-600 text-sm">Total Orders</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <FiHeart className="w-8 h-8 text-primary-red mx-auto mb-3" />
                <p className="text-2xl font-bold font-serif">{getWishlistCount()}</p>
                <p className="text-gray-600 text-sm">Wishlist Items</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <FiPackage className="w-8 h-8 text-primary-red mx-auto mb-3" />
                <p className="text-2xl font-bold font-serif">{pendingOrdersCount}</p>
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

