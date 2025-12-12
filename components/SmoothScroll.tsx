'use client';

import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {

    // Smooth scroll function
    const smoothScroll = (target: HTMLElement | number, offset: number = 0) => {
      const targetPosition =
        typeof target === 'number'
          ? target
          : target.getBoundingClientRect().top + window.pageYOffset - offset;

      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = Math.min(Math.abs(distance) * 0.5, 1000); // max 1 second

      let start: number | null = null;

      const easeInOutCubic = (t: number): number => {
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

    //-----------------------------------------------------
    // Anchor Link Click Handler
    //-----------------------------------------------------
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;

      if (!anchor) return;
      if (anchor.getAttribute('href') === '#') return;

      e.preventDefault();
      const href = anchor.getAttribute('href');
      if (!href) return;

      const sectionId = href.substring(1);
      const section = document.getElementById(sectionId);

      if (section) {
        const headerOffset = 80;
        smoothScroll(section, headerOffset);
      } else {
        smoothScroll(0);
      }
    };

    //-----------------------------------------------------
    // Override scrollTo + scrollBy safely using "as any"
    //-----------------------------------------------------
    const originalScrollTo = window.scrollTo.bind(window);
    const originalScrollBy = window.scrollBy.bind(window);

    (window as any).scrollTo = function (options?: ScrollToOptions | number, y?: number) {
      if (typeof options === 'object' && options?.behavior === 'smooth') {
        smoothScroll(options.top || 0);
      } else if (typeof options === 'number') {
        smoothScroll(options);
      } else {
        originalScrollTo(options as any, y as any);
      }
    };

    (window as any).scrollBy = function (options?: ScrollToOptions | number, y?: number) {
      if (typeof options === 'object' && options?.behavior === 'smooth') {
        const current = window.pageYOffset;
        smoothScroll(current + (options.top || 0));
      } else if (typeof options === 'number' && typeof y === 'number') {
        const current = window.pageYOffset;
        smoothScroll(current + y);
      } else {
        originalScrollBy(options as any, y as any);
      }
    };

    //-----------------------------------------------------
    // Event Listeners
    //-----------------------------------------------------
    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.scrollTo = originalScrollTo;
      window.scrollBy = originalScrollBy;
    };
  }, []);

  return null;
}
