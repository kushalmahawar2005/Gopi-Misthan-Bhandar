'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import MultipleImageUpload from '@/components/MultipleImageUpload';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    images: [] as string[],
    category: 'sweets',
    featured: false,
    isPremium: false,
    isClassic: false,
    stock: '',
    shelfLife: '',
    deliveryTime: '',
    defaultWeight: '',
    sizes: [] as { weight: string; price: string; label: string }[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        sizes: formData.sizes.map((size) => ({
          weight: size.weight,
          price: parseFloat(size.price),
          label: size.label,
        })),
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/admin/products');
      } else {
        alert('Error creating product: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    } finally {
      setLoading(false);
    }
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { weight: '', price: '', label: '' }],
    });
  };

  const removeSize = (index: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
    });
  };

  const updateSize = (index: number, field: string, value: string) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setFormData({ ...formData, sizes: newSizes });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-brown font-serif">Add New Product</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Create a new product for your catalog</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium self-start sm:self-auto"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
            >
              <option value="sweets">Sweets</option>
              <option value="classic-sweets">Classic Sweets</option>
              <option value="premium-sweets">Premium Sweets</option>
              <option value="snacks">Snacks</option>
              <option value="namkeen">Namkeen</option>
              <option value="dry-fruit">Dry Fruit</option>
              <option value="gifting">Gifting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
            />
          </div>

          <div className="md:col-span-2">
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              folder="products"
              label="Main Product Image"
              required
            />
          </div>

          <div className="md:col-span-2">
            <MultipleImageUpload
              value={formData.images}
              onChange={(urls) => setFormData({ ...formData, images: urls })}
              folder="products"
              label="Additional Product Images"
              maxImages={5}
            />
            <p className="text-xs text-gray-500 mt-1">
              Add up to 5 additional images. The first image will be shown on hover in product cards.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shelf Life</label>
            <input
              type="text"
              value={formData.shelfLife}
              onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              placeholder="e.g., 7-10 days"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
            <input
              type="text"
              value={formData.deliveryTime}
              onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              placeholder="e.g., 2-3 days"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Weight</label>
            <input
              type="text"
              value={formData.defaultWeight}
              onChange={(e) => setFormData({ ...formData, defaultWeight: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              placeholder="e.g., 500g"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Featured Product</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPremium}
              onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Premium Sweets</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isClassic}
              onChange={(e) => setFormData({ ...formData, isClassic: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Classic Sweets</span>
          </label>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Sizes/Variants</label>
            <button
              type="button"
              onClick={addSize}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Add Size
            </button>
          </div>
          {formData.sizes.map((size, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Weight (e.g., 500g)"
                value={size.weight}
                onChange={(e) => updateSize(index, 'weight', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
              <input
                type="number"
                placeholder="Price"
                step="0.01"
                value={size.price}
                onChange={(e) => updateSize(index, 'price', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
              <input
                type="text"
                placeholder="Label (e.g., Small)"
                value={size.label}
                onChange={(e) => updateSize(index, 'label', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
              <button
                type="button"
                onClick={() => removeSize(index)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-red text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-darkRed transition-colors disabled:opacity-50 font-medium w-full sm:w-auto"
            >
              <FiSave size={18} />
              {loading ? 'Saving...' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

