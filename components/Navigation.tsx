'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchProducts } from '@/lib/api';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const cartItemsCount = getTotalItems();

  // Search results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length >= 2) {
        setSearchLoading(true);
        try {
          const results = await fetchProducts({ search: searchQuery, limit: 8 });
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching products:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 500); // Increased debounce to 500ms for better performance
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'SWEETS', href: '/category/sweets' },
    { label: 'DRY FRUIT', href: '/category/dry-fruit' },
    { label: 'BACKERY ITEMS', href: '/category/bakery' },
    { label: 'NAMKEEN', href: '/category/namkeen' },
    { label: 'SAVOURY SNACKS', href: '/category/savoury' },
    { label: 'GIFTING', href: '/category/gifting' },
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
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Promotional Banner
      <div className="bg-orange-500 text-white text-center py-2 px-4 text-xs md:text-sm font-medium">
        Use code "FIRSTBUY10" for 10% OFF your first order.
      </div> */}

      {/* Main Navigation */}
      <nav className="bg-white h-20 md:h-[72px] w-full border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="h-full flex items-center justify-between px-4 relative">
          {/* Mobile: Hamburger Menu - Left */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-black p-2 hover:text-primary-red transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>

          {/* Desktop: Logo - Left */}
          <Link href="/" className="hidden md:flex items-center gap-2">
            <div className="relative w-16 h-10 md:w-24 md:h-14">
              <Image
                src="/logo.png"
                alt="Gopi Misthan Bhandar Logo"
                fill
                className="object-contain"
                sizes="96px"
                priority
              />
            </div>
          </Link>

          {/* Mobile: Logo - Center (Absolute Positioning) */}
          <Link href="/" className="md:hidden absolute left-1/2 transform -translate-x-1/2">
            <div className="relative w-20 h-12">
              <Image
                src="/logo.png"
                alt="Gopi Misthan Bhandar Logo"
                fill
                className="object-contain"
                sizes="80px"
                priority
              />
            </div>
          </Link>

          {/* Desktop: Navigation Links - Center */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith('#')) {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }
                  }}
                  className={`text-xs md:text-sm font-serif tracking-wider transition-colors font-medium flex items-center gap-1 ${
                    isActive(item.href)
                      ? 'text-primary-red'
                      : 'text-black hover:text-primary-red'
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Icons - Right (Search, Cart, Profile, etc.) */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative p-2 hover:text-primary-red transition-colors"
              aria-label="Search"
            >
              <FiSearch className="w-5 h-5 md:w-5 md:h-5" />
            </button>
            <button
              onClick={openCart}
              className="relative p-2 hover:text-primary-red transition-colors"
              aria-label="Shopping cart"
            >
              <FiShoppingCart className="w-5 h-5 md:w-5 md:h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </button>
            {/* Desktop: Admin Panel, Profile, Logout */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated && user?.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="relative p-2 hover:text-primary-red transition-colors"
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
                className="relative p-2 hover:text-primary-red transition-colors"
                aria-label={isAuthenticated ? 'Profile' : 'Login'}
                title={isAuthenticated ? user?.name || 'Profile' : 'Login'}
              >
                <FiUser className="w-5 h-5" />
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="relative p-2 hover:text-primary-red transition-colors"
                  aria-label="Logout"
                  title="Logout"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Height Sidebar from Left */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-3/4 max-w-sm bg-white shadow-2xl z-50 md:hidden overflow-y-auto">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-primary-brown font-serif">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col py-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith('#')) {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block px-6 py-3 text-sm font-general-sans font-[500] tracking-wider transition-colors border-l-4 ${
                    isActive(item.href)
                      ? 'text-primary-red bg-red-50 border-primary-red'
                      : 'text-black hover:text-primary-red hover:bg-gray-50 border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Admin Panel Link - Only show when user is admin */}
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-6 py-3 text-sm font-serif tracking-wider transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 border-l-4 border-blue-600 flex items-center gap-2 font-semibold"
                >
                  <FiSettings className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              
              {/* Profile Link - Always show in mobile menu */}
              <Link
                href={isAuthenticated ? "/profile" : "/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-6 py-3 text-sm font-serif tracking-wider transition-colors text-black hover:text-primary-red hover:bg-gray-50 flex items-center gap-2 border-l-4 border-transparent"
              >
                <FiUser className="w-4 h-4" />
                {isAuthenticated ? 'Profile' : 'Login'}
              </Link>
              
              {/* Logout button - Only show when authenticated */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    router.push('/');
                  }}
                  className="px-6 py-3 text-sm font-serif tracking-wider transition-colors text-black hover:text-primary-red hover:bg-gray-50 text-left flex items-center gap-2 w-full border-l-4 border-transparent"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Search Modal */}
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
              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {searchQuery.trim().length < 2 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Type at least 2 characters to search</p>
                  </div>
                ) : searchLoading ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto mb-2"></div>
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
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium font-serif line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                          <p className="text-sm font-bold text-primary-red mt-1">₹{product.price}</p>
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
                        className="block text-center text-primary-red font-medium py-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        View all {searchResults.length} results
                      </Link>
                    )}
                  </div>
                )}
              </div>
              
              {/* Search on Enter */}
              {searchQuery.trim().length >= 2 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full bg-primary-red text-white py-2 px-4 rounded-lg font-bold hover:bg-primary-darkRed transition-colors"
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
