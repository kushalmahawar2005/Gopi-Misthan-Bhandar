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
  FiShoppingBag,
  FiChevronDown,
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
    { label: 'SWEETS', href: '/products?category=sweets', slug: 'sweets' },
    { label: 'DRY FRUIT', href: '/products?category=dry-fruits', slug: 'dry-fruits' },
    { label: 'BAKERY ITEMS', href: '/products?category=bakery-items', slug: 'bakery-items' },
    { label: 'NAMKEEN', href: '/products?category=namkeen', slug: 'namkeen' },
    { label: 'SAVOURY SNACKS', href: '/products?category=savoury-snacks', slug: 'savoury-snacks' },
    { label: 'GIFTING', href: '/#gifting', slug: 'gifting' },
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

  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsScrolled(window.scrollY > 50);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;

        // Determine if we are scrolled enough to use compact mode
        setIsScrolled(currentScrollY > 120);

        // Ensure navbar is always visible when sticky
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        id="main-nav"
        className={`bg-white w-full border-b border-[#d6cec6] z-[9999] transition-all duration-500 ease-in-out sticky top-0 left-0 right-0 ${isVisible ? 'translate-y-0' : '-translate-y-full'
          } ${isScrolled ? 'py-1 md:py-2 shadow-md' : 'py-0'}`}
      >
        {/* Main Content Area */}
        <div className={`max-w-[1700px] mx-auto transition-all duration-500`}>
          {/* Row 1: Header/Main Row */}
          <div className={`flex items-center justify-between px-4 md:px-8 lg:px-12 relative transition-all duration-500 ${isScrolled ? 'h-[65px] md:h-[75px]' : 'h-[100px] md:h-[130px]'}`}>

            {/* Left Section: Bulk Enquiry (hides on scroll) / Space for Logo (on scroll) */}
            <div className="flex items-center gap-4 flex-1 md:flex-initial">
              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-[#8B4513] p-2 hover:opacity-70 transition-opacity"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>

              {/* Desktop: Bulk Enquiry - slides out on scroll */}
              <button
                onClick={() => {
                  const event = new CustomEvent('open-wedding-enquiry');
                  window.dispatchEvent(event);
                }}
                className={`hidden md:flex items-center gap-2 text-[#503223] hover:text-[#8B4513] transition-all duration-500 text-[16px] font-flama-condensed font-medium tracking-widest uppercase overflow-hidden whitespace-nowrap ${isScrolled ? 'w-0 opacity-0 -translate-x-10' : 'w-auto opacity-100 translate-x-0'
                  }`}
              >
                <div className="relative w-4 h-4">
                  <Image src="/market.png" alt="Cart" fill className="object-contain" />
                </div>
                <span>Bulk Enquiry</span>
              </button>
            </div>

            {/* Logo: Transitions from center to left */}
            <Link
              href="/"
              className={`absolute top-1/2 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-20 ${isScrolled
                ? 'left-4 md:left-8 lg:left-12 -translate-y-1/2 translate-x-0'
                : 'left-1/2 -translate-x-1/2 -translate-y-1/2'
                }`}
            >
              <div className={`relative transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isScrolled
                ? 'w-[75px] h-[46px] md:w-[95px] md:h-[58px]'
                : 'w-[106px] h-[66px] md:w-[138px] md:h-[74px] lg:w-[170px] lg:h-[90px]'
                }`}>
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 106px, (max-width: 1024px) 138px, 170px"
                  priority
                />
              </div>
            </Link>

            {/* Scrolled Navigation Items: Only visible on scroll in the center */}
            <div className={`hidden lg:flex items-center justify-center gap-5 xl:gap-8 transition-all duration-500 absolute left-1/2 -translate-x-1/2 ${isScrolled ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}>
              {navItems.map((item) => (
                <button
                  key={`scrolled-${item.label}`}
                  onClick={() => handleNavClick(item.href)}
                  className={`text-[13px] xl:text-[15px] font-flama-condensed tracking-[0.10em] uppercase transition-colors font-semibold py-2 hover:text-[#8B4513] whitespace-nowrap ${isActive(item.href) ? 'text-[#8B4513]' : 'text-[#503223]'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right Section: icons + Search */}
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
              {/* Desktop Search */}
              <div className="hidden md:flex items-center w-32 xl:w-44 relative">
                <div className="relative w-full">
                  <div className="relative flex items-center">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        setIsFocused(true);
                        if (searchQuery.trim().length >= 2) setShowDropdown(true);
                      }}
                      onBlur={() => setIsFocused(false)}
                      className={`w-full pr-8 py-1 text-[10px] tracking-widest bg-transparent outline-none border-b transition-colors placeholder-[#8a7e74] font-flama ${isFocused || isScrolled
                        ? 'border-[#8B4513] text-[#8B4513]'
                        : 'border-[#c4b8ad] text-[#5a4e44]'
                        }`}
                    />
                    <FiSearch
                      className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${isFocused || isScrolled ? 'text-[#8B4513]' : 'text-[#8a7e74]'
                        }`}
                      onClick={() => searchInputRef.current?.focus()}
                    />
                  </div>

                  {showDropdown && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[280px] max-h-80 overflow-y-auto"
                    >
                      {searchLoading ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8B4513] mx-auto"></div>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-xs text-gray-400">No results found</div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {searchResults.slice(0, 5).map((product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.id}`}
                              onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50"
                            >
                              <div className="relative w-10 h-10 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                                <Image src={product.image || '/placeholder.png'} alt={product.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-[#5a4e44] line-clamp-1">{product.name}</p>
                                <p className="text-[10px] text-gray-500">₹{product.price}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Icons */}
              <div className="flex items-center gap-1">
                {isAuthenticated && user?.role === 'admin' && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="p-1.5 text-[#8B4513] hover:opacity-70 transition-opacity"
                    title="Admin Panel"
                  >
                    <FiSettings className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    if (isAuthenticated) router.push('/profile');
                    else router.push('/login');
                  }}
                  className="p-1.5 text-[#8B4513] hover:opacity-70 transition-opacity"
                  title={isAuthenticated ? user?.name : 'Login'}
                >
                  <FiUser className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <button
                  onClick={() => router.push('/wishlist')}
                  className="relative p-1.5 text-[#8B4513] hover:opacity-70 transition-opacity"
                  title="Wishlist"
                >
                  <FiHeart className="w-5 h-5 md:w-6 md:h-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#8B4513] text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={openCart}
                  className="relative p-1.5 text-[#8B4513] hover:opacity-70 transition-opacity"
                  title="Shopping cart"
                >
                  <div className="relative w-5 h-5 md:w-6 md:h-6">
                    <Image src="/market.png" alt="Cart" fill className="object-contain" />
                  </div>
                  {cartItemsCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#8B4513] text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                      {cartItemsCount > 9 ? '9+' : cartItemsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Navigation Links (hides on scroll) */}
          <div className={`hidden md:flex items-center justify-center gap-8 lg:gap-10 xl:gap-12 px-4 py-3 transition-all duration-500 overflow-hidden ${isScrolled ? 'h-0 opacity-0 pointer-events-none' : 'h-auto opacity-100 pointer-events-auto'
            }`}>
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
                    className={`text-[11px] md:text-[19px] font-flama-condensed tracking-[0.12em] uppercase transition-colors font-semibold flex items-center gap-1.5 py-2 relative ${isActive(item.href) ? 'text-[#8B4513]' : 'text-[#503223] hover:text-[#8B4513]'
                      }`}
                  >
                    {item.label}
                    {hasSubcategories && (
                      <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${hoveredCategory === item.slug ? 'rotate-180' : ''}`} />
                    )}
                    {/* Underline on hover */}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-[#8B4513] transition-all duration-300 ${hoveredCategory === item.slug || isActive(item.href)
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
                            href={`/products?category=${item.slug}&subcategory=${subcategory.slug}`}
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
            <div className="md:hidden w-full px-4 py-3 border-b border-gray-200 bg-[#FFFFFF]">
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
                  className="w-full px-4 py-2 pr-10 border border-[#c4b8ad] bg-[#FFFFFF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B4513] text-sm text-[#5a4e44] placeholder-[#8a7e74]"
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
                  <FiSearch className="w-5 h-5 text-[#8B4513]" />
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
                  className={`text-left w-full px-6 py-4 text-xs font-flama-condensed font-[500] tracking-[0.15em] uppercase transition-colors border-l-4 ${isActive(item.href)
                    ? 'text-[#8B4513] bg-[#efe8e0] border-[#8B4513]'
                    : 'text-[#5a4e44] hover:text-[#8B4513] hover:bg-gray-50 border-transparent'
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
                className="px-6 py-4 text-xs font-flama tracking-[0.15em] uppercase transition-colors text-[#5a4e44] hover:text-[#8B4513] hover:bg-gray-50 flex items-center gap-3 border-l-4 border-transparent"
              >
                <FiUser className="w-4 h-4 text-[#8B4513]" />
                {isAuthenticated ? 'Profile' : 'Login'}
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    router.push('/');
                  }}
                  className="px-6 py-4 text-xs font-flama tracking-[0.15em] uppercase transition-colors text-[#5a4e44] hover:text-[#8B4513] hover:bg-gray-50 text-left flex items-center gap-3 w-full border-l-4 border-transparent"
                >
                  <FiLogOut className="w-4 h-4 text-[#8B4513]" />
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