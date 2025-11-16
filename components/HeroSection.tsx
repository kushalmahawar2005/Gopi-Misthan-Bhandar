'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetchHeroSlides, HeroSlide } from '@/lib/api';

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const slidesData = await fetchHeroSlides();
      setSlides(slidesData.length > 0 ? slidesData : getDefaultSlides());
    } catch (error) {
      console.error('Error loading hero slides:', error);
      setSlides(getDefaultSlides());
    } finally {
      setLoading(false);
    }
  };

  // Default slides
  const getDefaultSlides = (): HeroSlide[] => [
    { id: '1', image: '/1.jpg', order: 0, isActive: true },
    { id: '2', image: '/banner-2.png', order: 1, isActive: true },
    { id: '3', image: '/banner-3.png', order: 2, isActive: true },
  ];

  // Auto-slide
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => slides.length && setCurrentSlide((p) => (p + 1) % slides.length);
  const prevSlide = () => slides.length && setCurrentSlide((p) => (p - 1 + slides.length) % slides.length);
  const goToSlide = (i: number) => i >= 0 && i < slides.length && setCurrentSlide(i);

  if (loading) {
    return (
      <section className="w-full h-[500px] md:h-[450px] lg:h-[500px] relative overflow-hidden bg-gray-100">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </section>
    );
  }
  if (slides.length === 0) return null;

  return (
    <section className="relative w-full h-[500px] md:h-[450px] lg:h-[500px] overflow-hidden mt-0">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Desktop */}
            <Image
              src={slide.image}
              alt={`Hero slide ${index + 1}`}
              fill
              className="object-cover object-center hidden md:block"
              priority={index === 0}
              sizes="100vw"
            />
            {/* Mobile */}
            <Image
              src={(slide as any).mobileImage || slide.image}
              alt={`Hero slide ${index + 1}`}
              fill
              className="object-cover object-center md:hidden"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all z-20 opacity-70 hover:opacity-100"
            aria-label="Previous slide"
          >
            <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all z-20 opacity-70 hover:opacity-100"
            aria-label="Next slide"
          >
            <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
