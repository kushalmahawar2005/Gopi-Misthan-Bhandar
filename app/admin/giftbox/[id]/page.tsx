'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiX } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

export default function EditGiftBox() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    category: 'assorted' as 'assorted' | 'dry-fruit' | 'souvenir',
    title: '',
    description: '',
    imageUrl: '',
    size: 'small' as 'small' | 'large',
    price: 0,
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchGiftBox();
  }, [params.id]);

  const fetchGiftBox = async () => {
    try {
      const response = await fetch(`/api/giftbox/${params.id}?t=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        setFormData({
          category: data.data.category || 'assorted',
          title: data.data.title || '',
          description: data.data.description || '',
          imageUrl: data.data.imageUrl || '',
          size: data.data.size || 'small',
          price: data.data.price || 0,
          order: data.data.order || 0,
          isActive: data.data.isActive !== undefined ? data.data.isActive : true,
        });
      }
    } catch (error) {
      console.error('Error fetching GiftBox item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl || !formData.imageUrl.trim()) {
      alert('Please upload an image');
      return;
    }
    
    if (!formData.title || !formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!formData.description || !formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    setSaving(true);

    try {
      const updatePayload = {
        category: formData.category,
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim(),
        size: formData.size,
        price: Number(formData.price) || 0,
        order: Number(formData.order) || 0,
        isActive: Boolean(formData.isActive),
      };
      
      const response = await fetch(`/api/giftbox/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('GiftBox item updated successfully!');
        router.push('/admin/giftbox');
      } else {
        alert('Error updating GiftBox item: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating GiftBox item:', error);
      alert('Error updating GiftBox item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-general-sansal-sansal-sans">Edit Gift Box</h1>
          <p className="text-gray-600 mt-1">Update GiftBox item details</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <ImageUpload
                key={formData.imageUrl || 'new'}
                value={formData.imageUrl}
                onChange={(url) => {
                  setFormData({ ...formData, imageUrl: url });
                }}
                folder="giftbox"
                label="Gift Box Image"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'assorted' | 'dry-fruit' | 'souvenir' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                required
              >
                <option value="assorted">Assorted Gift Boxes</option>
                <option value="dry-fruit">Dry Fruit Gift Boxes</option>
                <option value="souvenir">Souvenir Gift Boxes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size *</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value as 'small' | 'large' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                required
              >
                <option value="small">Small Size</option>
                <option value="large">Large Size</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <input
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-red rounded focus:ring-primary-red"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-red text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary-darkRed transition-colors disabled:opacity-50 font-medium"
            >
              <FiSave size={18} />
              {saving ? 'Saving...' : 'Update Gift Box'}
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

