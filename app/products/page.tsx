'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllProducts, categories } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import Link from 'next/link';
import { FiGrid, FiList, FiChevronDown, FiX, FiFilter } from 'react-icons/fi';
import { Product } from '@/types';

type SortOption = 'default' | 'price-low' | 'price-high' | 'name';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get search query from URL
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const allProducts = getAllProducts();

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProducts];

    // Category filter
    if (selectedCategory !== 'all') {
      products = products.filter(product => product.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
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
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = { all: allProducts.length };
    categories.forEach(cat => {
      counts[cat.slug] = allProducts.filter(p => p.category === cat.slug).length;
    });
    return counts;
  }, [allProducts]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-red to-primary-darkRed py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4">
            All Products
          </h1>
          <p className="text-lg text-gray-100 max-w-2xl mx-auto">
            Discover our complete collection of traditional Indian sweets, snacks, and namkeen
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold font-serif mb-4">Filters</h2>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-bold font-serif mb-3">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-primary-red text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    All Products ({categoryCounts.all})
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.slug
                          ? 'bg-primary-red text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      {category.name} ({categoryCounts[category.slug] || 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
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
              <div className="text-sm text-gray-600">
                Showing {filteredAndSortedProducts.length} of {allProducts.length} products
                {selectedCategory !== 'all' && (
                  <span className="ml-2">
                    in <span className="font-bold capitalize">{selectedCategory}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600 mb-4">No products found</p>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="bg-primary-red text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-darkRed transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5'
                    : 'grid grid-cols-1 gap-6'
                }
              >
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Header />
        <Navigation />
        <Cart />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
