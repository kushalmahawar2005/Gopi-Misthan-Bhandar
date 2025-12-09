'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollStack, { ScrollStackItem } from '../ScrollStack';

const AboutHero: React.FC = () => {
  return (
    <section className="w-full px-4 md:px-8 lg:px-16 pt-0 pb-12 md:pb-20">
      <ScrollStack
        useWindowScroll={true}
        itemDistance={150}
        itemScale={0.04}
        itemStackDistance={35}
        stackPosition="0%"
        scaleEndPosition="20%"
        baseScale={0.92}
        rotationAmount={0}
        blurAmount={0.5}
      >
        {/* Card 1: Legacy & Excellence */}
        <ScrollStackItem>
          <div
            className="mx-auto w-full max-w-6xl rounded-xl overflow-hidden"
            style={{
              backgroundColor: '#f5ebe0',
              backgroundImage: "url('/about/bg-pattern.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '520px',
            }}
          >
            <div className="px-6 md:px-14 lg:px-12 py-10 md:py-14 lg:py-16 relative">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                {/* LEFT: image group */}
                <div className="w-full md:w-6/12 pr-4 flex items-start gap-4">
                  {/* large image */}
                  <div className="w-2/3 md:w-[56%]">
                    <div className="relative rounded-md overflow-hidden shadow-sm">
                      <Image
                        src="/box-large.jpg"
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
                        src="/box-small1.jpg"
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
                        src="/box-small2.jpg"
                        alt="Small 2"
                        width={320}
                        height={160}
                        className="object-cover w-full h-[180px]"
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
        </ScrollStackItem>

        {/* Card 2: Tradition & Heritage */}
        <ScrollStackItem>
          <div
            className="mx-auto w-full max-w-6xl rounded-xl overflow-hidden"
            style={{
              backgroundColor: '#f5ebe0',
              backgroundImage: "url('/about/bg-pattern.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '520px',
            }}
          >
            <div className="px-6 md:px-14 lg:px-12 py-10 md:py-14 lg:py-16 relative">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                {/* LEFT: Content */}
                <div className="w-full md:w-6/12">
                  <h2 className="font-general-sans font-[450] text-3xl md:text-4xl lg:text-5xl text-[#121212] leading-tight mb-4">
                    Tradition Meets Innovation
                  </h2>

                  <p className="text-sm md:text-base text-[#444444] mb-4 max-w-xl">
                    At Gopi Misthan Bhandar, we honor the timeless recipes passed down through generations,
                    while embracing modern techniques to ensure consistency and quality in every batch.
                  </p>

                  <p className="text-sm md:text-base text-[#444444] mb-6 max-w-xl">
                    Our master craftsmen blend age-old wisdom with contemporary standards, creating sweets
                    that not only taste divine but also meet the highest standards of hygiene and freshness.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/50 rounded-lg p-4">
                      <h3 className="font-semibold text-lg text-[#121212] mb-2">40+ Years</h3>
                      <p className="text-sm text-[#444444]">Of Excellence</p>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4">
                      <h3 className="font-semibold text-lg text-[#121212] mb-2">100%</h3>
                      <p className="text-sm text-[#444444]">Pure Ingredients</p>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Image */}
                <div className="w-full md:w-6/12">
                  <div className="relative rounded-md overflow-hidden shadow-sm">
                    <Image
                      src="/Hamper.jpg"
                      alt="Traditional sweets"
                      width={600}
                      height={400}
                      className="object-cover w-full h-[300px] md:h-[400px] rounded-lg"
                      sizes="(max-width: 768px) 100vw, 45vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollStackItem>

        {/* Card 3: Quality & Commitment */}
        <ScrollStackItem>
          <div
            className="mx-auto w-full max-w-6xl rounded-xl overflow-hidden"
            style={{
              backgroundColor: '#f5ebe0',
              backgroundImage: "url('/about/bg-pattern.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '520px',
            }}
          >
            <div className="px-6 md:px-14 lg:px-12 py-10 md:py-14 lg:py-16 relative">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="font-general-sans font-[450] text-3xl md:text-4xl lg:text-5xl text-[#121212] leading-tight mb-6">
                  Our Promise to You
                </h2>

                <p className="text-base md:text-lg text-[#444444] mb-8 max-w-3xl mx-auto leading-relaxed">
                  Every sweet that leaves our kitchen is a testament to our unwavering commitment to quality,
                  authenticity, and your satisfaction. We source only the finest ingredients and craft each
                  delicacy with love and precision.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/50 rounded-lg p-6">
                    <div className="w-16 h-16 bg-[#a02126] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">🎯</span>
                    </div>
                    <h3 className="font-semibold text-xl text-[#121212] mb-2">Premium Quality</h3>
                    <p className="text-sm text-[#444444]">
                      Handpicked ingredients sourced from trusted suppliers
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-6">
                    <div className="w-16 h-16 bg-[#a02126] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">❤️</span>
                    </div>
                    <h3 className="font-semibold text-xl text-[#121212] mb-2">Made with Love</h3>
                    <p className="text-sm text-[#444444]">
                      Every recipe crafted with passion and traditional expertise
                    </p>
                  </div>

                  <div className="bg-white/50 rounded-lg p-6">
                    <div className="w-16 h-16 bg-[#a02126] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">🚚</span>
                    </div>
                    <h3 className="font-semibold text-xl text-[#121212] mb-2">Fresh Delivery</h3>
                    <p className="text-sm text-[#444444]">
                      Delivered fresh to your doorstep, maintaining quality
                    </p>
                  </div>
                </div>

                <div>
                  <Link
                    href="/products"
                    className="inline-block bg-[#a02126] hover:bg-[#7f1a1f] text-white px-8 md:px-10 py-3 md:py-4 rounded-md font-medium transition-colors shadow-sm text-lg"
                  >
                    Explore Our Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollStackItem>
      </ScrollStack>
    </section>
  );
};

export default AboutHero;
