'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiSearch, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { getProductsBySearch } from '@/lib/data';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, getTotalItems } = useCart();
  const cartItemsCount = getTotalItems();

  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length >= 2) {
      return getProductsBySearch(searchQuery);
    }
    return [];
  }, [searchQuery]);

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'ABOUT', href: '#about' },
    { label: 'SWEETS', href: '#sweets' },
    { label: 'GIFTING', href: '#gifting' },
    { label: 'DRY FRUIT', href: '#dry-fruit' },
    { label: 'SAVOURY', href: '#savoury' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
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
      <nav className="bg-white h-16 md:h-[72px] w-full flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm sticky top-0 z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-20 h-12 md:w-28 md:h-16">
            <Image
              src="/logo.png"
              alt="Gopi Misthan Bhandar Logo"
              fill
              className="object-contain"
              sizes="112px"
              priority
            />
          </div>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.href.startsWith('#')) {
                  e.preventDefault();
                  handleNavClick(item.href);
                }
              }}
              className={`text-xs md:text-sm font-serif tracking-wider transition-colors font-medium ${
                isActive(item.href)
                  ? 'text-primary-red'
                  : 'text-black hover:text-primary-red'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-black text-xs font-serif p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="relative p-2 hover:text-primary-red transition-colors"
            aria-label="Search"
          >
            <FiSearch className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={openCart}
            className="relative p-2 hover:text-primary-red transition-colors"
            aria-label="Shopping cart"
          >
            <FiShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartItemsCount > 9 ? '9+' : cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-white shadow-lg z-40 md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col py-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith('#')) {
                      e.preventDefault();
                      handleNavClick(item.href);
                    } else {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`px-6 py-3 text-sm font-serif tracking-wider transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-red bg-red-50 border-l-4 border-primary-red'
                      : 'text-black hover:text-primary-red hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
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
