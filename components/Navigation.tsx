'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiSearch,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiSettings,
  FiHeart,
} from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { Category } from '@/types';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // mobile modal
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false); // for underline color animation
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { getWishlistCount } = useWishlist();
  const cartItemsCount = getTotalItems();
  const wishlistCount = getWishlistCount();

  // Search results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  // Fetch categories with subcategories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length >= 2) {
        setSearchLoading(true);
        try {
          const results = await fetchProducts({ search: searchQuery, limit: 8 });
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error('Error searching products:', error);
          setSearchResults([]);
          setShowDropdown(true);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setSearchLoading(false);
        setShowDropdown(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 400); // debounce 400ms
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get category by slug from fetched categories
  const getCategoryBySlug = (slug: string): Category | undefined => {
    return categories.find(cat => cat.slug === slug);
  };

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'SWEETS', href: '/category/sweets', slug: 'sweets' },
    { label: 'DRY FRUIT', href: '/category/dry-fruit', slug: 'dry-fruit' },
    { label: 'BACKERY ITEMS', href: '/category/bakery', slug: 'bakery' },
    { label: 'NAMKEEN', href: '/category/namkeen', slug: 'namkeen' },
    { label: 'SAVOURY SNACKS', href: '/category/savoury', slug: 'savoury' },
    { label: 'GIFTING', href: '/category/gifting', slug: 'gifting' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/category/')) {
      return pathname === href || pathname.startsWith(href);
    }
    return pathname.includes(href.replace('#', ''));
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(href);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white w-full border-b border-gray-200 shadow-sm sticky top-0 z-50">
        

        {/* Header row */}
        <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-2 md:py-4 relative">
          {/* Left: Search (desktop) + hamburger on mobile */}
          <div className="flex items-center gap-3 flex-1 md:flex-initial">
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-black p-2 hover:text-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>

            {/* Desktop search (with border and radius) */}
            <div className="hidden md:flex items-center w-full max-w-md mt-4 relative ml-4 md:ml-6">
              <div className="relative w-full">
                {/* Input + icon-button aligned */}
                <div className="relative flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      setIsFocused(true);
                      if (searchQuery.trim().length >= 2) setShowDropdown(true);
                    }}
                    onBlur={() => {
                      setIsFocused(false);
                    }}
                    className={`w-full pr-10 py-2.5 pl-4 text-md bg-white outline-none border transition-colors rounded-lg placeholder-gray-500 ${
                      isFocused 
                        ? 'border-primary-red focus:ring-2 focus:ring-primary-red focus:border-primary-red' 
                        : 'border-gray-300 focus:border-primary-red focus:ring-2 focus:ring-primary-red'
                    }`}
                    aria-label="Search products"
                  />
                  {/* Search button on the right */}
                  <button
                    onClick={() => {
                      if (searchQuery.trim().length >= 2) {
                        router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                        setShowDropdown(false);
                        setSearchQuery('');
                      } else {
                        searchInputRef.current?.focus();
                      }
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Search"
                  >
                    <FiSearch className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
                  >
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
                        <div>Searching...</div>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">
                        No products found for "<span className="font-medium">{searchQuery}</span>"
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {searchResults.slice(0, 6).map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            onClick={() => {
                              setShowDropdown(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                              <Image
                                src={product.image || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium font-geom line-clamp-1">{product.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                            </div>
                            <div className="text-sm font-bold text-red-600">₹{product.price}</div>
                          </Link>
                        ))}
                        {searchResults.length > 6 && (
                          <Link
                            href={`/products?search=${encodeURIComponent(searchQuery)}`}
                            onClick={() => {
                              setShowDropdown(false);
                              setSearchQuery('');
                            }}
                            className="block text-center text-red-600 font-medium py-3 hover:bg-gray-50 transition-colors"
                          >
                            View all {searchResults.length} results
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 py-2 md:py-3 mt-2">
            <div className="relative w-20 h-12 md:w-32 md:h-16 lg:w-40 lg:h-20">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 80px, (max-width: 1024px) 144px, 176px"
                priority
              />
            </div>
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <button
              onClick={() => {
                // Dispatch custom event to open enquiry modal
                const event = new CustomEvent('open-wedding-enquiry');
                window.dispatchEvent(event);
              }}
              className="hidden md:flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-amber-800 transition-colors text-sm font-medium"
            >
              Bulk Enquiry
            </button>

            {isAuthenticated && user?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="hidden md:flex relative p-2 hover:text-gray-700 transition-colors"
                aria-label="Admin Panel"
                title="Admin Panel"
              >
                <FiSettings className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/profile');
                } else {
                  router.push('/login');
                }
              }}
              className="relative p-2 hover:text-gray-700 transition-colors"
              aria-label={isAuthenticated ? 'Profile' : 'Login'}
              title={isAuthenticated ? user?.name || 'Profile' : 'Login'}
            >
              <FiUser className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <button
              onClick={() => router.push('/wishlist')}
              className="relative p-2 hover:text-gray-700 transition-colors"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <FiHeart className="w-5 h-5 md:w-6 md:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={openCart}
              className="relative p-2 hover:text-gray-700 transition-colors"
              aria-label="Shopping cart"
              title="Shopping cart"
            >
              <div className="relative w-5 h-5 md:w-6 md:h-6">
                <Image src="/cart-icon.png" alt="Cart" fill className="object-contain" />
              </div>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Bottom row: center nav links on desktop */}
        <div className="hidden md:flex items-center justify-center gap-4 lg:gap-6 xl:gap-8 px-4 py-3">
          {navItems.map((item) => {
            const category = item.slug ? getCategoryBySlug(item.slug) : null;
            const hasSubcategories = category?.subCategories && category.subCategories.length > 0;
            
            return (
              <div 
                key={item.label} 
                className="relative"
                onMouseEnter={() => hasSubcategories ? setHoveredCategory(item.slug || null) : null}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button
                  onClick={() => handleNavClick(item.href)}
                  className={`text-xs md:text-sm font-geom tracking-wider transition-colors font-medium flex items-center gap-1 py-2 relative ${
                    isActive(item.href) ? 'text-red-600' : 'text-black hover:text-red-600'
                  }`}
                >
                  {item.label}
                  {/* Underline on hover */}
                  <span 
                    className={`absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-300 ${
                      hoveredCategory === item.slug || isActive(item.href)
                        ? 'w-full opacity-100'
                        : 'w-0 opacity-0'
                    }`}
                  />
                </button>
                
                {/* Subcategories Dropdown */}
                {hasSubcategories && hoveredCategory === item.slug && (
                  <div 
                    ref={categoryDropdownRef}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 bg-transparent z-50"
                    onMouseEnter={() => setHoveredCategory(item.slug || null)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px] py-2">
                    {/* All Category Link */}
                    <Link
                      href={item.href}
                      onClick={() => setHoveredCategory(null)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium"
                    >
                      All {item.label}
                    </Link>
                    
                    {/* Divider */}
                    {category.subCategories && category.subCategories.length > 0 && (
                      <div className="border-t border-gray-200 my-1" />
                    )}
                    
                    {/* Subcategories */}
                    {category.subCategories?.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/category/${item.slug}?subcategory=${subcategory.slug}`}
                        onClick={() => setHoveredCategory(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />  
          <div className="fixed top-0 left-0 h-full w-3/4 max-w-sm bg-white shadow-2xl z-50 md:hidden overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-amber-700 font-geom">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            {/* Mobile Search Bar - At the very top */}
        <div className="md:hidden w-full px-4 py-3 border-b border-gray-200 bg-white">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                if (searchQuery.trim().length >= 2) setShowDropdown(true);
              }}
              onBlur={() => {
                setIsFocused(false);
              }}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
              aria-label="Search products"
            />
            <button
              onClick={() => {
                if (searchQuery.trim().length >= 2) {
                  router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                  setShowDropdown(false);
                  setSearchQuery('');
                } else {
                  searchInputRef.current?.focus();
                }
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
              aria-label="Search"
            >
              <FiSearch className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Mobile Search Dropdown */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
              >
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
                    <div>Searching...</div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    No products found for "<span className="font-medium">{searchQuery}</span>"
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {searchResults.slice(0, 6).map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium font-geom line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                        </div>
                        <div className="text-sm font-bold text-red-600">₹{product.price}</div>
                      </Link>
                    ))}
                    {searchResults.length > 6 && (
                      <Link
                        href={`/products?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                        className="block text-center text-red-600 font-medium py-3 hover:bg-gray-50 transition-colors"
                      >
                        View all {searchResults.length} results
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

            <div className="flex flex-col py-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    handleNavClick(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left w-full px-6 py-3 text-sm font-general-sans font-[500] tracking-wider transition-colors border-l-4 ${
                    isActive(item.href)
                      ? 'text-red-600 bg-red-50 border-red-600'
                      : 'text-black hover:text-red-600 hover:bg-gray-50 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {isAuthenticated && user?.role === 'admin' && (
                <button
                  onClick={() => {
                    router.push('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-6 py-3 text-sm font-geom tracking-wider transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 border-l-4 border-blue-600 flex items-center gap-2 font-semibold"
                >
                  <FiSettings className="w-4 h-4" />
                  Admin Panel
                </button>
              )}

              <button
                onClick={() => {
                  router.push(isAuthenticated ? '/profile' : '/login');
                  setIsMobileMenuOpen(false);
                }}
                className="px-6 py-3 text-sm font-geom tracking-wider transition-colors text-black hover:text-red-600 hover:bg-gray-50 flex items-center gap-2 border-l-4 border-transparent"
              > 
                <FiUser className="w-4 h-4" />
                {isAuthenticated ? 'Profile' : 'Login'}
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    router.push('/');
                  }}
                  className="px-6 py-3 text-sm font-geom tracking-wider transition-colors text-black hover:text-red-600 hover:bg-gray-50 text-left flex items-center gap-2 w-full border-l-4 border-transparent"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Search Modal for mobile */}
      {isSearchOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 border-b border-gray-200 pb-4 mb-4">
                <FiSearch className="w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for sweets, snacks, namkeen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {searchQuery.trim().length < 2 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Type at least 2 characters to search</p>
                  </div>
                ) : searchLoading ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                    <p>Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No products found for "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try a different search term</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 mb-2">
                      Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                    </div>
                    {searchResults.slice(0, 6).map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium font-geom line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                          <p className="text-sm font-bold text-red-600 mt-1">₹{product.price}</p>
                        </div>
                      </Link>
                    ))}
                    {searchResults.length > 6 && (
                      <Link
                        href={`/products?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="block text-center text-red-600 font-medium py-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        View all {searchResults.length} results
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {searchQuery.trim().length >= 2 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-red-700 transition-colors"
                  >
                    View All Results
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;
