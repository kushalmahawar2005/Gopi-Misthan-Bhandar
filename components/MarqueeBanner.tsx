'use client';

import React, { useEffect, useState } from 'react';

interface MarqueeBannerProps {
  text?: string;
}

const MarqueeBanner: React.FC<MarqueeBannerProps> = ({ text }) => {
  const [marqueeText, setMarqueeText] = useState(text || 'ALERT: Same day delivery in Neemuch for all orders placed before 5pm.');

  useEffect(() => {
    // Fetch marquee text from API (only active content)
    const fetchMarqueeText = async () => {
      try {
        const response = await fetch('/api/site-content/section/marquee');
        const data = await response.json();
        if (data.success && data.data?.description && data.data?.isActive) {
          setMarqueeText(data.data.description);
        } else {
          // If no active marquee, use default text
          setMarqueeText(text || 'ALERT: Same day delivery in Delhi NCR for all orders placed before 5pm.');
        }
      } catch (error) {
        console.error('Error fetching marquee text:', error);
        setMarqueeText(text || 'ALERT: Same day delivery in Delhi NCR for all orders placed before 5pm.');
      }
    };

    fetchMarqueeText();
  }, [text]);

  // Always render the banner
  return (
    <div className="bg-gray-900 text-white w-full py-2.5 md:py-3">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <p className="text-xs md:text-sm font-medium text-center leading-tight">
          {marqueeText}
        </p>
      </div>
    </div>
  );
};

export default MarqueeBanner;

