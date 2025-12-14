'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

interface SubCategory {
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export default function EditCategory() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    description: '',
    order: 0,
  });
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState<SubCategory>({
    name: '',
    slug: '',
    image: '',
    description: '',
  });

  useEffect(() => {
    fetchCategory();
  }, [params.id]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setFormData({
          name: data.data.name,
          slug: data.data.slug,
          image: data.data.image || '',
          description: data.data.description || '',
          order: data.data.order || 0,
        });
        setSubCategories(data.data.subCategories || []);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  const handleSubCategoryNameChange = (name: string) => {
    setCurrentSubCategory({
      ...currentSubCategory,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  const addSubCategory = () => {
    if (!currentSubCategory.name || !currentSubCategory.slug) {
      alert('Subcategory name and slug are required');
      return;
    }

    // Check for duplicate slugs
    if (subCategories.some((sub) => sub.slug === currentSubCategory.slug)) {
      alert('Subcategory with this slug already exists');
      return;
    }

    setSubCategories([...subCategories, { ...currentSubCategory }]);
    setCurrentSubCategory({ name: '', slug: '', image: '', description: '' });
    setShowSubCategoryForm(false);
  };

  const removeSubCategory = (index: number) => {
    setSubCategories(subCategories.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const categoryData = {
        ...formData,
        subCategories: subCategories.length > 0 ? subCategories : [],
      };

      const response = await fetch(`/api/categories/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/admin/categories');
      } else {
        alert('Error updating category: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-brown font-serif">Edit Category</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
        >
          <FiX size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
          <input
            type="number"
            min="1"
            value={formData.order || 1}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
            placeholder="1"
          />
          <p className="text-xs text-gray-500 mt-1">Position number (1, 2, 3...). Lower numbers appear first. Position = Order number.</p>
        </div>

        <div>
          <ImageUpload
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            folder="categories"
            label="Category Image"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
          />
        </div>

        {/* Subcategories Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-primary-brown font-serif">Subcategories</h3>
              <p className="text-sm text-gray-600">Add subcategories to organize products further</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSubCategoryForm(!showSubCategoryForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors text-sm font-medium"
            >
              <FiPlus size={18} />
              Add Subcategory
            </button>
          </div>

          {/* Subcategory Form */}
          {showSubCategoryForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Name *</label>
                <input
                  type="text"
                  value={currentSubCategory.name}
                  onChange={(e) => handleSubCategoryNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Slug *</label>
                <input
                  type="text"
                  value={currentSubCategory.slug}
                  onChange={(e) => setCurrentSubCategory({ ...currentSubCategory, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>
              <div>
                <ImageUpload
                  value={currentSubCategory.image || ''}
                  onChange={(url) => setCurrentSubCategory({ ...currentSubCategory, image: url })}
                  folder="subcategories"
                  label="Subcategory Image (Optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={currentSubCategory.description || ''}
                  onChange={(e) => setCurrentSubCategory({ ...currentSubCategory, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addSubCategory}
                  className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors text-sm font-medium"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubCategoryForm(false);
                    setCurrentSubCategory({ name: '', slug: '', image: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Subcategories List */}
          {subCategories.length > 0 && (
            <div className="space-y-2">
              {subCategories.map((subCategory, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{subCategory.name}</h4>
                    <p className="text-sm text-gray-500">Slug: {subCategory.slug}</p>
                    {subCategory.description && (
                      <p className="text-sm text-gray-600 mt-1">{subCategory.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSubCategory(index)}
                    className="text-red-600 hover:text-red-700 transition-colors ml-4"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-red text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-darkRed transition-colors disabled:opacity-50"
          >
            <FiSave size={20} />
            {saving ? 'Saving...' : 'Update Category'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

