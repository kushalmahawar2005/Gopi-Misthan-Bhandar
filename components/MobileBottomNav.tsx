'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUser, FiShoppingBag, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

const MobileBottomNav = () => {
  const pathname = usePathname();
  const { getTotalItems, openCart } = useCart();
  const { getWishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  const cartCount = getTotalItems();
  const wishlistCount = getWishlistCount();

  // Don't show on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: FiHome,
      badge: 0,
    },
    {
      label: 'Account',
      href: isAuthenticated ? '/profile' : '/login',
      icon: FiUser,
      badge: 0,
    },
    {
      label: 'Shop',
      href: '/products',
      icon: FiShoppingBag,
      badge: 0,
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: FiHeart,
      badge: wishlistCount,
    },
    {
      label: 'Cart',
      href: '#',
      icon: FiShoppingCart,
      badge: cartCount,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        openCart();
      },
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    if (href === '#') {
      return false;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#F5F1E8] border-t border-black/10 shadow-lg min-h-[55px]">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.onClick}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg
                transition-colors relative
                ${active ? 'text-black' : 'text-black/60'}
                ${active ? 'bg-black/5' : ''}
              `}
              aria-label={item.label}
            >
              <div className={`relative`}>
                <Icon className={`w-6 h-6 ${active && item.href === '/' ? '' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-red text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center min-w-[20px]">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

