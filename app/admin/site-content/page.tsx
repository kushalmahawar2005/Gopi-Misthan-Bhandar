'use client';

import React, { useEffect, useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SiteContent {
  _id: string;
  section: string;
  title?: string;
  subtitle?: string;
  description?: string;
  mainImage?: string;
  isActive: boolean;
}

export default function AdminSiteContent() {
  const router = useRouter();
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const response = await fetch('/api/site-content');
      const data = await response.json();
      if (data.success) {
        setContents(data.data);
      }
    } catch (error) {
      console.error('Error fetching site content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`/api/site-content/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setContents(contents.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/site-content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setContents(contents.map((c) => (c._id === id ? { ...c, isActive: !currentStatus } : c)));
      }
    } catch (error) {
      console.error('Error updating content status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading site content...</p>
        </div>
      </div>
    );
  }

  // Filter only marquee section
  const marqueeContent = contents.find((c) => c.section === 'marquee');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-general-sansal-sansal-sansal-sans">Offer Line (Marquee)</h1>
          <p className="text-gray-600 mt-1">Manage the scrolling offer line at the top of your website</p>
        </div>
        <div>
          {marqueeContent ? (
            <Link
              href={`/admin/site-content/${marqueeContent._id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors text-sm font-medium"
            >
              <FiEdit size={16} />
              Edit Offer Line
            </Link>
          ) : (
            <Link
              href="/admin/site-content/new?section=marquee"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors text-sm font-medium"
            >
              <FiPlus size={16} />
              Add Offer Line
            </Link>
          )}
        </div>
      </div>

      {/* Marquee Content Card */}
      {marqueeContent ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-brown mb-2">Current Offer Line</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                {marqueeContent.description || 'No text set'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Status:</span>
              <button
                onClick={() => toggleActive(marqueeContent._id, marqueeContent.isActive)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  marqueeContent.isActive
                    ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {marqueeContent.isActive ? (
                  <span className="flex items-center gap-2">
                    <FiEye size={16} /> Visible
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiEyeOff size={16} /> Hidden
                  </span>
                )}
              </button>
            </div>
            <Link
              href={`/admin/site-content/${marqueeContent._id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors text-sm font-medium"
            >
              <FiEdit size={16} />
              Edit
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No offer line configured yet.</p>
          <Link
            href="/admin/site-content/new?section=marquee"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors font-medium"
          >
            <FiPlus size={18} />
            Create Offer Line
          </Link>
        </div>
      )}
    </div>
  );
}
