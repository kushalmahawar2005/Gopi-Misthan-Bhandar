'use client';

import React from 'react';
import Image from 'next/image';
import { FiSearch } from 'react-icons/fi';
import { FiShoppingCart } from 'react-icons/fi';

const Navigation = () => {
  const navItems = ['HOME', 'ABOUT', 'SWEETS', 'GIFTING', 'DRY FRUIT', 'SAVOURY'];

  return (
    <nav className="bg-white h-16 md:h-[72px] w-full flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
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
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        {navItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className="text-black text-xs md:text-sm font-serif tracking-wider hover:text-primary-red transition-colors font-medium"
          >
            {item}
          </a>
        ))}
      </div>

      {/* Mobile Menu - simplified for smaller screens */}
      <div className="md:hidden flex items-center gap-2">
        <button className="text-black text-xs font-serif">MENU</button>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-3 md:gap-4">
        <FiSearch className="w-4 h-4 md:w-5 md:h-5 text-black cursor-pointer hover:text-primary-red transition-colors" />
        <FiShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-black cursor-pointer hover:text-primary-red transition-colors" />
      </div>
    </nav>
  );
};

export default Navigation;
