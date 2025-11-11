import React from 'react';
import { FiPhone, FiMail } from 'react-icons/fi';

const Header = () => {
  return (
    <div className="bg-primary-red h-8 md:h-10 w-full">
      <div className="w-full h-full flex items-center justify-between px-4">
        <p className="text-white text-[10px] md:text-xs font-bold  font-sans tracking-wide hidden sm:block">
          <span className="pl-4">GOPI MISTHAN BHANDAR </span>
          <span className="text-primary-yellow">NEEMUCH</span>
        </p>
        
        <div className="flex items-center gap-4 md:gap-6 text-white text-[10px] md:text-xs">
          <a 
            href="tel:+919876543210" 
            className="flex items-center gap-1 hover:text-primary-yellow transition-colors"
          >
            <FiPhone className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">+91 98765 43210</span>
            <span className="md:hidden">Call Us</span>
          </a>
          <a 
            href="mailto:info@gopimisthanbhandar.com" 
            className="flex items-center gap-1 hover:text-primary-yellow transition-colors"
          >
            <FiMail className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">info@gopimisthanbhandar.com</span>
            <span className="md:hidden">Email</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
