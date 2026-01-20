'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';

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
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractingRef = useRef(false);

  // If we have very few posts, duplicate them to create a seamless infinite scroll look
  // rather than having empty whitespace.
  const [displayPosts, setDisplayPosts] = useState<typeof instaPosts>([]);

  useEffect(() => {
    if (instaPosts && instaPosts.length > 0) {
      let repeatedPosts = [...instaPosts];
      // Repeat until we have at least 10 items for a smooth scroll experience
      while (repeatedPosts.length < 10) {
        repeatedPosts = [...repeatedPosts, ...instaPosts];
      }
      setDisplayPosts(repeatedPosts);
    }
  }, [instaPosts]);

  if (!instaPosts || instaPosts.length === 0) return null;

  // Handle user interaction to pause auto-scroll
  const handleUserInteractionStart = () => {
    isUserInteractingRef.current = true;
  };

  const handleUserInteractionEnd = () => {
    isUserInteractingRef.current = false;
  };

  const autoScroll = () => {
    if (scrollContainerRef.current && !isUserInteractingRef.current) {
      const container = scrollContainerRef.current;
      // Calculate width of one card + gap (approximate based on styling)
      // We can get the first child's width if available
      const firstCard = container.firstElementChild as HTMLElement;
      // 220px card width + 24px gap = 244px
      const cardWidth = firstCard ? firstCard.clientWidth + 24 : 244;

      const maxScroll = container.scrollWidth - container.clientWidth;

      // If we are close to the end, scroll back to start
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Otherwise scroll by one card width
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleUserInteractionStart);
      container.addEventListener('touchend', handleUserInteractionEnd);
      container.addEventListener('mouseenter', handleUserInteractionStart);
      container.addEventListener('mouseleave', handleUserInteractionEnd);
    }

    if (instaPosts.length > 0) {
      // Auto-scroll faster than categories for better engagement, e.g., 3s was original, try 4s
      autoScrollIntervalRef.current = setInterval(autoScroll, 3000);
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      if (container) {
        container.removeEventListener('touchstart', handleUserInteractionStart);
        container.removeEventListener('touchend', handleUserInteractionEnd);
        container.removeEventListener('mouseenter', handleUserInteractionStart);
        container.removeEventListener('mouseleave', handleUserInteractionEnd);
      }
    };
  }, [instaPosts]);

  return (
    <section className="py-16 md:py-24 px-4 bg-white w-full">
      <div className="w-full max-w-7xl mx-auto">
        <h3 className="text-center text-2xl md:text-3xl lg:text-4xl text-primary-brown mb-10 md:mb-14 font-general-sans font-bold tracking-tight">
          Follow Us On Instagram
        </h3>

        {/* Slider Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayPosts.map((post, index) => (
            <div
              key={`${post._id}-${index}`}
              className="flex-shrink-0"
            >
              <Link
                href={post.instagramUrl}
                target="_blank"
                className="relative block w-[220px] h-[260px] overflow-hidden group cursor-pointer rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow"
              >
                <Image
                  src={post.imageUrl || `https://picsum.photos/seed/ig${post._id}/300/340`}
                  alt={post.caption || 'Instagram Post'}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />

                {/* Shadow Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Instagram Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaInstagram className="text-white text-4xl drop-shadow-xl" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default InstaPostSection;
