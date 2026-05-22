'use client';

import React, { useEffect, useState } from 'react';
import { FiSave, FiTag, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductTaglinePage() {
  const router = useRouter();
  const [taglineId, setTaglineId] = useState<string | null>(null);
  const [taglineText, setTaglineText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTagline();
  }, []);

  const fetchTagline = async () => {
    try {
      const response = await fetch('/api/site-content/section/product-tagline?includeInactive=true');
      const data = await response.json();
      
      if (data.success && data.data) {
        setTaglineId(data.data._id);
        setTaglineText(data.data.description || '');
        setIsActive(data.data.isActive !== false);
      }
    } catch (error) {
      console.error('Error fetching tagline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      section: 'product-tagline',
      description: taglineText,
      isActive: isActive,
    };

    try {
      let response;
      if (taglineId) {
        // Update existing tagline
        response = await fetch(`/api/site-content/${taglineId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new tagline
        response = await fetch('/api/site-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Product tagline saved successfully!' });
        if (data.data && data.data._id) {
          setTaglineId(data.data._id);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save product tagline.' });
      }
    } catch (error: any) {
      console.error('Error saving tagline:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while saving.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600 font-geom">Loading tagline configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-geom">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:text-primary-red hover:bg-gray-50 transition-colors"
          title="Back to Dashboard"
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-brown font-geom">Product Tag Line</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage the global tagline text displayed below the name of all products on your storefront.
          </p>
        </div>
      </div>

      {/* Form Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border transition-all animate-[fadeIn_0.3s_ease-out] ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <FiTag className="text-primary-red" size={22} />
          <h2 className="text-lg font-bold text-primary-brown font-geom">Tag Line Content</h2>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Tag Line Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary-brown font-geom">
              Tag Line Text
            </label>
            <textarea
              value={taglineText}
              onChange={(e) => setTaglineText(e.target.value)}
              placeholder="e.g., Pure Veg, Fresh and Handmade since 1968"
              rows={3}
              maxLength={150}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-shadow text-gray-800"
            />
            <p className="text-xs text-gray-500 flex justify-between">
              <span>This text will appear under the product name everywhere.</span>
              <span>{taglineText.length}/150 characters</span>
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-primary-brown font-geom flex items-center gap-2 cursor-pointer select-none">
                {isActive ? <FiEye className="text-green-600" /> : <FiEyeOff className="text-gray-400" />}
                <span>Active Status</span>
              </label>
              <p className="text-xs text-gray-500">
                {isActive 
                  ? 'The tagline is currently visible under product names.' 
                  : 'The tagline is currently hidden.'}
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 ${
                isActive ? 'bg-[#FE8E02]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin"
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary-red text-white hover:bg-primary-darkRed rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <FiSave size={16} />
              <span>{saving ? 'Saving...' : 'Save Tag Line'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
