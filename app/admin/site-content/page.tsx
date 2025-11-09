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

  const sections = ['about', 'hero', 'footer', 'header'];
  const existingSections = contents.map((c) => c.section);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-serif">Site Content</h1>
          <p className="text-gray-600 mt-1">Manage your website content sections</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {sections.map((section) => {
            const existingContent = contents.find((c) => c.section === section);
            return (
              <Link
                key={section}
                href={existingContent ? `/admin/site-content/${existingContent._id}` : `/admin/site-content/new?section=${section}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors text-sm font-medium"
              >
                <FiPlus size={16} />
                {existingContent ? 'Edit' : 'Add'} {section.charAt(0).toUpperCase() + section.slice(1)}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Subtitle
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contents.map((content) => (
                <tr key={content._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary-brown capitalize">{content.section}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-primary-brown">{content.title || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{content.subtitle || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(content._id, content.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        content.isActive
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      } hover:opacity-80 transition-opacity`}
                    >
                      {content.isActive ? (
                        <span className="flex items-center gap-1">
                          <FiEye size={12} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <FiEyeOff size={12} /> Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/site-content/${content._id}`}
                        className="p-2 text-primary-red hover:bg-red-50 rounded transition-colors"
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(content._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No site content found. Click "Add" to create content for each section.</p>
          </div>
        )}
      </div>
    </div>
  );
}
