'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { categories, getProductsByCategory, getAllProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi';

type SortOption = 'default' | 'price-low' | 'price-high' | 'name';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const category = categories.find(cat => cat.slug === slug);
  const allProductsInCategory = getProductsByCategory(slug);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProductsInCategory];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return products;
  }, [allProductsInCategory, searchQuery, sortBy]);

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <Navigation />
        <Cart />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-3xl font-bold font-serif mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />

      {/* Category Header */}
      <div className="bg-gradient-to-r from-primary-red to-primary-darkRed py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4">
            {category.name}
          </h1>
          <p className="text-lg text-gray-100 max-w-2xl mx-auto">
            Explore our wide collection of {category.name.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* View Mode and Sort */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-red text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                aria-label="Grid view"
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-red text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                aria-label="List view"
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                <FiChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSortMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSortMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          sortBy === option.value ? 'bg-primary-red/10 text-primary-red font-bold' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredAndSortedProducts.length} of {allProductsInCategory.length} products
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">No products found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'
                : 'grid grid-cols-1 gap-6'
            }
          >
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
