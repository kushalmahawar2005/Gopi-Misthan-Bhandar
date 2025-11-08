'use client';

import React from 'react';
import Image from 'next/image';
import { FiAward, FiHeart, FiUsers } from 'react-icons/fi';

const AboutSection = () => {
  const stats = [
    { icon: FiAward, value: '56+', label: 'Years of Excellence' },
    { icon: FiHeart, value: '50K+', label: 'Happy Customers' },
    { icon: FiUsers, value: '100+', label: 'Product Varieties' },
  ];

  return (
    <section className="bg-primary-darkRed py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left Side - Shop Image + Gifts Content */}
          <div className="flex flex-col gap-8">
            {/* Large Shop Image */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[550px] w-full rounded-2xl overflow-hidden shadow-2xl group">
              <Image
                src="https://picsum.photos/seed/shop1/800/600"
                alt="Gopi Misthan Bhandar Shop"
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Gifts and more Content */}
            <div className="text-white bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-primary-yellow text-xl md:text-2xl font-bold font-serif mb-3">
                Gifts and More...
              </h3>
              <p className="text-sm md:text-base font-roboto leading-relaxed text-gray-200">
                Hailing from the land of sun and blue, over the years we've specialized in making traditional Indian sweets while maintaining their authentic tastes. From festival hampers to corporate gifting, we create memorable experiences.
              </p>
            </div>
          </div>

          {/* Right Side - Main Content */}
          <div className="text-white">
            <div className="mb-8">
              <h2 className="text-primary-yellow text-3xl md:text-4xl font-extrabold mb-4 font-serif">
                GOPI MISTHAN BHANDAR
              </h2>
              <p className="text-xl md:text-2xl font-serif mb-6 text-primary-yellow">
                Serving Tradition & Sweetness Since 1968
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-serif mb-4 font-bold">Our Belief...</h3>
              <p className="text-base md:text-lg font-roboto leading-relaxed text-gray-200 mb-6">
                Hailing from the land of sun and blue, over the years we've specialized in making traditional Indian sweets while maintaining their authentic tastes. Every sweet is crafted with love, using time-honored recipes passed down through generations.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <stat.icon className="w-8 h-8 text-primary-yellow mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold font-serif text-primary-yellow mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 font-roboto">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-32 md:h-40 w-full rounded-lg overflow-hidden shadow-lg group">
                <Image
                  src="https://picsum.photos/seed/sweets1/400/400"
                  alt="Traditional Sweets"
                  fill
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative h-32 md:h-40 w-full rounded-lg overflow-hidden shadow-lg group">
                <Image
                  src="https://picsum.photos/seed/sweets2/400/400"
                  alt="Sweet Collection"
                  fill
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
