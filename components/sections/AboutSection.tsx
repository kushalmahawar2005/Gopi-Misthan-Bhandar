import React from 'react';
import Image from 'next/image';

const AboutSection = () => {
  return (
    <section className="bg-primary-darkRed py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left Side - Shop Image + Gifts Content */}
          <div className="flex flex-col gap-6">
            {/* Large Shop Image - Increased Height */}
            <div className="relative h-[400px] md:h-[500px] mt-12 lg:h-[470px] w-full rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/seed/shop1/800/600"
                alt="Gopi Misthan Bhandar Shop"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Gifts and more Content - Moved to Left Side */}
            <div className="text-white">
              <p className="text-sm md:text-base font-serif mb-3 font-bold">Gifts and more....</p>
              <p className="text-xs md:text-sm font-roboto leading-relaxed text-gray-200">
                Hailing from the land of sun and blue, over the years we've specialized in making traditional Indian sweets while maintaining their authentic tastes
              </p>
            </div>
          </div>

          {/* Right Side - Main Content */}
          <div className="text-white">
            {/* Centered Heading */}
            <h2 className="text-primary-yellow text-lg md:text-xl font-extrabold mb-3 font-serif text-center">
              GOPI MISTHAN BHANDAR
            </h2>
            <p className="text-base md:text-lg font-serif mb-6 text-primary-yellow text-center">
              Serving Tradition & Sweetness Since 1968
            </p>
            <p className="text-sm md:text-base font-serif mb-3 font-bold text-center">Our Believe...</p>
            <p className="text-xs md:text-sm font-roboto leading-relaxed mb-6 text-gray-200 text-center">
              Hailing from the land of sun and blue, over the years we've specialized in making traditional Indian sweets while maintaining their authentic tastes
            </p>

            {/* Additional Images */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="relative h-32 md:h-40 w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="https://picsum.photos/seed/sweets1/400/400"
                  alt="Traditional Sweets"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="relative h-32 md:h-40 w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="https://picsum.photos/seed/sweets2/400/400"
                  alt="Sweet Collection"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </div>
            <div className="relative h-36 md:h-44 w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://picsum.photos/seed/gifts/600/400"
                alt="Gift Hampers"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 120vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
