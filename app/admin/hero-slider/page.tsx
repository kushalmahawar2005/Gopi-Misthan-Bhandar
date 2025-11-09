'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import Image from 'next/image';

interface HeroSlide {
  _id: string;
  title?: string;
  image: string;
  order: number;
  isActive: boolean;
}

export default function AdminHeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/hero-slider?all=true');
      const data = await response.json();
      if (data.success) {
        setSlides(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching hero slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const response = await fetch(`/api/hero-slider/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setSlides(slides.filter((slide) => slide._id !== id));
      } else {
        alert('Error deleting slide: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
      alert('Error deleting slide');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/hero-slider/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setSlides(
          slides.map((slide) =>
            slide._id === id ? { ...slide, isActive: !currentStatus } : slide
          )
        );
      } else {
        alert('Error updating slide status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating slide status:', error);
      alert('Error updating slide status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hero slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-brown font-serif">Hero Slider</h1>
          <p className="text-gray-600 mt-1">Manage your homepage hero slider slides</p>
        </div>
        <Link
          href="/admin/hero-slider/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors font-medium"
        >
          <FiPlus size={18} />
          <span>Add New Slide</span>
        </Link>
      </div>

      {/* Slides Grid */}
      {slides.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No hero slides found.</p>
          <Link
            href="/admin/hero-slider/new"
            className="inline-block text-primary-red hover:underline font-medium"
          >
            Add your first slide
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide) => (
            <div
              key={slide._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Slide Image */}
              <div className="relative h-48 w-full bg-gray-100">
                <Image
                  src={slide.image}
                  alt={slide.title || 'Hero slide'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {!slide.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">Inactive</span>
                  </div>
                )}
              </div>

              {/* Slide Info */}
              <div className="p-4">
                <div className="mb-2">
                  {slide.title && (
                    <h3 className="text-lg font-semibold text-primary-brown font-serif mb-1">
                      {slide.title}
                    </h3>
                  )}
                </div>
                <p className="text-xs text-gray-400">Order: {slide.order}</p>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleActive(slide._id, slide.isActive)}
                  className={`p-2 rounded transition-colors ${
                    slide.isActive
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={slide.isActive ? 'Deactivate' : 'Activate'}
                >
                  {slide.isActive ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                </button>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/hero-slider/${slide._id}`}
                    className="p-2 text-primary-red hover:bg-red-50 rounded transition-colors"
                    title="Edit"
                  >
                    <FiEdit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(slide._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

