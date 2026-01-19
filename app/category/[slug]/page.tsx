'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCategoryBySlug, fetchProducts, fetchCategories } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ProductListCard from '@/components/ProductListCard';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi';
import { Product, Category } from '@/types';

type SortOption = 'default' | 'price-low' | 'price-high' | 'name';

function CategoryContent() {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      const [categoryData, allCategories] = await Promise.all([
        fetchCategoryBySlug(slug),
        fetchCategories(),
      ]);
      setCategory(categoryData);
      setCategories(allCategories);

      // Fetch products: category + subcategories
      let allProducts: Product[] = [];

      // Fetch main category products
      try {
        const categoryProducts = await fetchProducts({ category: slug });
        allProducts = [...categoryProducts];
      } catch (error) {
        console.error('Error fetching category products:', error);
      }

      // Fetch subcategory products if category has subcategories
      if (categoryData && categoryData.subCategories && categoryData.subCategories.length > 0) {
        try {
          const subcategoryProductsPromises = categoryData.subCategories.map(async (sub: any) => {
            try {
              return await fetchProducts({ category: sub.slug });
            } catch (error) {
              console.error(`Error fetching subcategory ${sub.slug} products:`, error);
              return [];
            }
          });

          const subcategoryProductsArrays = await Promise.all(subcategoryProductsPromises);
          // Flatten and add to allProducts
          subcategoryProductsArrays.forEach(subProducts => {
            allProducts = [...allProducts, ...subProducts];
          });
        } catch (error) {
          console.error('Error fetching subcategory products:', error);
        }
      }

      // Remove duplicates based on product ID
      const uniqueProducts = allProducts.filter((product, index, self) =>
        index === self.findIndex((p) => p.id === product.id)
      );

      setProducts(uniqueProducts);

      // Fetch product counts for each category (including subcategories)
      const counts: Record<string, number> = {};
      await Promise.all(
        allCategories.map(async (cat) => {
          try {
            let catProducts = await fetchProducts({ category: cat.slug });

            // Also include subcategory products in count
            if (cat.subCategories && cat.subCategories.length > 0) {
              const subcategoryProductsPromises = cat.subCategories.map(async (sub: any) => {
                try {
                  return await fetchProducts({ category: sub.slug });
                } catch (error) {
                  return [];
                }
              });
              const subcategoryProductsArrays = await Promise.all(subcategoryProductsPromises);
              subcategoryProductsArrays.forEach(subProducts => {
                catProducts = [...catProducts, ...subProducts];
              });

              // Remove duplicates
              catProducts = catProducts.filter((product, index, self) =>
                index === self.findIndex((p) => p.id === product.id)
              );
            }

            counts[cat.slug] = catProducts.length;
          } catch (error) {
            counts[cat.slug] = 0;
          }
        })
      );
      setCategoryProductCounts(counts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter - only search in product name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchQuery, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <Navigation />
        <Cart />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <Navigation />
        <Cart />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-3xl font-bold font-geom mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${pathname.startsWith('/category/') ? 'pt-[72px] md:pt-[88px]' : ''}`}>
      <Header />
      <Navigation />
      <Cart />

      {/* Categories List Section */}
      <div className="w-full bg-[#f7db9d] py-6 md:py-8 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 md:gap-6 md:justify-center" style={{ width: 'max-content', minWidth: '100%' }}>
          {categories.map((cat) => {
            const isActive = cat.slug === slug;
            const productCount = categoryProductCounts[cat.slug] || 0;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                ref={isActive ? (el) => {
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }
                } : null}
                className={`flex-shrink-0 flex flex-col items-center bg-white rounded-xl overflow-hidden transition-all ${isActive
                  ? 'ring-4 ring-primary-red shadow-xl scale-105'
                  : 'hover:shadow-lg'
                  }`}
                style={{ width: '150px', minWidth: '150px' }}
              >
                {/* Category Image */}
                <div className={`relative w-full aspect-square overflow-hidden ${isActive ? 'bg-primary-red' : 'bg-gray-100'
                  }`}>
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>

                {/* Category Info */}
                <div className="w-full p-3 bg-white">
                  <h3 className={`text-sm font-bold text-center mb-1 ${isActive ? 'text-primary-red' : 'text-gray-800'
                    }`}>
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-600 text-center">
                    {productCount} {productCount === 1 ? 'Product' : 'Products'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="w-full px-4 py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search - Desktop Only */}
          <div className="hidden md:flex flex-1 w-full md:w-auto">
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
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sort and View Toggle */}
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${sortBy === option.value ? 'bg-primary-red text-white' : 'text-gray-700'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-red text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-red text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredAndSortedProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="w-full px-4 py-8 md:py-12">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">No products found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5'
                : 'space-y-4'
            }
          >
            {filteredAndSortedProducts.map((product) =>
              viewMode === 'grid' ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <ProductListCard key={product.id} product={product} />
              )
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
      </div>
    }>
      <CategoryContent />
    </Suspense>
  );
}
