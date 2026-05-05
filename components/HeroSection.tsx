'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetchHeroSlides, HeroSlide } from '@/lib/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './hero/hero-slider.module.css';

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

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

  // Default slides fallback
  const getDefaultSlides = (): HeroSlide[] => [
    { id: '1', image: '/1.jpg', order: 0, isActive: true },
    { id: '2', image: '/banner-2.png', order: 1, isActive: true },
    { id: '3', image: '/banner-3.png', order: 2, isActive: true },
  ];

  if (loading) {
    // Static skeleton — does NOT block LCP
    return (
      <section className="w-full -mt-4 mb-4">
        <div className="w-full h-[550px] sm:h-[650px] md:h-[485px] lg:h-[550px] relative overflow-hidden bg-[#FDF8F3]">
          <div className="w-full h-full bg-gradient-to-r from-[#FDF8F3] via-[#f5ead8] to-[#FDF8F3] animate-pulse" />
        </div>
      </section>
    );
  }
  
  if (slides.length === 0) return null;

  return (
    <section className="relative w-full -mt-0 mb-0 group heroContainer">
      <div className={`relative w-full h-[550px] sm:h-[650px] md:h-[485px] lg:h-[550px] bg-[#FDF8F3] overflow-hidden ${styles.heroContainer}`}>
        
        {/* Swiper Slider */}
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1200}
          loop={slides.length > 1}
          autoplay={slides.length > 1 ? { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
          navigation={
            slides.length > 1
              ? { prevEl: '.hero-prev', nextEl: '.hero-next' }
              : false
          }
          pagination={
            slides.length > 1
              ? { el: '.hero-pagination', clickable: true }
              : false
          }
          className={styles.heroSwiper}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id} className="relative w-full h-full overflow-hidden">
              <Link href="/products" className="block w-full h-full relative">
                {/* Desktop image with Ken Burns */}
                <div className={`relative w-full h-full hidden md:block ${styles.kenBurnsImage}`}>
                  <Image
                    src={slide.image}
                    alt={slide.title ? `${slide.title} - Gopi Misthan Bhandar` : `Gopi Misthan Bhandar Traditional Sweets`}
                    fill
                    className="object-cover object-center"
                    priority={index === 0}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    sizes="100vw"
                  />
                </div>
                {/* Mobile image with Ken Burns */}
                <div className={`relative w-full h-full md:hidden ${styles.kenBurnsImage}`}>
                  <Image
                    src={(slide as any).mobileImage || slide.image}
                    alt={slide.title ? `${slide.title} - Gopi Misthan Bhandar` : `Gopi Misthan Bhandar Traditional Sweets`}
                    fill
                    className="object-contain object-top"
                    priority={index === 0}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    sizes="100vw"
                  />
                </div>
                {/* Optional overlay pattern */}
                <div className={styles.patternOverlay} />
              </Link>
            </SwiperSlide>
          ))}

          {/* Navigation Arrows */}
          {slides.length > 1 && !enquiryOpen && (
            <>
              <button
                className={`hero-prev ${styles.navButton} ${styles.navPrev}`}
                aria-label="Previous slide"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
              <button
                className={`hero-next ${styles.navButton} ${styles.navNext}`}
                aria-label="Next slide"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>

              {/* Custom Pagination Container */}
              <div className={`hero-pagination ${styles.pagination}`} />
            </>
          )}
        </Swiper>
      </div>
    </section>
  );
};

export default HeroSection;