'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface InstaPostSectionProps {
  instaPosts: Array<{
    _id: string;
    imageUrl: string;
    caption?: string;
    instagramUrl: string;
  }>;
}

const InstaPostSection: React.FC<InstaPostSectionProps> = ({ instaPosts }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only auto-scroll if there are multiple posts
    if (instaPosts.length <= 1) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    const scrollDelay = 16; // ~60fps
    let paused = false;

    const startScrolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (!paused && container) {
          scrollPosition += scrollSpeed;
          
          // Reset scroll position when it reaches halfway (seamless loop)
          const maxScroll = container.scrollWidth / 2;
          if (scrollPosition >= maxScroll) {
            scrollPosition = 0;
          }
          
          container.scrollLeft = scrollPosition;
        }
      }, scrollDelay);
    };

    startScrolling();

    // Pause on hover
    const handleMouseEnter = () => {
      paused = true;
      setIsPaused(true);
    };

    const handleMouseLeave = () => {
      paused = false;
      setIsPaused(false);
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [instaPosts.length]);

  if (!instaPosts || instaPosts.length === 0) {
    return null;
  }

  // Duplicate posts for seamless infinite scroll
  const duplicatedPosts = [...instaPosts, ...instaPosts];

  return (
    <section className="py-12 md:py-16 px-4 bg-white w-full">
      <div className="w-full">
        {/* INSTAPOST Section - Instagram Posts with Links */}
        <h3 className="text-center text-xl md:text-2xl font-serif text-black mb-8 md:mb-12 font-medium">
          Follow Us on Instagram
        </h3>

        {/* Instagram Posts Slider - Auto-scrolling Marquee */}
        <div className="overflow-hidden w-full">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-6"
            style={{
              width: 'max-content',
            }}
          >
            {duplicatedPosts.map((post, index) => (
              <Link
                key={`${post._id}-${index}`}
                href={post.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex-shrink-0 w-[160px] md:w-[180px] lg:w-[250px] h-[280px] md:h-[250px] lg:h-[260px] overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                <Image
                  src={post.imageUrl || `https://picsum.photos/seed/igpost${post._id}/200/360`}
                  alt={post.caption || 'Instagram post'}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstaPostSection;

