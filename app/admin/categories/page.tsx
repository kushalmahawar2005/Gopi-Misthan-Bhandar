'use client';

import React, { useEffect, useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronDown, FiChevronUp, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

interface SubCategory {
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  subCategories?: SubCategory[];
  order?: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setCategories(categories.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategorySlug: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}/subcategories/${subcategorySlug}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        // Refresh categories
        fetchCategories();
      } else {
        alert('Error deleting subcategory: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('Error deleting subcategory');
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const updateOrder = async (id: string, direction: 'up' | 'down') => {
    const item = categories.find((c) => c._id === id);
    if (!item) return;

    const sortedItems = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedItems.findIndex((c) => c._id === id);

    if (direction === 'up' && currentIndex > 0) {
      const prevItem = sortedItems[currentIndex - 1];
      const currentOrder = item.order ?? 0;
      const prevOrder = prevItem.order ?? 0;

      try {
        await Promise.all([
          fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: prevOrder }),
          }),
          fetch(`/api/categories/${prevItem._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: currentOrder }),
          }),
        ]);
        await fetchCategories();
      } catch (error) {
        console.error('Error updating order:', error);
        alert('Error updating order');
      }
    } else if (direction === 'down' && currentIndex < sortedItems.length - 1) {
      const nextItem = sortedItems[currentIndex + 1];
      const currentOrder = item.order ?? 0;
      const nextOrder = nextItem.order ?? 0;

      try {
        await Promise.all([
          fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: nextOrder }),
          }),
          fetch(`/api/categories/${nextItem._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: currentOrder }),
          }),
        ]);
        await fetchCategories();
      } catch (error) {
        console.error('Error updating order:', error);
        alert('Error updating order');
      }
    }
  };

  const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  const filteredCategories = sortedCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-brown font-serif">Categories</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your product categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          <FiPlus size={18} />
          <span>Add Category</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <div key={category._id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            {category.image && (
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-primary-brown font-serif">{category.name}</h3>
              {category.subCategories && category.subCategories.length > 0 && (
                <button
                  onClick={() => toggleCategoryExpansion(category._id)}
                  className="text-primary-red hover:text-primary-darkRed transition-colors"
                  title="Toggle subcategories"
                >
                  {expandedCategories.has(category._id) ? (
                    <FiChevronUp size={20} />
                  ) : (
                    <FiChevronDown size={20} />
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                <p className="text-sm font-semibold text-primary-red">
                  Position: {category.order ? category.order : (sortedCategories.findIndex(c => c._id === category._id) + 1)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateOrder(category._id, 'up')}
                  disabled={sortedCategories.findIndex(c => c._id === category._id) === 0}
                  className="p-1 text-gray-600 hover:text-primary-red disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <FiArrowUp size={16} />
                </button>
                <button
                  onClick={() => updateOrder(category._id, 'down')}
                  disabled={sortedCategories.findIndex(c => c._id === category._id) === sortedCategories.length - 1}
                  className="p-1 text-gray-600 hover:text-primary-red disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <FiArrowDown size={16} />
                </button>
              </div>
            </div>
            {category.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
            )}
            
            {/* Subcategories Section */}
            {category.subCategories && category.subCategories.length > 0 && expandedCategories.has(category._id) && (
              <div className="mb-4 border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">Subcategories ({category.subCategories.length})</h4>
                </div>
                <div className="space-y-2">
                  {category.subCategories.map((subcategory, index) => (
                    <div key={index} className="bg-gray-50 rounded p-2 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{subcategory.name}</p>
                        <p className="text-xs text-gray-500">Slug: {subcategory.slug}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSubcategory(category._id, subcategory.slug)}
                        className="text-red-600 hover:text-red-700 transition-colors ml-2"
                        title="Delete subcategory"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Link
                href={`/admin/categories/${category._id}`}
                className="flex-1 bg-primary-red text-white p-2 rounded text-center hover:bg-primary-darkRed transition-colors text-sm font-medium"
              >
                <FiEdit size={16} className="inline mr-2" />
                Edit
              </Link>
              <button
                onClick={() => handleDelete(category._id)}
                className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <FiTrash2 size={16} className="inline mr-2" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No categories found</p>
          <Link
            href="/admin/categories/new"
            className="inline-block text-primary-red hover:underline font-medium"
          >
            Add your first category
          </Link>
        </div>
      )}
    </div>
  );
}
