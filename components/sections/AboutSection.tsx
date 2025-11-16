'use client';

import React from 'react';
import Image from 'next/image';
import { FiCheck } from 'react-icons/fi';

const AboutSection = () => {
  const features = ['Quality Products', 'Custom Products', 'Online Order', 'Home Delivery'];

  return (
    <section className="relative bg-primary-darkRed text-white overflow-hidden
                        px-4 py-8 md:py-12 w-full">
      {/* TOP scalloped divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[-1px] w-full h-6 md:h-10 z-20 bg-white rotate-180
                   [mask:radial-gradient(1.25rem_1.25rem_at_1.25rem_0,#0000_98%,#000)_0_0/2.5rem_100%]
                   [-webkit-mask:radial-gradient(1.25rem_1.25rem_at_1.25rem_0,#0000_98%,#000)_0_0/2.5rem_100%]"
      />
      
      {/* safe space so top scallop not overlap */}
      <div className="pt-6 md:pt-8 max-w-6xl mx-auto mb-6">
        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-primary-yellow text-center font-poppins font-extrabold
                         text-xl sm:text-2xl md:text-3xl">
            GOPI MISTHAN BHANDAR
          </h2>
          <p className="text-primary-yellow text-center mt-1 text-xs sm:text-sm md:text-[14px] ">
            Serving Tradition & Sweetness Since
          </p>
          <p className = "text-center mt-2 font-bold font-poppins text-primary-yellow text-2xl">1968</p>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
          {/* Image (mobile full width, desktop half) */}
          <div className="relative w-full md:w-1/2  h-56 sm:h-64 md:h-80 lg:h-[280px]
                          rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/2.png"
              alt="Gopi Misthan Bhandar Shop"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              priority
            />
          </div>

          {/* Text + Features */}
          <div className="w-full md:w-1/2 text-center md:text-left md:pl-2">
            <h3 className="font-poppins font-bold text-lg sm:text-xl md:text-2xl mb-2">
              Where Tradition Meets the Taste of Love
            </h3>
            <p className="text-xs sm:text-sm md:text-base leading-relaxed">
              Since 1968, we’ve been spreading the sweetness of tradition with pure desi ghee and
              timeless recipes — made straight from the heart.
            </p>
            <p className="text-xs sm:text-sm md:text-base leading-relaxed mt-2">
              Every bite tells a story of purity, tradition, and love — that’s the Gopi Misthan
              Bhandar way.
            </p>

            {/* Features - Mobile: 2x2 grid, Desktop: inline */}
            <div className="grid grid-cols-2 gap-3 md:gap-y-2 md:gap-x-4 mt-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 justify-center md:justify-start">
                  <FiCheck className="text-primary-yellow text-lg sm:text-xl md:text-lg shrink-0 font-bold" />
                  <span className="text-sm sm:text-base md:text-base text-white font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM scalloped divider + bottom safe space */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px left-0 w-full h-6 md:h-10 z-20 bg-white
                   [mask:radial-gradient(1.25rem_1.25rem_at_1.25rem_0,#0000_98%,#000)_0_0/2.5rem_100%]
                   [-webkit-mask:radial-gradient(1.25rem_1.25rem_at_1.25rem_0,#0000_98%,#000)_0_0/2.5rem_100%]"
      />
      <div className="pb-6 md:pb-8" />
    </section>
  );
};

export default AboutSection;
