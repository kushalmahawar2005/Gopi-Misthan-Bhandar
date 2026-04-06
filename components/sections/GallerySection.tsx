'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiPhone, FiMapPin } from 'react-icons/fi';

interface GalleryItem {
  _id: string;
  imageUrl: string;
  title?: string;
  description?: string;
}

interface GallerySectionProps {
  galleryItems: GalleryItem[];
  showAll?: boolean;
}

const branches = [
  {
    name: 'Main Branch - Holi Gate',
    address: 'Holi Gate, Chhatta Bazar, Mathura, Uttar Pradesh 281001',
    phone: '+91 565 240 1234',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1974&auto=format&fit=crop',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Gopi+Misthan+Bhandar+Holi+Gate+Mathura'
  },
  {
    name: 'Junction Road Branch',
    address: 'Near Railway Station, Junction Road, Mathura, Uttar Pradesh 281001',
    phone: '+91 565 240 5678',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1626708722669-951101967e78?q=80&w=2074&auto=format&fit=crop',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Gopi+Misthan+Bhandar+Junction+Road+Mathura'
  },
  {
    name: 'Krishna Nagar Branch',
    address: 'Krishna Nagar Main Market, Mathura, Uttar Pradesh 281004',
    phone: '+91 565 242 9012',
    rating: 5,
    imageUrl: 'https://images.unsplash.com/photo-1549465225-b1ea61973649?q=80&w=2072&auto=format&fit=crop',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Gopi+Misthan+Bhandar+Krishna+Nagar+Mathura'
  }
];

const GallerySection: React.FC<GallerySectionProps> = ({ galleryItems, showAll }) => {
  return (
    <section className="py-16 md:py-24 w-full bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Premium Heading Style */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-[12px] md:text-[14px] font-flama tracking-[0.3em] uppercase text-[#F88E0C] mb-3">
            Our Presence
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-flama-condensed tracking-[0.1em] uppercase text-[#503223]">
            Visit Our Shops
          </h2>
        </div>

        {/* 3 Branches Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-16 items-start">
          {branches.map((branch, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center text-center group transition-all duration-700 ${
                index === 1 ? 'md:translate-y-12' : 'md:-translate-y-6'
              }`}
            >
              {/* Large Image with Rounded Corners */}
              <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden shadow-lg border border-white mb-8">
                <Image
                  src={branch.imageUrl}
                  alt={branch.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Branch Name - Serif */}
              <h3 className="text-2xl md:text-3xl font-playfair font-bold text-[#503223] mb-4">
                {branch.name}
              </h3>

              {/* Address - Sans */}
              <p className="text-[13px] md:text-[14px] text-[#503223]/70 font-dm-sans mb-3 px-4 leading-relaxed max-w-[280px]">
                {branch.address}
              </p>

              {/* Stars */}
              <div className="flex gap-1 mb-8">
                {[...Array(branch.rating)].map((_, i) => (
                  <span key={i} className="text-[#D4A373] text-xl">★</span>
                ))}
              </div>

              {/* Buttons Container */}
              <div className="flex flex-col gap-3 w-full max-w-[220px]">
                {/* Contact Now Button - Orange */}
                <Link 
                  href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#F88E0C] text-white px-6 py-3 text-[11px] font-flama tracking-[0.2em] uppercase rounded-full transition-all duration-300 hover:bg-[#D87A0A] hover:scale-105 shadow-md active:scale-95 w-full"
                >
                  <FiPhone className="w-3.5 h-3.5" />
                  Contact Now
                </Link>

                {/* View on Map Button - Outline Orange */}
                <Link 
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#F88E0C] text-[#F88E0C] px-6 py-2.5 text-[11px] font-flama tracking-[0.2em] uppercase rounded-full transition-all duration-300 hover:bg-[#F88E0C] hover:text-white hover:scale-105 active:scale-95 w-full"
                >
                  <FiMapPin className="w-3.5 h-3.5" />
                  View on Map
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
