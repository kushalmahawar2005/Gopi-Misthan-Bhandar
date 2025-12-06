'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutHero: React.FC = () => {
  return (
    <section className="w-full px-4 md:px-8 lg:px-16">
      {/* card container - centered, rounded, with shadow */}
      <div className="mx-auto w-full rounded-xl overflow-hidden mt-8 md:mt-10 mb-12">
        {/* background: pale beige + subtle tiled pattern image */}
        <div
          className="relative"
          style={{
            backgroundColor: '#f5ebe0', // pale beige base
            backgroundImage: "url('/about/bg-pattern.png')", // subtle pattern tile
            backgroundRepeat: 'repeat',
            backgroundSize: '520px',
          }}
        >
          {/* inner padding for card content */}
          <div className="px-6 md:px-14 lg:px-12 py-10 md:py-14 lg:py-16">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* LEFT: image group */}
              <div className="w-full md:w-6/12 pr-4 flex items-start gap-4">
                {/* large image */}
                <div className="w-2/3 md:w-[56%]">
                  <div className="relative rounded-md overflow-hidden shadow-sm">
                    <Image
                      src="/box-large.jpg"    // replace with your large image
                      alt="Product box"
                      width={720}
                      height={720}
                      className="object-cover w-full h-[320px] md:h-[360px]"
                      sizes="(max-width: 768px) 100vw, 45vw"
                      priority
                    />
                  </div>
                </div>

                {/* stacked small images */}
                <div className="w-1/3 md:w-[44%] flex flex-col gap-4">
                  <div className="relative rounded-md overflow-hidden shadow-sm">
                    <Image
                      src="/box-small1.jpg" // replace with small image 1
                      alt="Small 1"
                      width={320}
                      height={160}
                      className="object-cover pb-4 w-full h-[180px]"
                      sizes="(max-width: 768px) 100vw, 20vw"
                      priority
                    />
                  </div>
                  <div className="relative rounded-md overflow-hidden shadow-sm">
                    <Image
                      src="/box-small2.jpg" // replace with small image 2
                      alt="Small 2"
                      width={320}
                      height={160}
                      className="object-cover  w-full h-[180px]"
                      sizes="(max-width: 768px) 100vw, 20vw"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: heading, paragraphs, CTA */}
              <div className="w-full md:w-6/12">
                <h2 className="font-general-sans font-[450] text-3xl md:text-4xl lg:text-5xl text-[#121212] leading-tight mb-4">
                  A Legacy of Sweet Excellence
                </h2>

                <p className="text-sm md:text-base text-[#444444] mb-4 max-w-xl">
                  With over four decades of mastery in crafting premium Indian sweets,
                  Chhappanbhog stands as a hallmark of tradition, purity, and flavor.
                </p>

                <p className="text-sm md:text-base text-[#444444] mb-6 max-w-xl">
                  Our commitment is simple yet profound — to bring the rich, authentic taste of India's royal heritage
                  to your celebrations, one exquisite bite at a time.
                </p>

                <div>
                  <Link
                    href="/about"
                    className="inline-block bg-[#a02126] hover:bg-[#7f1a1f] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-md font-medium transition-colors shadow-sm"
                  >
                    Learn More
                  </Link>
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
            {/* You can use an SVG or PNG file: /about/floral.svg */}
            <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px]">
              <Image
                src="/floral.svg" // decorative floral svg (low-contrast)
                alt=""
                width={420}
                height={420}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* rounded card visual border (subtle): using pseudo but we mimic with an overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)',
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
