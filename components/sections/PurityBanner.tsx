'use client';

import React from 'react';

const purityItems = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l14.14 14.14" />
        <path d="M8 12c0-1.5 1-3 4-3s4 1.5 4 3-1 3-4 3-4-1.5-4-3z" />
      </svg>
    ),
    text: 'Freshly Made And Packed Every Day',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l14.14 14.14" />
        <path d="M8 12c0-1.5 1-3 4-3s4 1.5 4 3-1 3-4 3-4-1.5-4-3z" />
      </svg>
    ),
    text: 'No Palm Oil',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M4.93 4.93l14.14 14.14" />
        <path d="M9 8l2 4-2 4M15 8l-2 4 2 4" />
      </svg>
    ),
    text: 'No Harmfull Checmicals',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l14.14 14.14" />
        <path d="M9 16V8l3 3 3-3v8" />
      </svg>
    ),
    text: 'No Preservatives',
  },

];

const PurityBanner: React.FC = () => {
  // Repeat items enough times for seamless infinite scroll
  const repeatedItems = [...purityItems, ...purityItems, ...purityItems, ...purityItems, ...purityItems, ...purityItems];

  return (
    <div className="w-full overflow-hidden mb-0 bg-[#FE8E02]">
      <div className="relative py-5 md:py-6">
        {/* Marquee Track */}
        <div className="flex items-center animate-purity-marquee whitespace-nowrap">
          {repeatedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 md:gap-4 mx-8 md:mx-12 shrink-0"
            >
              <span className="text-white opacity-90 scale-110 md:scale-125 transform transition-transform">
                {item.icon}
              </span>
              <span className="text-white font-medium text-base md:text-xl tracking-wide font-flama">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PurityBanner;
