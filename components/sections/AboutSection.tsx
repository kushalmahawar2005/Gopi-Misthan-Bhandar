'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutHero: React.FC = () => {
  return (
    <section className="w-full px-4 md:px-8 lg:px-16">
      {/* Card container */}
      <div
        className="mx-auto w-full max-w-[1200px] rounded-xl overflow-hidden mt-8 md:mt-10 mb-12"
        aria-label="About hero"
      >
        {/* Background: pale beige with subtle pattern (use provided bg image) */}
        <div
          className="relative bg-[color:var(--beige,#f6efe8)]"
          style={{
            backgroundImage: "url('/about/bg-pattern.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '500px',
          }}
        >
          <div className="px-6 md:px-10 lg:px-12 py-10 md:py-14 lg:py-16">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              
              {/* Left: image group */}
              <div className="w-full md:w-6/12 flex items-start gap-4">
                {/* Large left image */}
                <div className="w-2/3 md:w-[56%]">
                  <div className="relative rounded-md overflow-hidden shadow-sm">
                    <Image
                      src="/about/box-large.jpg"
                      alt="Product box"
                      width={720}
                      height={720}
                      className="object-cover w-full h-[320px] md:h-[360px]"
                      sizes="(max-width: 768px) 100vw, 45vw"
                      priority
                    />
                  </div>
                </div>

                {/* Two stacked small images */}
                <div className="w-1/3 md:w-[44%] flex flex-col gap-4">
                  <div className="relative rounded-md overflow-hidden shadow-sm">
                    <Image
                      src="/about/box-small1.jpg"
                      alt="Small 1"
                      width={320}
                      height={160}
                      className="object-cover w-full h-[150px]"
                      sizes="(max-width: 768px) 100vw, 20vw"
                      priority
                    />
                  </div>
                  <div className="relative rounded-md overflow-hidden shadow-sm">
                    <Image
                      src="/about/box-small2.jpg"
                      alt="Small 2"
                      width={320}
                      height={160}
                      className="object-cover w-full h-[150px]"
                      sizes="(max-width: 768px) 100vw, 20vw"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Right: heading + text + button */}
              <div className="w-full md:w-6/12">
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1c1c1c] leading-tight mb-4">
                  A Legacy of Sweet Excellence
                </h2>

                <p className="text-sm md:text-base text-[#3d3d3d] mb-4 max-w-xl">
                  With over four decades of mastery in crafting premium Indian sweets,
                  Chhappanbhog stands as a hallmark of tradition, purity, and flavor.
                </p>

                <p className="text-sm md:text-base text-[#3d3d3d] mb-6 max-w-xl">
                  Our commitment is simple yet profound — to bring the rich, authentic taste of India's royal heritage
                  to your celebrations, one exquisite bite at a time.
                </p>

                <div>
                  <Link
                    href="/about"
                    className="inline-block bg-[#9b1f24] hover:bg-[#7f191d] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-md font-medium transition-colors shadow-sm"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Decorative border radius / outer spacing (subtle) */}
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-0" />
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
