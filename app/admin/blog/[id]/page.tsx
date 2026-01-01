'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiX } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

export default function EditBlog() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    content: '',
    slug: '',
    publishedDate: new Date().toISOString().split('T')[0],
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBlog();
  }, [params.id]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blog/${params.id}?t=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        const blog = data.data;
        setFormData({
          title: blog.title || '',
          description: blog.description || '',
          imageUrl: blog.imageUrl || '',
          content: blog.content || '',
          slug: blog.slug || '',
          publishedDate: blog.publishedDate 
            ? new Date(blog.publishedDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          order: blog.order || 0,
          isActive: blog.isActive !== undefined ? blog.isActive : true,
        });
      }
    } catch (error) {
      console.error('Error fetching Blog post:', error);
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
    
    if (!formData.slug || !formData.slug.trim()) {
      alert('Please enter a slug');
      return;
    }
    
    setSaving(true);

    try {
      const updatePayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim(),
        content: formData.content.trim(),
        slug: formData.slug.trim(),
        publishedDate: new Date(formData.publishedDate),
        order: Number(formData.order) || 0,
        isActive: Boolean(formData.isActive),
      };
      
      const response = await fetch(`/api/blog/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Blog post updated successfully!');
        router.push('/admin/blog');
      } else {
        alert('Error updating Blog post: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating Blog post:', error);
      alert('Error updating Blog post. Please try again.');
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
          <h1 className="text-3xl font-bold text-primary-brown font-general-sans">Edit Blog Post</h1>
          <p className="text-gray-600 mt-1">Update blog post details</p>
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
                folder="blog"
                label="Blog Image"
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Published Date *</label>
              <input
                type="date"
                required
                value={formData.publishedDate}
                onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                placeholder="Full blog post content (optional)"
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
              {saving ? 'Saving...' : 'Update Blog Post'}
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

