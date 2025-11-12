'use client';

import React, { useState, useRef } from 'react';
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
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [manualOffset, setManualOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!instaPosts || instaPosts.length === 0) return null;

  // duplicate for seamless loop
  const duplicated = [...instaPosts, ...instaPosts];

  // speed control (smaller = faster)
  const durationSec = 30;

  // Touch/Mouse handlers for swipe
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    setPaused(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - startX;
    setManualOffset(x);
  };

  const handleEnd = () => {
    setIsDragging(false);
    // Reset offset smoothly
    setTimeout(() => {
      setManualOffset(0);
      // Resume marquee after a delay
      setTimeout(() => {
        setPaused(false);
      }, 500);
    }, 100);
  };

  return (
    <section className="py-12 md:py-16 px-4 bg-white w-full">
      <div className="w-full max-w-7xl mx-auto">
        <h3 className="text-center text-xl md:text-2xl lg:text-3xl text-black mb-8 md:mb-12 font-bold font-serif">
          Follow Us on Instagram
        </h3>

        {/* Marquee container with swipe support */}
        <div
          ref={containerRef}
          className="relative overflow-hidden w-full cursor-grab active:cursor-grabbing"
          onMouseEnter={() => !isDragging && setPaused(true)}
          onMouseLeave={() => !isDragging && setPaused(false)}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {/* Wrapper for manual swipe offset */}
          <div
            style={{
              transform: isDragging ? `translateX(${manualOffset}px)` : 'translateX(0)',
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            {/* Track (200% width because of duplication) */}
            <div
              ref={trackRef}
              className="flex gap-4 md:gap-6 lg:gap-8 w-[200%]"
              style={{
                animation: paused ? 'paused' : `marquee ${durationSec}s linear infinite`,
              }}
            >
            {duplicated.map((post, i) => (
              <Link
                key={`${post._id}-${i}`}
                href={post.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] xl:w-[360px] 
                           h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[450px]
                           overflow-hidden rounded-lg cursor-pointer transition-transform duration-300 hover:scale-[1.05] shadow-lg"
                onClick={(e) => {
                  // Prevent link click if user was dragging
                  if (isDragging) {
                    e.preventDefault();
                  }
                }}
              >
                <Image
                  src={post.imageUrl || `https://picsum.photos/seed/igpost${post._id}/200/360`}
                  alt={post.caption || 'Instagram post'}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, (max-width: 1024px) 280px, (max-width: 1280px) 320px, 360px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              </Link>
            ))}
            </div>
          </div>

          {/* keyframes */}
          <style jsx>{`
            @keyframes marquee {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
};

export default InstaPostSection;
