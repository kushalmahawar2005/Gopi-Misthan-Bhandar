'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { fetchProducts, fetchCategories, PaginatedProductResponse } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ProductListCard from '@/components/ProductListCard';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { ProductGridSkeleton } from '@/components/SkeletonLoaders';
import Pagination from '@/components/Pagination';
import { FiGrid, FiList, FiChevronDown, FiX, FiFilter, FiCheck } from 'react-icons/fi';
import { Product, Category } from '@/types';

type SortOption = 'default' | 'price-low' | 'price-high' | 'name';

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);

  const normalizeCategorySlug = (value: string) => {
    if (value === 'bakery-items') return 'bakery';
    return value;
  };

  // Sync state with URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    setSearchQuery(search);
    
    const rawCategory = searchParams.get('category') || 'all';
    const category = normalizeCategorySlug(rawCategory);

    if (rawCategory !== category) {
      const params = new URLSearchParams(searchParams.toString());
      if (category === 'all') {
        params.delete('category');
      } else {
        params.set('category', category);
      }
      router.replace(`${pathname}?${params.toString()}`);
      return;
    }

    setSelectedCategory(category);
    
    const subcategory = searchParams.get('subcategory') || 'all';
    setSelectedSubCategory(subcategory);
    
    const page = parseInt(searchParams.get('page') || '1');
    const sort = (searchParams.get('sort') as SortOption) || 'default';
    setSortBy(sort);

    loadProducts(page, category === 'all' ? undefined : category, subcategory === 'all' ? undefined : subcategory, search);
  }, [searchParams, router, pathname]);

  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    };
    loadCategories();
  }, []);

  const loadProducts = async (page: number, category?: string, subcategory?: string, search?: string) => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        page,
        limit: 12,
        category: category,
        subcategory: subcategory,
        search: search,
      }) as PaginatedProductResponse;

      if (data && data.products) {
        setProducts(data.products);
        setPagination({
          totalCount: data.totalCount,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
        });

        if (data.products.length > 0 && maxPrice === 10000) {
          const max = Math.max(...data.products.map(p => p.price));
          const roundedMax = Math.ceil(max / 1000) * 1000;
          setMaxPrice(roundedMax);
          setPriceRange([0, roundedMax]);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (updates: { category?: string; subcategory?: string; search?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    
    if (updates.category) {
      if (updates.category === 'all') params.delete('category');
      else params.set('category', updates.category);
      params.delete('subcategory');
    }
    
    if (updates.subcategory) {
      if (updates.subcategory === 'all') params.delete('subcategory');
      else params.set('subcategory', updates.subcategory);
    }

    if (updates.search !== undefined) {
      if (!updates.search) params.delete('search');
      else params.set('search', updates.search);
    }

    if (updates.sort) {
      if (updates.sort === 'default') params.delete('sort');
      else params.set('sort', updates.sort);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const processedProducts = useMemo(() => {
    let result = [...products];
    result = result.filter(product => product.price >= priceRange[0] && product.price <= priceRange[1]);
    
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  }, [products, priceRange, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  const hasActiveFilters = sortBy !== 'default' || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />

      {/* --- MOBILE ONLY: HORIZONTAL CHIPS --- */}
      <div className="lg:hidden sticky top-[55px] z-40 bg-white border-b border-gray-100 pt-3 pb-2">
        <div className="flex items-center gap-3 overflow-x-auto px-4 sm:px-6 no-scrollbar whitespace-nowrap">
          <button onClick={() => handleFilterChange({ category: 'all' })} className={`px-5 py-2.5 rounded-full text-[11px] sm:text-[12px] font-bold uppercase transition-all border ${selectedCategory === 'all' ? 'bg-[#FE8E02] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-400'}`}>All Items</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => handleFilterChange({ category: c.slug })} className={`px-5 py-2.5 rounded-full text-[11px] sm:text-[12px] font-bold uppercase transition-all border ${selectedCategory === c.slug ? 'bg-[#FE8E02] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-400'}`}>{c.name}</button>
          ))}
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 py-6 sm:py-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* --- DESKTOP SIDEBAR (Matches 2nd Image) --- */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
             <div className="sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Filters</h2>
                <div className="mb-10">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Categories</h3>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleFilterChange({ category: 'all' })} className={`text-left px-4 py-3 rounded-lg text-sm transition-all ${selectedCategory === 'all' ? 'bg-[#FE8E02] text-white font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>All Products ({pagination.totalCount})</button>
                    {categories.map(cat => (
                      <button key={cat.id} onClick={() => handleFilterChange({ category: cat.slug })} className={`text-left px-4 py-3 rounded-lg text-sm transition-all ${selectedCategory === cat.slug ? 'bg-[#FE8E02] text-white font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{cat.name}</button>
                    ))}
                  </div>
                </div>
                
                <div>
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Price Range</h3>
                   <div className="flex gap-2 items-center">
                     <input type="number" value={priceRange[0]} onChange={e => setPriceRange([parseInt(e.target.value)||0, priceRange[1]])} className="w-full p-2 border border-gray-200 rounded-lg text-xs" />
                     <span>-</span>
                     <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)||maxPrice])} className="w-full p-2 border border-gray-200 rounded-lg text-xs" />
                   </div>
                   <button onClick={() => setPriceRange([0, maxPrice])} className="mt-4 text-xs text-primary-red font-bold underline">Reset Price</button>
                </div>
             </div>
          </aside>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="flex-1">
            
            {/* --- DESKTOP SUBCATEGORY PILLS (Matches 2nd Image) --- */}
            {selectedCategory !== 'all' && (() => {
               const current = categories.find(c => c.slug === selectedCategory);
               if (!current?.subCategories?.length) return null;
               return (
                 <div className="mb-8 flex flex-wrap gap-2">
                    <button onClick={() => handleFilterChange({ subcategory: 'all' })} className={`px-6 py-2 rounded-full border text-xs font-bold transition-all ${selectedSubCategory === 'all' ? 'bg-[#FE8E02] border-[#FE8E02] text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>All</button>
                    {current.subCategories.map(sub => (
                      <button key={sub.slug} onClick={() => handleFilterChange({ subcategory: sub.slug })} className={`px-6 py-2 rounded-full border text-xs font-bold transition-all ${selectedSubCategory === sub.slug ? 'bg-[#FE8E02] border-[#FE8E02] text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>{sub.name}</button>
                    ))}
                 </div>
               );
            })()}

            {/* TOOLBAR */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {processedProducts.length} results</span>
               <div className="flex items-center gap-4">
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="hidden md:block bg-white border border-gray-200 p-2 rounded-xl text-xs font-bold outline-none">
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className="flex bg-gray-50 p-1 rounded-xl">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white text-[#FE8E02] shadow-sm' : 'text-gray-400'}`}><FiGrid size={18} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white text-[#FE8E02] shadow-sm' : 'text-gray-400'}`}><FiList size={18} /></button>
                  </div>
               </div>
            </div>

            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : processedProducts.length === 0 ? (
              <div className="py-20 text-center bg-gray-50 rounded-3xl font-bold text-gray-400 uppercase tracking-widest">No products found</div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8' : 'space-y-6'}>
                  {processedProducts.map(p => viewMode === 'grid' ? <ProductCard key={p.id} product={p} /> : <ProductListCard key={p.id} product={p} />)}
                </div>
                <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE FILTER FAB --- */}
      <button onClick={() => setShowBottomSheet(true)} className="lg:hidden fixed bottom-6 right-6 bg-gray-900 text-white p-4 rounded-2xl shadow-xl z-50 flex items-center gap-3">
        <div className="relative"><FiFilter className="w-5 h-5" />{hasActiveFilters && <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FE8E02] border-2 border-gray-900 rounded-full" />}</div>
        <span className="text-sm font-bold uppercase tracking-wider">Filter & Sort</span>
      </button>

      {/* --- BOTTOM SHEET (Mobile) --- */}
      {showBottomSheet && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[100]" onClick={() => setShowBottomSheet(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-[101] rounded-t-[32px] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
            <h3 className="text-xl font-bold mb-8">Filters</h3>
            <div className="space-y-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">SortBy</p>
                <div className="grid grid-cols-1 gap-2">
                  {sortOptions.map(o => <button key={o.value} onClick={() => {setSortBy(o.value); setShowBottomSheet(false);}} className={`p-4 rounded-2xl border text-left font-bold text-sm ${sortBy === o.value ? 'bg-orange-50 border-[#FE8E02] text-[#FE8E02]' : 'border-gray-100'}`}>{o.label}</button>)}
                </div>
              </div>
              <button onClick={() => setShowBottomSheet(false)} className="w-full bg-[#FE8E02] text-white py-4 rounded-2xl font-bold">Apply Results</button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#FE8E02] border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}