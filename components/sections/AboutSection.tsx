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
    <section className="bg-primary-darkRed py-8 md:py-12 px-4 w-full">
      <div className="w-full">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Left Side - Shop Image + Gifts Content */}
          <div className="flex flex-col gap-4">
            {/* Large Shop Image */}
            <div className="relative h-[280px] md:h-[320px] lg:h-[350px] w-full rounded-xl overflow-hidden shadow-xl group">
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
            <div className="text-white bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="text-primary-yellow text-lg md:text-xl font-bold font-poppins mb-2">
                Gifts and More
              </h3>
              <p className="text-sm font-roboto leading-relaxed text-gray-200">
                Hailing from the land of sun and blue, over the years we've specialized in making traditional Indian sweets while maintaining their authentic tastes. From festival hampers to corporate gifting, we create memorable experiences.
              </p>
            </div>
          </div>

          {/* Right Side - Main Content */}
          <div className="text-white">
            <div className="mb-6">
              <h2 className="text-primary-yellow text-center   text-2xl md:text-3xl font-extrabold mb-1 font-serif">
                GOPI MISTHAN BHANDAR
              </h2>
              <p className="md:text-xl lg:text-[14px] text-center  mb-4 text-primary-yellow">
                Serving Tradition & Sweetness Since 1968
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-serif mb-3 font-bold">Our Belief.</h3>
              <p className="text-sm md:text-base font-poppins leading-relaxed text-gray-200 mb-4">
              Rooted in tradition and crafted with love, Gopi Misthan Bhandar has been serving authentic Indian sweets since 1968. Each delicacy is made using time-honored recipes passed down through generations — a true taste of heritage and sweetness.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                  <stat.icon className="w-5 h-5 text-primary-yellow mx-auto mb-1" />
                  <div className="text-lg md:text-xl font-bold font-serif text-primary-yellow mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-300 font-roboto leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Images */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative h-32 md:h-36 w-full rounded-lg overflow-hidden shadow-lg group">
                <Image
                  src="https://picsum.photos/seed/sweets1/400/400"
                  alt="Traditional Sweets"
                  fill
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative h-32 md:h-36 w-full rounded-lg overflow-hidden shadow-lg group">
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
