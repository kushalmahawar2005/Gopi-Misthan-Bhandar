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

// Turn off after the Diwali campaign to restore the admin-managed hero slider.
const SHOW_DIWALI_HERO = true;

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const diwaliHeroSlide: HeroSlide = {
    id: 'diwali-showcase-2026',
    image: '/hero/diwali-sangam-barfi.jpg',
    title: 'Diwali ki mithaas, Gopi ke saath',
    order: 0,
    isActive: true,
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
      if (SHOW_DIWALI_HERO) {
        setSlides([diwaliHeroSlide]);
        return;
      }

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
                {slide.id === 'diwali-showcase-2026' ? (
                  <div className="absolute inset-0 overflow-hidden bg-[#fff7ea] text-[#3d2118]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_50%,rgba(250,220,167,0.42),transparent_52%)]" />
                    <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full border border-[#d7ae68]/30 md:h-96 md:w-96" />
                    <div className="absolute -left-10 -top-16 h-60 w-60 rounded-full border border-[#d7ae68]/20 md:h-80 md:w-80" />

                    <div className="absolute right-[5%] top-[5%] hidden h-[90%] w-[36%] items-center justify-center overflow-hidden rounded-[2rem] bg-[#f6e9db] shadow-[0_24px_70px_rgba(87,40,21,0.18)] md:flex lg:right-[8%] lg:w-[34%]">
                      <Image
                        src={slide.image}
                        alt="Festive Sangam Barfi from Gopi Misthan Bhandar"
                        fill
                        priority
                        fetchPriority="high"
                        sizes="(max-width: 1280px) 36vw, 34vw"
                        className="object-contain"
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-[48%] overflow-hidden md:hidden">
                      <Image
                        src={slide.image}
                        alt="Festive Sangam Barfi from Gopi Misthan Bhandar"
                        fill
                        priority
                        fetchPriority="high"
                        sizes="100vw"
                        className="object-cover object-[50%_58%]"
                      />
                      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#fff7ea] to-transparent" />
                    </div>

                    <div className="relative z-10 flex h-full items-start px-6 pb-[53%] pt-10 sm:px-12 sm:pt-14 md:items-center md:px-[9%] md:pb-0 md:pt-0">
                      <div className="max-w-[640px] md:max-w-[50%]">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a5b22] sm:text-xs">
                          Shubh Diwali · Since 1968
                        </p>
                        <h1 className="whitespace-pre-line font-serif text-[34px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#53231f] sm:text-5xl md:text-5xl lg:text-6xl">
                          {'Diwali ki mithaas,\nGopi ke saath.'}
                        </h1>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-[#694a3a] sm:mt-5 sm:text-base sm:leading-7 md:text-lg">
                          Traditional mithai, namkeen and festive gift boxes — lovingly crafted in Neemuch since 1968.
                        </p>
                        <span className="mt-5 inline-flex items-center gap-3 rounded-sm bg-[#7a1f2b] px-5 py-3 text-[11px] font-semibold tracking-[0.14em] text-white shadow-lg shadow-[#7a1f2b]/20 transition-colors group-hover:bg-[#5e1721] sm:mt-7 sm:px-7 sm:py-4 sm:text-xs">
                          VIEW FESTIVE COLLECTION <span aria-hidden="true" className="text-base">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
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
                        src={slide.mobileImage || slide.image}
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
                  </>
                )}
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
