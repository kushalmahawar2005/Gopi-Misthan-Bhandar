'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { fetchAboutContent } from '@/lib/api';

interface AboutCard {
  heading?: string;
  description?: string;
  mainImage?: string;
  smallImage1?: string;
  smallImage2?: string;
  order?: number;
}

interface AboutContent {
  aboutCards?: AboutCard[];
  title?: string;
  description?: string;
  content?: {
    heading?: string;
    text?: string;
  };
  images?: string[];
}

const AboutHero: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadContent();

    const refreshInterval = setInterval(() => {
      loadContent();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const loadContent = async () => {
    try {
      const data = await fetchAboutContent();
      if (data) {
        if (data.aboutCards && Array.isArray(data.aboutCards) && data.aboutCards.length > 0) {
          data.aboutCards.sort((a: AboutCard, b: AboutCard) => (a?.order ?? 0) - (b?.order ?? 0));
          setContent(data);
        } else {
          setContent({
            aboutCards: [
              {
                heading: 'A Legacy of Sweet Excellence',
                description:
                  'With over four decades of mastery in crafting premium Indian sweets, Chhappanbhog stands as a hallmark of tradition, purity, and flavor.',
                mainImage: '/box-large.jpg',
                smallImage1: '/box-small1.jpg',
                smallImage2: '/box-small2.jpg',
                order: 0,
              },
            ],
          });
        }
      } else {
        setContent({
          aboutCards: [
            {
              heading: 'A Legacy of Sweet Excellence',
              description:
                'With over four decades of mastery in crafting premium Indian sweets, Chhappanbhog stands as a hallmark of tradition, purity, and flavor.',
              mainImage: '/box-large.jpg',
              smallImage1: '/box-small1.jpg',
              smallImage2: '/box-small2.jpg',
              order: 0,
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error loading about content:', error);
      setContent({
        aboutCards: [
          {
            heading: 'A Legacy of Sweet Excellence',
            description:
              'With over four decades of mastery in crafting premium Indian sweets, Chhappanbhog stands as a hallmark of tradition, purity, and flavor.',
            mainImage: '/box-large.jpg',
            smallImage1: '/box-small1.jpg',
            smallImage2: '/box-small2.jpg',
            order: 0,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cards = content?.aboutCards || [];
    if (cards.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % cards.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [content?.aboutCards]);

  const nextSlide = () => {
    const cards = content?.aboutCards || [];
    if (cards.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % cards.length);
    }
  };

  const prevSlide = () => {
    const cards = content?.aboutCards || [];
    if (cards.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + cards.length) % cards.length);
    }
  };

  if (loading) {
    return (
      <section className="w-full px-4 md:px-8 lg:px-16 py-12 md:py-20" style={{ backgroundColor: '#FFE3C2' }}>
        <div className="mx-auto w-full min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ec2e7a] mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!content) return null;

  const cards = content.aboutCards || [];
  const hasCards = cards.length > 0;

  if (!hasCards && (content.title || content.description || content.content)) {
    const legacyCard: AboutCard = {
      heading: content.title || content.content?.heading || 'A Legacy of Sweet Excellence',
      description: content.description || content.content?.text || '',
      mainImage: content.images?.[0] || '/box-large.jpg',
      smallImage1: content.images?.[1] || '/box-small1.jpg',
      smallImage2: content.images?.[2] || '/box-small2.jpg',
      order: 0,
    };
    cards.push(legacyCard);
  }

  if (cards.length === 0) return null;

  return (
    <section
      aria-labelledby="about-hero-title"
      className="w-full relative overflow-hidden flex flex-col items-center justify-center pb-16 md:pb-28 px-4 sm:px-12 md:px-16"
      style={{ backgroundColor: '#FDE8D4' }}
    >
      {/* Decorative full-width banner separator right at the top */}
      <div className="w-full absolute top-0 left-0 pointer-events-none z-0 overflow-hidden h-[180px] md:h-[220px] lg:h-[260px]">
        <img
          src="/back3.png"
          alt="Decorative separator"
          className="w-full h-full object-cover"
          style={{ objectPosition: "center bottom" }}
        />
      </div>

      {cards.length > 1 && (
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-[#ec2e7a] text-white p-3 md:p-4 rounded-lg shadow-xl z-30 hover:bg-[#d4266c] hover:-translate-x-1 transition-all"
        >
          <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {cards.length > 1 && (
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-[#ec2e7a] text-white p-3 md:p-4 rounded-lg shadow-xl z-30 hover:bg-[#d4266c] hover:translate-x-1 transition-all"
        >
          <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      <div className="w-full max-w-7xl relative mx-auto min-h-[500px] flex items-center mt-12 md:mt-24 lg:mt-32">
        {cards.map((card, index) => {
          const isCurrent = index === currentSlide;

          return (
            <div
              key={index}
              className={`transition-all duration-1000 ease-in-out w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16 pt-12 md:pt-16 ${isCurrent
                ? 'opacity-100 translate-y-0 relative z-20'
                : 'opacity-0 absolute inset-0 pointer-events-none translate-y-8'
                }`}
            >
              <div className="w-full lg:w-[45%] xl:w-[40%] flex justify-center">
                <div className="relative w-full max-w-[380px] md:max-w-[420px] aspect-[4/5] rounded-t-full rounded-b-2xl overflow-hidden shadow-2xl ring-8 ring-white/30 transform transition-transform duration-700 hover:scale-[1.02]">
                  <Image
                    src={card.mainImage || '/box-large.jpg'}
                    alt={card.heading || 'Assorted sweets'}
                    fill
                    className="object-cover object-center"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 shadow-[inset_0_-40px_60px_rgba(0,0,0,0.1)] pointer-events-none rounded-t-full rounded-b-2xl"></div>
                </div>
              </div>

              <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col items-center flex-1 text-center mt-2 md:mt-0">
                {card.heading && (
                  <h2
                    id="about-hero-title"
                    className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-[#1e3a8a] font-bold tracking-tight leading-[1.15] mb-4 max-w-2xl px-2 drop-shadow-sm"
                  >
                    {card.heading}
                  </h2>
                )}

                <div className="flex items-center justify-center gap-4 text-[#ec2e7a] my-5 md:my-6">
                  <span className="text-xl md:text-2xl mt-1">✦</span>
                  <span className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl tracking-[0.2em]" style={{ color: '#ec2e7a' }}>
                    2 0 2 5
                  </span>
                  <span className="text-xl md:text-2xl mt-1">✦</span>
                </div>

                {card.description && (
                  <p className="text-[#3a3a3a] font-medium text-base md:text-lg lg:text-[1.1rem] leading-[1.8] max-w-2xl mx-auto px-4 md:px-8 mb-8 md:mb-12">
                    {card.description}
                  </p>
                )}

                <div className="w-full flex justify-center lg:justify-end px-4 md:px-8 xl:px-12 mt-4">
                  <Link
                    href="/about"
                    className="bg-[#ec2e7a] hover:bg-[#d4266c] text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-serif text-lg md:text-xl transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl flex items-center gap-3 relative inline-flex group"
                  >
                    <span className="relative z-10">Read More</span>
                    <FiArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    <span className="absolute -top-3 -right-3 text-yellow-400 text-3xl animate-[spin_6s_linear_infinite] pointer-events-none drop-shadow-md z-20">
                      ✱
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {cards.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[#ec2e7a] w-8' : 'bg-[#ec2e7a]/30'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AboutHero;