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

  // Slide logic
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${index * 320}px)`;
    }
  }, [index]);

  return (
    <section className="py-12 md:py-16 px-4 bg-white w-full">
      <div className="w-full max-w-7xl mx-auto">
        <h3 className="text-center text-xl md:text-2xl lg:text-3xl text-black mb-8 md:mb-12 font-general-sans font-[500]">
          FOLLOW US ON INSTAGRAM
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
                className="relative w-[220px] h-[260px] flex-shrink-0  overflow-hidden shadow-lg group cursor-pointer"

              >
                <Image
                  src={post.imageUrl || `https://picsum.photos/seed/ig${post._id}/300/340`}
                  alt={post.caption || 'Instagram Post'}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />

                {/* Shadow Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
