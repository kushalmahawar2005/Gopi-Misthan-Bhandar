'use client';

import React, { useEffect, useState } from 'react';

interface MarqueeBannerProps {
  text?: string;
}

const MarqueeBanner: React.FC<MarqueeBannerProps> = ({ text }) => {
  const [marqueeText, setMarqueeText] = useState(text || '🎉 Special Offer: Get 10% OFF on your first order! Use code FIRSTBUY10 🎉');

  useEffect(() => {
    // Fetch marquee text from API (only active content)
    const fetchMarqueeText = async () => {
      try {
        const response = await fetch('/api/site-content/section/marquee');
        const data = await response.json();
        if (data.success && data.data?.description && data.data?.isActive) {
          setMarqueeText(data.data.description);
        } else {
          // If no active marquee, hide the banner
          setMarqueeText('');
        }
      } catch (error) {
        console.error('Error fetching marquee text:', error);
        setMarqueeText('');
      }
    };

    fetchMarqueeText();
  }, []);

  // Don't render if no text or if explicitly hidden
  if (!marqueeText || marqueeText.trim() === '') return null;

  return (
    <div className="bg-primary-red text-white overflow-hidden relative h-10 md:h-10 w-full">
      <div className="marquee-container h-full flex items-center">
        <div className="marquee-content whitespace-nowrap flex items-center gap-8">
          {/* Duplicate content for seamless loop */}
          <span className="text-[10px] md:text-xs font-bold font-sans tracking-wide">
            {marqueeText}
          </span>
          <span className="text-[10px] md:text-xs font-bold font-sans tracking-wide">
            {marqueeText}
          </span>
          <span className="text-[10px] md:text-xs font-bold font-sans tracking-wide">
            {marqueeText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarqueeBanner;

