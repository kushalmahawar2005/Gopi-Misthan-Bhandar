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
  const [index, setIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!instaPosts || instaPosts.length === 0) return null;

  // Auto-slide every 3 sec
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % instaPosts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [instaPosts.length]);

  // Slide logic
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${index * 320}px)`;
    }
  }, [index]);

  return (
    <section className="py-16 md:py-24 px-4 bg-white w-full">
      <div className="w-full max-w-7xl mx-auto">
        <h3 className="text-center text-2xl md:text-3xl lg:text-4xl text-primary-brown mb-10 md:mb-14 font-general-sans font-bold tracking-tight">
          Follow Us On Instagram
        </h3>

        {/* Slider Container */}
        <div className="relative overflow-hidden w-full">
          {/* Track */}
          <div
            ref={sliderRef}
            className="flex gap-6 transition-transform duration-700 ease-in-out"
            style={{ width: `${instaPosts.length * 320}px` }}
          >
            {instaPosts.map((post) => (
              <Link
                key={post._id}
                href={post.instagramUrl}
                target="_blank"
                className="relative w-[220px] h-[260px] flex-shrink-0 overflow-hidden group cursor-pointer rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow"

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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstaPostSection;
