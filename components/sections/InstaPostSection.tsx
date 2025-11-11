'use client';

import React, { useState } from 'react';
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

  if (!instaPosts || instaPosts.length === 0) return null;

  // duplicate for seamless loop
  const duplicated = [...instaPosts, ...instaPosts];

  // speed control (smaller = faster)
  const durationSec = 30; // try 20–45 based on how many cards you have

  return (
    <section className="py-12 md:py-16 px-4 bg-white w-full">
      <div className="w-full">
        <h3 className="text-center text-xl md:text-2xl text-black mb-8 md:mb-12 font-bold">
          Follow Us on Instagram
        </h3>

        {/* Marquee container */}
        <div
          className="relative overflow-hidden w-full"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setTimeout(() => setPaused(false), 1200)}
        >
          {/* Track (200% width because of duplication) */}
          <div
            className="flex gap-4 md:gap-6 w-[200%]"
            style={{
              animation: `marquee ${durationSec}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            {duplicated.map((post, i) => (
              <Link
                key={`${post._id}-${i}`}
                href={post.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex-shrink-0 w-[160px] md:w-[180px] lg:w-[250px] h-[220px] md:h-[230px] lg:h-[260px]
                           overflow-hidden rounded-lg cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
              >
                <Image
                  src={post.imageUrl || `https://picsum.photos/seed/igpost${post._id}/200/360`}
                  alt={post.caption || 'Instagram post'}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 250px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              </Link>
            ))}
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
