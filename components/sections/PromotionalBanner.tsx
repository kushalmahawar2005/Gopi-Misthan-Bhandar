'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { FiHeart, FiAward, FiPackage, FiTruck } from 'react-icons/fi';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from '../SplitText';
import ClickSpark from '../ClickSpark';

gsap.registerPlugin(ScrollTrigger);

const PromotionalBanner = () => {
  const [showTitle, setShowTitle] = useState(true);
  const [showFeatures, setShowFeatures] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const features = [
    {
      icon: FiHeart,
      image: '/india-map-icon.png', // India map image (if available)
      useImage: true,
      title: 'Loved By India',
      subtitle: 'Loved by 5 lakh+ customers',
    },
    {
      icon: FiAward,
      image: '/experience-icon.png',
      useImage: true,
      title: '60+ Experience',
      subtitle: 'Great experience',
    },
    {
      icon: FiPackage,
      image: '/handmade-icon.png',
      useImage: true,
      title: 'Handmade',
      subtitle: 'Every piece is made with love',
    },
    {
      icon: FiTruck,
      image: '/delivery-icon.png',
      useImage: true,
      title: 'PAN India Delivery',
      subtitle: 'In 5-7 Days* T&C apply',
    },
  ];

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // On mobile, show only title, skip fadeout
    if (isMobile) {
      setShowTitle(true);
      setShowFeatures(false);
      return;
    }

    // Initialize features as hidden (desktop only)
    if (featuresRef.current) {
      gsap.set(featuresRef.current, {
        opacity: 0,
        x: -100
      });
    }

    // Set up ScrollTrigger to detect when section comes into view (desktop only)
    if (sectionRef.current) {
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          setHasAnimated(true);
          // Title animation will start immediately when scrolled into view
        }
      });

      return () => {
        trigger.kill();
      };
    }
  }, [isMobile]);

  const handleTitleAnimationComplete = () => {
    // Skip fadeout on mobile
    if (isMobile) return;
    
    // Only proceed if section has been scrolled into view
    if (!hasAnimated) return;
    
    // Wait a bit before fading out the title
    setTimeout(() => {
      if (titleRef.current) {
        gsap.to(titleRef.current, {
          opacity: 0,
          x: 100,
          duration: 0.8,
          ease: 'power2.in',
          onComplete: () => {
            setShowTitle(false);
            setShowFeatures(true);
            // Start features animation
            setTimeout(() => {
              if (featuresRef.current) {
                gsap.to(featuresRef.current, {
                  opacity: 1,
                  x: 0,
                  duration: 1.2,
                  ease: 'power3.out',
                  onComplete: () => {
                    // Ensure features stay visible - clear transform but keep opacity
                    if (featuresRef.current) {
                      gsap.set(featuresRef.current, {
                        clearProps: 'x'
                      });
                    }
                  }
                });
              }
            }, 100);
          }
        });
      }
    }, 800); // Wait 800ms after title completes before fading out
  };

  return (
    <section ref={sectionRef} className="w-full px-6 md:px-8 lg:px-12 mt-2 md:mt-4">
      <div className="max-w-7xl mx-auto bg-gradient-to-b from-[#941a1f] to-[#a21f28] rounded-xl md:rounded-2xl overflow-hidden">
        <ClickSpark
          sparkColor="#fff"
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <div className="py-6 md:py-8 lg:py-10 min-h-[100px] md:min-h-[110px] flex items-center relative px-4 md:px-6 lg:px-8">
          {/* Title - Mobile: Always show, Desktop: Animation */}
          {showTitle && (
            <div
              ref={titleRef}
              className="flex items-center justify-center w-full absolute inset-0"
            >
              <div className="text-center w-full px-4">
                {isMobile ? (
                  // Mobile: Simple text, no animation
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-general-sans font-[450] text-white">
                    Gopi Misthan Bhandar, Neemuch
                  </h1>
                ) : hasAnimated ? (
                  // Desktop: Animated text
                  <SplitText
                    text="Gopi Misthan Bhandar, Neemuch"
                    className="text-2xl md:text-3xl lg:text-4xl font-general-sans font-[450] text-white"
                    delay={80}
                    duration={0.5}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 30 }}
                    to={{ opacity: 1, y: 0 }}
                    scrollTrigger={false}
                    onLetterAnimationComplete={handleTitleAnimationComplete}
                    tag="h1"
                  />
                ) : (
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-general-sans font-[450] text-white opacity-0">
                    Gopi Misthan Bhandar, Neemuch
                  </h1>
                )}
              </div>
            </div>
          )}

          {/* Features - shown after title fades out */}
          {showFeatures && (
            <div ref={featuresRef} className="grid grid-cols-2 md:grid-cols-4 items-stretch gap-6 md:gap-8 w-full relative z-10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="relative flex items-center">
                    <div className="flex items-start md:items-center gap-4 md:gap-6 w-full">
                      {/* Icon / image container */}
                      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14">
                        {feature.useImage && feature.image ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={feature.image}
                              alt={feature.title}
                              fill
                              className="object-contain filter invert brightness-0"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1">
                        <h3 className="text-white font-serif text-lg md:text-2xl lg:text-2xl leading-tight font-medium">
                          {feature.title}
                        </h3>
                        <p className="text-white/90 text-xs md:text-sm mt-1">{feature.subtitle}</p>
                      </div>
                    </div>

                    {/* vertical divider: show on md and up except after last item */}
                    {index < features.length - 1 && (
                      <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3">
                        <div className="w-px h-16 bg-white/25" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </ClickSpark>
      </div>
    </section>
  );
};

export default PromotionalBanner;
