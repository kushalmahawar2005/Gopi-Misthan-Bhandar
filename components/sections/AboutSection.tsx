'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
        
        // FIXED SORT FUNCTION (TS SAFE)
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
    }, 5000);

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

  const goToSlide = (index: number) => {
    const cards = content?.aboutCards || [];
    if (index >= 0 && index < cards.length) {
      setCurrentSlide(index);
    }
  };

  if (loading) {
    return (
      <section className="w-full px-4 md:px-8 lg:px-16 pt-0 pb-12 md:pb-20">
        <div className="mx-auto w-full rounded-xl overflow-hidden bg-[#f7db9d] min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a02126] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
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

  const currentCard = cards[currentSlide] || cards[0];

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
          <div className="relative">

            {cards.map((card, index) => (
              <div
                key={index}
                className={`transition-opacity duration-700 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">

                  <div className="w-full md:w-6/12">
                    {card.heading && (
                      <h2
                        id="about-hero-title"
                        className="font-geom font-[450] text-3xl md:text-4xl lg:text-5xl text-[#121212] leading-tight mb-4"
                      >
                        {card.heading}
                      </h2>
                    )}

                    {card.description && (
                      <p className="text-sm md:text-base text-[#444444] mb-6 max-w-xl">
                        {card.description}
                      </p>
                    )}

                    <Link
                      href="/about"
                      className="inline-block bg-[#a02126] hover:bg-[#7f1a1f] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-md font-medium transition-colors shadow-sm"
                    >
                      Learn More
                    </Link>
                  </div>

                  <div className="w-full md:w-6/12 pr-0 md:pr-4 flex items-start gap-4">
                    <div className="w-full md:w-2/3">
                      <div className="relative rounded-md overflow-hidden shadow-sm">
                        <Image
                          src={card.mainImage || '/box-large.jpg'}
                          alt={card.heading || 'Assorted sweets'}
                          width={720}
                          height={720}
                          className="object-cover w-full h-[320px] md:h-[360px]"
                          priority={index === 0}
                        />
                      </div>
                    </div>

                    <div className="hidden md:flex md:w-1/3 flex-col gap-4">
                      {card.smallImage1 && (
                        <div className="relative rounded-md overflow-hidden shadow-sm">
                          <Image
                            src={card.smallImage1}
                            alt="Small image 1"
                            width={320}
                            height={180}
                            className="object-cover w-full h-[180px]"
                          />
                        </div>
                      )}

                      {card.smallImage2 && (
                        <div className="relative rounded-md overflow-hidden shadow-sm">
                          <Image
                            src={card.smallImage2}
                            alt="Small image 2"
                            width={320}
                            height={180}
                            className="object-cover w-full h-[180px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {cards.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-20 opacity-70 hover:opacity-100"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-20 opacity-70 hover:opacity-100"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {cards.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {cards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide ? 'bg-[#a02126] w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-6 md:right-10 lg:right-16 flex items-center"
            style={{ opacity: 0.12 }}
          >
            <div className="w-[420px] h-[420px]">
              <Image
                src="/floral.svg"
                alt=""
                width={420}
                height={420}
                className="object-contain"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutHero;
