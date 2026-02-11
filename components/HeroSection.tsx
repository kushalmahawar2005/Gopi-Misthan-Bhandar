'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetchHeroSlides, HeroSlide } from '@/lib/api';

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const touchStart = React.useRef<number | null>(null);
  const touchEnd = React.useRef<number | null>(null);

  // Touch Handlers for Swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  useEffect(() => {
    loadSlides();
  }, []);

  // Hide controls when enquiry modal is open
  useEffect(() => {
    const openHandler = () => setEnquiryOpen(true);
    const closeHandler = () => setEnquiryOpen(false);
    if (typeof window !== 'undefined') {
      window.addEventListener('open-wedding-enquiry', openHandler as EventListener);
      window.addEventListener('close-wedding-enquiry', closeHandler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-wedding-enquiry', openHandler as EventListener);
        window.removeEventListener('close-wedding-enquiry', closeHandler as EventListener);
      }
    };
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
      <section className="w-full -mt-0 md:mt-6">
        <div className="w-full md:max-w-7xl md:mx-auto md:px-8 lg:px-12 h-[calc(100vh-56px)] md:h-[380px] lg:h-[420px] relative overflow-hidden bg-gray-100 rounded-none md:rounded-2xl">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (slides.length === 0) return null;

  return (
    <section className="relative w-full -mt-2 md:mt-0 mb-8 md:mb-0">
      <div className="relative w-full">
        <div
          className="w-full h-[35vh] md:h-[400px] lg:h-[480px] relative overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <Link
                key={slide.id}
                href="/category/sweets"
                className={`absolute inset-0 transition-opacity duration-700 block ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={slide.image}
                    alt={`Hero slide ${index + 1}`}
                    fill
                    className="object-fill object-center hidden md:block"
                    priority={index === 0}
                    sizes="100vw"
                  />
                  <Image
                    src={(slide as any).mobileImage || slide.image}
                    alt={`Hero slide ${index + 1}`}
                    fill
                    className="object-fill object-center md:hidden"
                    priority={index === 0}
                    sizes="100vw"
                  />
                </div>
              </Link>
            ))}
          </div>

          {slides.length > 1 && !enquiryOpen && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {slides.length > 1 && !enquiryOpen && (
          <>
            <button
              onClick={prevSlide}
              className="hidden md:inline-flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all z-30"
              aria-label="Previous slide"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="hidden md:inline-flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all z-30"
              aria-label="Next slide"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSection;