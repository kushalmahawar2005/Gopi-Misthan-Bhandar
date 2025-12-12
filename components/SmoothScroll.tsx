'use client';

import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    // Enhanced smooth scroll function
    const smoothScroll = (target: HTMLElement | number, offset: number = 0) => {
      const targetPosition = typeof target === 'number' 
        ? target 
        : target.getBoundingClientRect().top + window.pageYOffset - offset;
      
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = Math.min(Math.abs(distance) * 0.5, 1000); // Max 1 second
      let start: number | null = null;

      const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        
        window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    };

    // Handle anchor link clicks
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement;
      
      if (anchor && anchor.getAttribute('href') !== '#') {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            const headerOffset = 80; // Account for fixed header
            smoothScroll(targetElement, headerOffset);
          } else {
            // If element not found, try smooth scroll to top
            smoothScroll(0);
          }
        }
      }
    };

    // Handle programmatic scrolls
    const handleScroll = () => {
      // This ensures smooth scrolling even for programmatic scrolls
      if (window.scrollY !== undefined) {
        // Browser supports smooth scroll
        return;
      }
    };

    // Override window.scrollTo for smooth behavior
    const originalScrollTo = window.scrollTo;
    const scrollToObject = (options: ScrollToOptions) => {
      originalScrollTo(options);
    };
    const scrollToNumbers = (x: number, y: number) => {
      originalScrollTo(x, y);
    };
    
    window.scrollTo = function(options?: ScrollToOptions | number, y?: number) {
      if (typeof options === 'object' && options) {
        if (options.behavior === 'smooth' && typeof options.top === 'number') {
          smoothScroll(options.top);
        } else {
          // Use the object overload
          scrollToObject(options);
        }
      } else if (typeof options === 'number' && typeof y === 'number') {
        smoothScroll(y);
      } else if (typeof options === 'number') {
        // Use the two-number overload
        scrollToNumbers(options, y || 0);
      } else {
        // Default: no arguments or invalid
        scrollToObject({});
      }
    };

    // Override window.scrollBy for smooth behavior
    const originalScrollBy = window.scrollBy;
    const scrollByObject = (options: ScrollToOptions) => {
      originalScrollBy(options);
    };
    const scrollByNumbers = (x: number, y: number) => {
      originalScrollBy(x, y);
    };
    
    window.scrollBy = function(options?: ScrollToOptions | number, y?: number) {
      if (typeof options === 'object' && options) {
        if (options.behavior === 'smooth' && typeof options.top === 'number') {
          const currentScroll = window.pageYOffset;
          smoothScroll(currentScroll + options.top);
        } else {
          // Use the object overload
          scrollByObject(options);
        }
      } else if (typeof options === 'number' && typeof y === 'number') {
        const currentScroll = window.pageYOffset;
        smoothScroll(currentScroll + y);
      } else {
        // Default: use the object overload
        scrollByObject(options || {});
      }
    };

    // Add event listeners
    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleScroll);
      window.scrollTo = originalScrollTo;
      window.scrollBy = originalScrollBy;
    };
  }, []);

  return null;
}

