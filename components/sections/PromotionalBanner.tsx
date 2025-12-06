'use client';

import React from 'react';
import Image from 'next/image';
import { FiHeart, FiAward, FiPackage, FiTruck } from 'react-icons/fi';

const PromotionalBanner = () => {
  const features = [
    {
      icon: FiHeart,
      image: '/india-map-icon.png', // India map image (if available)
      useImage: true,
      title: 'Loved By India',
      subtitle: 'Loved by 5 lakh+ customers',
    },
    {
      icon: FiAward,
      image: '/experience-icon.png',
      useImage: true,
      title: '60+ Experience',
      subtitle: 'Great experience',
    },
    {
      icon: FiPackage,
      image: '/handmade-icon.png',
      useImage: true,
      title: 'Handmade',
      subtitle: 'Every piece is made with love',
    },
    {
      icon: FiTruck,
      image: '/delivery-icon.png',
      useImage: true,
      title: 'PAN India Delivery',
      subtitle: 'In 5-7 Days* T&C apply',
    },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-[#941a1f] to-[#a21f28]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 items-stretch gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="relative flex items-center">
                  <div className="flex items-start md:items-center gap-4 md:gap-6 w-full">
                    {/* Icon / image container */}
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14">
                      {feature.useImage && feature.image ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={feature.image}
                            alt={feature.title}
                            fill
                            className="object-contain filter invert brightness-0"
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3 className="text-white font-serif text-lg md:text-2xl lg:text-2xl leading-tight font-medium">
                        {feature.title}
                      </h3>
                      <p className="text-white/90 text-xs md:text-sm mt-1">{feature.subtitle}</p>
                    </div>
                  </div>

                  {/* vertical divider: show on md and up except after last item */}
                  {index < features.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3">
                      <div className="w-px h-16 bg-white/25" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;
