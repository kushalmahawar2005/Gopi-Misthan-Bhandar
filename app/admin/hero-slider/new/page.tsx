'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

export default function NewHeroSlide() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    image: '',
    mobileImage: '',
    order: 0,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/hero-slider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order.toString()) || 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/admin/hero-slider');
      } else {
        alert('Error creating slide: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating slide:', error);
      alert('Error creating slide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-general-sansal-sans">Add New Hero Slide</h1>
          <p className="text-gray-600 mt-1">Create a new slide for the homepage hero slider</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              folder="hero-slider"
              label="Hero Slide Image (Full Size - Desktop) *"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x800px or larger</p>
          </div>

          <div>
            <ImageUpload
              value={formData.mobileImage}
              onChange={(url) => setFormData({ ...formData, mobileImage: url })}
              folder="hero-slider"
              label="Hero Slide Image (Mobile Size)"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended size: 768x500px. If not provided, full size image will be used on mobile.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-red text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary-darkRed transition-colors disabled:opacity-50 font-medium"
            >
              <FiSave size={18} />
              {loading ? 'Saving...' : 'Create Slide'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

