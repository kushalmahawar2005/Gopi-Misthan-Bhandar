'use client';

import React, { useState, useEffect } from 'react';
import { FiGift, FiPlus, FiEdit, FiTrash2, FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

interface GiftBoxItem {
  _id: string;
  category: 'assorted' | 'dry-fruit' | 'souvenir';
  title: string;
  description: string;
  imageUrl: string;
  size?: 'small' | 'large';
  price?: number;
  order: number;
  isActive: boolean;
}

export default function GiftBoxPage() {
  const [giftBoxes, setGiftBoxes] = useState<GiftBoxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGiftBoxes();
  }, []);

  const fetchGiftBoxes = async () => {
    try {
      const response = await fetch('/api/giftbox/all');
      const data = await response.json();
      if (data.success) {
        setGiftBoxes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching GiftBox items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this GiftBox item?')) return;

    try {
      const response = await fetch(`/api/giftbox/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchGiftBoxes();
      } else {
        alert('Error deleting item: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/giftbox/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await response.json();
      if (data.success) {
        fetchGiftBoxes();
      } else {
        alert('Error updating item: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item');
    }
  };

  const updateOrder = async (id: string, direction: 'up' | 'down') => {
    const item = giftBoxes.find((g) => g._id === id);
    if (!item) return;

    const sortedItems = [...giftBoxes].sort((a, b) => a.order - b.order);
    const currentIndex = sortedItems.findIndex((g) => g._id === id);

    if (direction === 'up' && currentIndex > 0) {
      const prevItem = sortedItems[currentIndex - 1];
      const newOrder = prevItem.order;
      const prevNewOrder = item.order;

      try {
        await Promise.all([
          fetch(`/api/giftbox/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder }),
          }),
          fetch(`/api/giftbox/${prevItem._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: prevNewOrder }),
          }),
        ]);
        fetchGiftBoxes();
      } catch (error) {
        console.error('Error updating order:', error);
      }
    } else if (direction === 'down' && currentIndex < sortedItems.length - 1) {
      const nextItem = sortedItems[currentIndex + 1];
      const newOrder = nextItem.order;
      const nextNewOrder = item.order;

      try {
        await Promise.all([
          fetch(`/api/giftbox/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder }),
          }),
          fetch(`/api/giftbox/${nextItem._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: nextNewOrder }),
          }),
        ]);
        fetchGiftBoxes();
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'assorted': 'Assorted Gift Boxes',
      'dry-fruit': 'Dry Fruit Gift Boxes',
      'souvenir': 'Souvenir Gift Boxes',
    };
    return labels[category] || category;
  };

  const filteredGiftBoxes = giftBoxes
    .filter((item) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const title = (item.title || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      const category = getCategoryLabel(item.category).toLowerCase();
      return title.includes(searchLower) || description.includes(searchLower) || category.includes(searchLower);
    })
    .sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading GiftBox items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-general-sansal-sansal-sansal-sans">Gift Box</h1>
          <p className="text-gray-600 mt-1">Manage gift box categories</p>
        </div>
        <Link
          href="/admin/giftbox/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors font-medium"
        >
          <FiPlus size={18} />
          <span>Add Gift Box</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search GiftBox items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
          />
        </div>
      </div>

      {/* GiftBox Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGiftBoxes.map((item, index) => (
          <div key={item._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative w-full h-64 overflow-hidden">
              <Image
                src={item.imageUrl || `https://picsum.photos/seed/giftbox${item._id}/400/300`}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {!item.isActive && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold">Inactive</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="mb-2">
                <span className="text-xs font-semibold text-primary-red bg-red-50 px-2 py-1 rounded">
                  {getCategoryLabel(item.category)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2 mb-2">
                {item.size && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    item.size === 'small' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.size === 'small' ? 'Small' : 'Large'}
                  </span>
                )}
                <span className="text-lg font-bold text-primary-red">
                  ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Order: {item.order}</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => updateOrder(item._id, 'up')}
                  disabled={index === 0}
                  className="p-2 text-primary-red hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <FiArrowUp size={14} />
                </button>
                <button
                  onClick={() => updateOrder(item._id, 'down')}
                  disabled={index === filteredGiftBoxes.length - 1}
                  className="p-2 text-primary-red hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <FiArrowDown size={14} />
                </button>
                <Link
                  href={`/admin/giftbox/${item._id}`}
                  className="flex-1 bg-primary-red text-white p-2 rounded text-center hover:bg-primary-darkRed transition-colors text-sm font-medium"
                >
                  <FiEdit size={14} className="inline mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => toggleActive(item._id, item.isActive)}
                  className={`p-2 rounded text-xs font-medium ${
                    item.isActive
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {item.isActive ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGiftBoxes.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No GiftBox items found</p>
          <Link
            href="/admin/giftbox/new"
            className="inline-block text-primary-red hover:underline font-medium"
          >
            Add your first GiftBox item
          </Link>
        </div>
      )}
    </div>
  );
}

