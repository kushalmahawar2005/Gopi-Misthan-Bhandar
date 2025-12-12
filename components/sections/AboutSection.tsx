'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutHero: React.FC = () => {
  return (
    <section
      aria-labelledby="about-hero-title"
      className="w-full px-4 md:px-8 lg:px-16 pt-0 pb-12 md:pb-20"
    >
      <div
        className="mx-auto w-full rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#f7db9d',
          backgroundImage: "url('/about/bg-pattern.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '520px',
        }}
      >
        <div className="px-6 md:px-14 lg:px-12 py-10 md:py-14 lg:py-16 relative">
          <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
            {/* TEXT / CTA */}
            <div className="w-full md:w-6/12">
              <h2
                id="about-hero-title"
                className="font-geom font-[450] text-3xl md:text-4xl lg:text-5xl text-[#121212] leading-tight mb-4"
              >
                A Legacy of Sweet Excellence
              </h2>

              <p className="text-sm md:text-base text-[#444444] mb-4 max-w-xl">
                With over four decades of mastery in crafting premium Indian sweets, Chhappanbhog
                stands as a hallmark of tradition, purity, and flavor.
              </p>

              <p className="text-sm md:text-base text-[#444444] mb-6 max-w-xl">
                Our commitment is simple yet profound — to bring the rich, authentic taste of India's
                royal heritage to your celebrations, one exquisite bite at a time.
              </p>

              <div>
                <Link
                  href="/about"
                  className="inline-block bg-[#a02126] hover:bg-[#7f1a1f] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-md font-medium transition-colors shadow-sm"
                  aria-label="Learn more about Chhappanbhog"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* IMAGE GROUP */}
            <div className="w-full md:w-6/12 pr-0 md:pr-4 flex items-start gap-4">
              {/* Large image */}
              <div className="w-full md:w-2/3">
                <div className="relative rounded-md overflow-hidden shadow-sm">
                  <Image
                    src="/box-large.jpg"
                    alt="Assorted sweets in a decorative box"
                    width={720}
                    height={720}
                    className="object-cover w-full h-[320px] md:h-[360px]"
                    sizes="(max-width: 768px) 100vw, 45vw"
                    priority
                  />
                </div>
              </div>

              {/* stacked small images */}
              <div className="hidden md:flex md:w-1/3 flex-col gap-4">
                <div className="relative rounded-md overflow-hidden shadow-sm">
                  <Image
                    src="/box-small1.jpg"
                    alt="Traditional sweet - variant 1"
                    width={320}
                    height={180}
                    className="object-cover w-full h-[180px]"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                </div>
                <div className="relative rounded-md overflow-hidden shadow-sm">
                  <Image
                    src="/box-small2.jpg"
                    alt="Traditional sweet - variant 2"
                    width={320}
                    height={180}
                    className="object-cover w-full h-[180px]"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* floral watermark on right (low opacity) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-6 md:right-10 lg:right-16 flex items-center"
            style={{ opacity: 0.12 }}
          >
            <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px]">
              <Image
                src="/floral.svg"
                alt=""
                width={420}
                height={420}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
