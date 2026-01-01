'use client';

import React, { useState, useEffect } from 'react';
import { FiEye, FiPlus, FiEdit, FiTrash2, FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

interface InstaBook {
  _id: string;
  label: string;
  image: string;
  isVideo: boolean;
  overlayText: string;
  order: number;
  isActive: boolean;
}

export default function InstaBookPage() {
  const [instaBooks, setInstaBooks] = useState<InstaBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInstaBooks();
  }, []);

  const fetchInstaBooks = async () => {
    try {
      const response = await fetch('/api/instabook/all');
      const data = await response.json();
      if (data.success) {
        setInstaBooks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching InstaBook items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this InstaBook item?')) return;

    try {
      const response = await fetch(`/api/instabook/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchInstaBooks();
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
      const response = await fetch(`/api/instabook/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await response.json();
      if (data.success) {
        fetchInstaBooks();
      } else {
        alert('Error updating item: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item');
    }
  };

  const updateOrder = async (id: string, direction: 'up' | 'down') => {
    const item = instaBooks.find((ib) => ib._id === id);
    if (!item) return;

    const sortedItems = [...instaBooks].sort((a, b) => a.order - b.order);
    const currentIndex = sortedItems.findIndex((ib) => ib._id === id);

    if (direction === 'up' && currentIndex > 0) {
      const prevItem = sortedItems[currentIndex - 1];
      const newOrder = prevItem.order;
      const prevNewOrder = item.order;

      try {
        await Promise.all([
          fetch(`/api/instabook/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder }),
          }),
          fetch(`/api/instabook/${prevItem._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: prevNewOrder }),
          }),
        ]);
        fetchInstaBooks();
      } catch (error) {
        console.error('Error updating order:', error);
      }
    } else if (direction === 'down' && currentIndex < sortedItems.length - 1) {
      const nextItem = sortedItems[currentIndex + 1];
      const newOrder = nextItem.order;
      const nextNewOrder = item.order;

      try {
        await Promise.all([
          fetch(`/api/instabook/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder }),
          }),
          fetch(`/api/instabook/${nextItem._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: nextNewOrder }),
          }),
        ]);
        fetchInstaBooks();
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }
  };

  const filteredInstaBooks = instaBooks.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading InstaBook items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-general-sansal-sansal-sansal-sans">InstaBook</h1>
          <p className="text-gray-600 mt-1">Manage InstaBook section items</p>
        </div>
        <Link
          href="/admin/instabook/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors font-medium"
        >
          <FiPlus size={18} />
          <span>Add Item</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search InstaBook items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
          />
        </div>
      </div>

      {/* InstaBook Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInstaBooks.map((item, index) => (
          <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
              {item.isVideo ? (
                <video
                  src={item.image}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
              {!item.isActive && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold">Inactive</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-primary-brown font-general-sansal-sansal-sansal-sans mb-2">{item.label}</h3>
            {item.overlayText && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.overlayText}</p>
            )}
            <p className="text-xs text-gray-500 mb-4">Order: {item.order}</p>
            <div className="flex gap-2">
              <button
                onClick={() => updateOrder(item._id, 'up')}
                disabled={index === 0}
                className="p-2 text-primary-red hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                <FiArrowUp size={16} />
              </button>
              <button
                onClick={() => updateOrder(item._id, 'down')}
                disabled={index === filteredInstaBooks.length - 1}
                className="p-2 text-primary-red hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                <FiArrowDown size={16} />
              </button>
              <Link
                href={`/admin/instabook/${item._id}`}
                className="flex-1 bg-primary-red text-white p-2 rounded text-center hover:bg-primary-darkRed transition-colors text-sm font-medium"
              >
                <FiEdit size={16} className="inline mr-2" />
                Edit
              </Link>
              <button
                onClick={() => toggleActive(item._id, item.isActive)}
                className={`p-2 rounded text-sm font-medium ${
                  item.isActive
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {item.isActive ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredInstaBooks.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No InstaBook items found</p>
          <Link
            href="/admin/instabook/new"
            className="inline-block text-primary-red hover:underline font-medium"
          >
            Add your first InstaBook item
          </Link>
        </div>
      )}
    </div>
  );
}

