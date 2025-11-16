'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

const iconOptions = [
  { value: 'award', label: 'Award' },
  { value: 'heart', label: 'Heart' },
  { value: 'users', label: 'Users' },
  { value: 'star', label: 'Star' },
  { value: 'trophy', label: 'Trophy' },
];

export default function EditSiteContent() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    section: 'about',
    title: '',
    subtitle: '',
    description: '',
    mainImage: '',
    images: [] as string[],
    stats: [] as { icon: string; value: string; label: string }[],
    content: {
      heading: '',
      text: '',
    },
    giftsContent: {
      heading: '',
      text: '',
    },
    isActive: true,
  });

  useEffect(() => {
    fetchContent();
  }, [params.id]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/site-content/${params.id}`);
      const data = await response.json();
      if (data.success) {
        const content = data.data;
        setFormData({
          section: content.section,
          title: content.title || '',
          subtitle: content.subtitle || '',
          description: content.description || '',
          mainImage: content.mainImage || '',
          images: content.images || [],
          stats: content.stats || [],
          content: content.content || { heading: '', text: '' },
          giftsContent: content.giftsContent || { heading: '', text: '' },
          isActive: content.isActive !== undefined ? content.isActive : true,
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean up empty fields
      const cleanedData = {
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ''),
        stats: formData.stats.filter((stat) => stat.value && stat.label),
      };

      const response = await fetch(`/api/site-content/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/admin/site-content');
      } else {
        alert('Error updating content: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating content:', error);
      alert('Error updating content');
    } finally {
      setSaving(false);
    }
  };

  const addStat = () => {
    setFormData({
      ...formData,
      stats: [...formData.stats, { icon: 'award', value: '', label: '' }],
    });
  };

  const removeStat = (index: number) => {
    setFormData({
      ...formData,
      stats: formData.stats.filter((_, i) => i !== index),
    });
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...formData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData({ ...formData, stats: newStats });
  };

  const addImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ''],
    });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-brown font-serif">Edit Site Content - {formData.section.toUpperCase()}</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
        >
          <FiX size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* For marquee section, show simplified form */}
        {formData.section === 'marquee' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
              <input
                type="text"
                value={formData.section}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marquee Text *</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                placeholder="Enter marquee text (e.g., 🎉 Special Offer: Get 10% OFF on your first order! Use code FIRSTBUY10 🎉)"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                This text will scroll from right to left in the top banner. You can include emojis and special offers.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Show on website</span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                When unchecked, the marquee line will be hidden from the website.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                <input
                  type="text"
                  value={formData.section}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Image URL</label>
                <input
                  type="url"
                  value={formData.mainImage}
                  onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
              </div>
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
          </>
        )}

        {/* Content Section - Hide for marquee */}
        {formData.section !== 'marquee' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">Main Content</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
              <input
                type="text"
                value={formData.content.heading}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, heading: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
              <textarea
                rows={4}
                value={formData.content.text}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, text: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
            </div>
          </div>
        </div>
        )}

        {/* Gifts Content Section - Hide for marquee */}
        {formData.section !== 'marquee' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">Gifts Content</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
              <input
                type="text"
                value={formData.giftsContent.heading}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    giftsContent: { ...formData.giftsContent, heading: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
              <textarea
                rows={4}
                value={formData.giftsContent.text}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    giftsContent: { ...formData.giftsContent, text: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
              />
            </div>
          </div>
        </div>
        )}

        {/* Stats Section - Hide for marquee */}
        {formData.section !== 'marquee' && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Stats</h3>
            <button
              type="button"
              onClick={addStat}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
            >
              <FiPlus size={16} />
              Add Stat
            </button>
          </div>
          <div className="space-y-4">
            {formData.stats.map((stat, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                <select
                  value={stat.icon}
                  onChange={(e) => updateStat(index, 'icon', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                >
                  {iconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Value (e.g., 56+)"
                  value={stat.value}
                  onChange={(e) => updateStat(index, 'value', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
                <input
                  type="text"
                  placeholder="Label (e.g., Years of Excellence)"
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
                <button
                  type="button"
                  onClick={() => removeStat(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FiTrash2 size={16} className="mx-auto" />
                </button>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Additional Images - Hide for marquee */}
        {formData.section !== 'marquee' && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Additional Images</h3>
            <button
              type="button"
              onClick={addImage}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
            >
              <FiPlus size={16} />
              Add Image
            </button>
          </div>
          <div className="space-y-4">
            {formData.images.map((img, index) => (
              <div key={index} className="flex gap-4">
                <input
                  type="url"
                  placeholder="Image URL"
                  value={img}
                  onChange={(e) => updateImage(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Active toggle - Only show for non-marquee sections */}
        {formData.section !== 'marquee' && (
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-red text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-darkRed transition-colors disabled:opacity-50"
          >
            <FiSave size={20} />
            {saving ? 'Saving...' : 'Update Content'}
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

