'use client';

import React from 'react';
import MarqueeBanner from './MarqueeBanner';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();

  // Only show the top banner on the home page
  if (pathname !== '/') {
    return null;
  }

  return (
    <MarqueeBanner />
  );
};

export default Header;
