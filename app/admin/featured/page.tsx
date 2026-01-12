'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { FiSave, FiSearch } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import type { Category, Product } from '@/types';

interface TrendingBannerResponse {
  _id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  categorySlug?: string;
  productId: string;
  delaySeconds?: number;
  isActive: boolean;
}

export default function FeaturedPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bannerId, setBannerId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [delaySeconds, setDelaySeconds] = useState(12);
  const [isActive, setIsActive] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, bannerRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/featured', { cache: 'no-store' }),
        ]);

        const catData = await catRes.json();
        if (catData.success && Array.isArray(catData.data)) {
          setCategories(
            catData.data.map((c: any) => ({
              id: c._id ? String(c._id) : c.id,
              name: c.name,
              slug: c.slug,
              image: c.image,
              description: c.description,
              subCategories: c.subCategories || [],
              order: c.order || 0,
              productsCount: c.productsCount,
            }))
          );
        }

        const bannerData = await bannerRes.json();
        if (bannerData.success && bannerData.data) {
          const b: TrendingBannerResponse = bannerData.data;
          setBannerId(b._id);
          setTitle(b.title || '');
          setSubtitle(b.subtitle || '');
          setImageUrl(b.imageUrl);
          setButtonText(b.buttonText || 'Shop Now');
          setDelaySeconds(b.delaySeconds || 12);
          setIsActive(b.isActive !== false);
          if (b.categorySlug) {
            setSelectedCategory(b.categorySlug);
          }
          if (b.productId) {
            setSelectedProductId(b.productId);
          }
        }
      } catch (error) {
        console.error('Error loading featured config:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      if (!selectedCategory) {
        setProducts([]);
        return;
      }
      try {
        const params = new URLSearchParams();
        params.append('category', selectedCategory);
        params.append('limit', '100');
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const mapped: Product[] = data.data.map((p: any) => ({
            id: p._id ? String(p._id) : p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image,
            images: Array.isArray(p.images) ? p.images : [],
            category: p.category,
            featured: p.featured,
            isPremium: p.isPremium,
            isClassic: p.isClassic,
            sizes: p.sizes,
            defaultWeight: p.defaultWeight,
            shelfLife: p.shelfLife,
            deliveryTime: p.deliveryTime,
            stock: p.stock,
            giftBoxSubCategory: p.giftBoxSubCategory,
            giftBoxSize: p.giftBoxSize,
          }));
          setProducts(mapped);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products for category:', error);
        setProducts([]);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !selectedProductId) {
      alert('Please upload a banner image and select a product.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bannerId || undefined,
          title,
          subtitle,
          imageUrl,
          buttonText,
          categorySlug: selectedCategory || undefined,
          productId: selectedProductId,
          delaySeconds: Number(delaySeconds) || 12,
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBannerId(data.data._id);
        alert('Trending banner saved successfully.');
      } else {
        alert('Error saving banner: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Error saving banner. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-height-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-red mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading What&apos;s Trending settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-brown font-general-sans">
          What&apos;s Trending Banner
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Configure a banner that will automatically appear to visitors after a few seconds and
          link directly to a product.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5 md:p-6 space-y-6">
          <h2 className="text-lg font-semibold text-primary-brown">Banner Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heading (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red text-sm"
                  placeholder="e.g. Today&apos;s Hot Pick"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subheading / Description (optional)
                </label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red text-sm"
                  placeholder="Short description to show over the banner image"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Show After (seconds)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(Number(e.target.value) || 12)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-red border-gray-300 rounded focus:ring-primary-red"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Banner active (show to visitors)
                </label>
              </div>
            </div>
            <div>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                label="Banner Image"
                required
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 md:p-6 space-y-6">
          <h2 className="text-lg font-semibold text-primary-brown">Linked Product</h2>
          <p className="text-sm text-gray-600">
            First choose a category, then pick a product. When customers click the banner, they
            will be taken to that product&apos;s detail page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedProductId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red text-sm bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products in this category..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red text-sm"
                  disabled={!selectedCategory}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
                {selectedCategory && filteredProducts.length === 0 && (
                  <div className="p-4 text-sm text-gray-500">
                    No products found for this category/search.
                  </div>
                )}
                {!selectedCategory && (
                  <div className="p-4 text-sm text-gray-500">
                    Select a category to see products.
                  </div>
                )}
                {selectedCategory &&
                  filteredProducts.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        selectedProductId === product.id ? 'bg-red-50' : ''
                      }`}
                    >
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.image && (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-brown truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">₹{product.price}</p>
                      </div>
                      <div className="ml-2">
                        <input
                          type="radio"
                          className="w-4 h-4 text-primary-red border-gray-300 focus:ring-primary-red"
                          checked={selectedProductId === product.id}
                          readOnly
                        />
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiSave size={16} />
            {saving ? 'Saving...' : 'Save Banner'}
          </button>
        </div>
      </form>
    </div>
  );
}

