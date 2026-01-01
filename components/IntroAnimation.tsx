'use client';

import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import SplitText from './SplitText';
import PromotionalBanner from './sections/PromotionalBanner';

const IntroAnimation = () => {
  const [showTitle, setShowTitle] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize banner as hidden off-screen
    if (bannerRef.current) {
      gsap.set(bannerRef.current, {
        x: -window.innerWidth,
        opacity: 0
      });
    }
  }, []);

  const handleTitleAnimationComplete = () => {
    // Wait a bit before fading out the title
    setTimeout(() => {
      if (titleRef.current) {
        gsap.to(titleRef.current, {
          opacity: 0,
          y: -30,
          duration: 0.8,
          ease: 'power2.in',
          onComplete: () => {
            setShowTitle(false);
            // Start banner animation
            setTimeout(() => {
              if (bannerRef.current) {
                gsap.to(bannerRef.current, {
                  x: 0,
                  opacity: 1,
                  duration: 1.2,
                  ease: 'power3.out',
                  onComplete: () => {
                    // Ensure banner stays visible - clear transform but keep final state
                    if (bannerRef.current) {
                      gsap.set(bannerRef.current, {
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
    <>
      {showTitle && (
        <div
          ref={titleRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-center px-4">
            <SplitText
              text="Gopi Misthan Bhandar, Neemuch"
              className="text-4xl md:text-5xl lg:text-6xl font-general-sansal-sansal-sansal-sans font-bold text-[#941a1f]"
              delay={80}
              duration={0.5}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 50 }}
              to={{ opacity: 1, y: 0 }}
              scrollTrigger={false}
              onLetterAnimationComplete={handleTitleAnimationComplete}
              tag="h1"
            />
          </div>
        </div>
      )}
      
      {/* Banner is always rendered, will be animated when title fades out */}
      <div ref={bannerRef} className="w-full">
        <PromotionalBanner />
      </div>
    </>
  );
};

export default IntroAnimation;

