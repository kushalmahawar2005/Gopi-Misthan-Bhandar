'use client';

import React, { useState, useEffect } from 'react';
import { FiSave, FiMail, FiCreditCard, FiGlobe, FiShoppingBag, FiTruck } from 'react-icons/fi';

interface Settings {
  site: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  shipping: {
    freeShippingThreshold: number;
    standardShippingCost: number;
    estimatedDeliveryDays: number;
  };
  payment: {
    razorpayKeyId: string;
    razorpayKeySecret: string;
    enableUPI: boolean;
    enableCard: boolean;
    enableCOD: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    googleAnalyticsId: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    site: {
      name: 'Gopi Misthan Bhandar',
      email: 'info@gopimisthanbhandar.com',
      phone: '+91 1234567890',
      address: '',
      city: 'Neemuch',
      state: 'Madhya Pradesh',
      pincode: '458441',
    },
    shipping: {
      freeShippingThreshold: 500,
      standardShippingCost: 50,
      estimatedDeliveryDays: 3,
    },
    payment: {
      razorpayKeyId: '',
      razorpayKeySecret: '',
      enableUPI: true,
      enableCard: true,
      enableCOD: true,
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@gopimisthanbhandar.com',
      fromName: 'Gopi Misthan Bhandar',
    },
    seo: {
      metaTitle: 'Gopi Misthan Bhandar - Traditional Indian Sweets',
      metaDescription: 'Serving Tradition & Sweetness Since 1968',
      metaKeywords: 'sweets, namkeen, traditional, indian sweets',
      googleAnalyticsId: '',
    },
  });

  const [activeTab, setActiveTab] = useState<'site' | 'shipping' | 'payment' | 'email' | 'seo'>('site');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/site-content/section/settings');
      const data = await response.json();
      if (data.success && data.data) {
        setSettings({ ...settings, ...data.data });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // In a real app, you'd save to a settings API endpoint
      // For now, we'll save to localStorage as a demo
      localStorage.setItem('siteSettings', JSON.stringify(settings));
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof Settings, field: string, value: any) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  const tabs = [
    { id: 'site', label: 'Site Settings', icon: FiGlobe },
    { id: 'shipping', label: 'Shipping', icon: FiTruck },
    { id: 'payment', label: 'Payment', icon: FiCreditCard },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'seo', label: 'SEO', icon: FiShoppingBag },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-serif">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your site configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-red text-white rounded-lg font-bold hover:bg-primary-darkRed transition-colors disabled:opacity-50"
        >
          <FiSave size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-red text-primary-red'
                    : 'border-transparent text-gray-600 hover:text-primary-red'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Site Settings */}
          {activeTab === 'site' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.site.name}
                  onChange={(e) => updateSettings('site', 'name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.site.email}
                    onChange={(e) => updateSettings('site', 'email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={settings.site.phone}
                    onChange={(e) => updateSettings('site', 'phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={settings.site.address}
                  onChange={(e) => updateSettings('site', 'address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={settings.site.city}
                    onChange={(e) => updateSettings('site', 'city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={settings.site.state}
                    onChange={(e) => updateSettings('site', 'state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={settings.site.pincode}
                    onChange={(e) => updateSettings('site', 'pincode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shipping Settings */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.shipping.freeShippingThreshold}
                  onChange={(e) => updateSettings('shipping', 'freeShippingThreshold', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
                <p className="text-sm text-gray-500 mt-1">Orders above this amount get free shipping</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  value={settings.shipping.standardShippingCost}
                  onChange={(e) => updateSettings('shipping', 'standardShippingCost', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Days
                </label>
                <input
                  type="number"
                  value={settings.shipping.estimatedDeliveryDays}
                  onChange={(e) => updateSettings('shipping', 'estimatedDeliveryDays', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Razorpay Key ID</label>
                <input
                  type="text"
                  value={settings.payment.razorpayKeyId}
                  onChange={(e) => updateSettings('payment', 'razorpayKeyId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  placeholder="rzp_test_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Razorpay Key Secret</label>
                <input
                  type="password"
                  value={settings.payment.razorpayKeySecret}
                  onChange={(e) => updateSettings('payment', 'razorpayKeySecret', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Payment Methods</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.payment.enableCOD}
                      onChange={(e) => updateSettings('payment', 'enableCOD', e.target.checked)}
                      className="w-4 h-4 text-primary-red rounded focus:ring-primary-red"
                    />
                    <span>Cash on Delivery (COD)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.payment.enableUPI}
                      onChange={(e) => updateSettings('payment', 'enableUPI', e.target.checked)}
                      className="w-4 h-4 text-primary-red rounded focus:ring-primary-red"
                    />
                    <span>UPI Payment</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.payment.enableCard}
                      onChange={(e) => updateSettings('payment', 'enableCard', e.target.checked)}
                      className="w-4 h-4 text-primary-red rounded focus:ring-primary-red"
                    />
                    <span>Debit/Credit Card</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSettings('email', 'smtpHost', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSettings('email', 'smtpPort', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP User</label>
                  <input
                    type="text"
                    value={settings.email.smtpUser}
                    onChange={(e) => updateSettings('email', 'smtpUser', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                  <input
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) => updateSettings('email', 'smtpPassword', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => updateSettings('email', 'fromEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    value={settings.email.fromName}
                    onChange={(e) => updateSettings('email', 'fromName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={settings.seo.metaTitle}
                  onChange={(e) => updateSettings('seo', 'metaTitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={settings.seo.metaDescription}
                  onChange={(e) => updateSettings('seo', 'metaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                <input
                  type="text"
                  value={settings.seo.metaKeywords}
                  onChange={(e) => updateSettings('seo', 'metaKeywords', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.seo.googleAnalyticsId}
                  onChange={(e) => updateSettings('seo', 'googleAnalyticsId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

