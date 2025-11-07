'use client';

import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { FiShoppingCart } from 'react-icons/fi';

const Navigation = () => {
  const navItems = ['HOME', 'ABOUT', 'SWEETS', 'GIFTING', 'DRY FRUIT', 'SAVOURY'];

  return (
    <nav className="bg-white h-12 w-full flex items-center justify-between px-4 border-b border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-14 h-8 bg-primary-brown rounded flex items-center justify-center">
          <span className="text-white text-xs">गोपी</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        {navItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className="text-black text-[10px] font-serif tracking-wider hover:text-primary-red transition-colors"
          >
            {item}
          </a>
        ))}
      </div>

      {/* Icons */}
      <div className="flex items-center gap-4">
        <FiSearch className="w-3 h-3 text-black cursor-pointer hover:text-primary-red" />
        <FiShoppingCart className="w-3 h-3 text-black cursor-pointer hover:text-primary-red" />
      </div>
    </nav>
  );
};

export default Navigation;
