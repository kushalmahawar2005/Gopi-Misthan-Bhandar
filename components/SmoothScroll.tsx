'use client';

import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    // ---------------------------------------------
    // SMOOTH SCROLL FUNCTION
    // ---------------------------------------------
    const smoothScroll = (target: HTMLElement | number, offset: number = 0) => {
      const targetPosition =
        typeof target === 'number'
          ? target
          : target.getBoundingClientRect().top + window.pageYOffset - offset;

      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = Math.min(Math.abs(distance) * 0.5, 1000);

      let start: number | null = null;

      const easeInOutCubic = (t: number): number =>
        t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;

        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);

        window.scrollTo({
          top: startPosition + distance * easeInOutCubic(progress),
        });

        if (progress < 1) requestAnimationFrame(animation);
      };

      requestAnimationFrame(animation);
    };

    // ---------------------------------------------
    // ANCHOR CLICK HANDLER (#section)
    // ---------------------------------------------
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();

      const id = href.replace('#', '');
      const element = document.getElementById(id);

      if (element) {
        smoothScroll(element, 80);
      } else {
        smoothScroll(0);
      }
    };

    // Save original scrolling functions
    const originalScrollTo = window.scrollTo.bind(window);
    const originalScrollBy = window.scrollBy.bind(window);

    // ---------------------------------------------
    // SAFE OVERRIDE FOR scrollTo
    // ---------------------------------------------
    (window as any).scrollTo = function (
      options?: ScrollToOptions | number,
      y?: number
    ) {
      if (typeof options === 'object' && options?.behavior === 'smooth') {
        smoothScroll(options.top || 0);
      } else if (typeof options === 'number') {
        smoothScroll(options);
      } else {
        originalScrollTo(options as any, y as any);
      }
    };

    // ---------------------------------------------
    // SAFE OVERRIDE FOR scrollBy
    // ---------------------------------------------
    (window as any).scrollBy = function (
      options?: ScrollToOptions | number,
      y?: number
    ) {
      if (typeof options === 'object' && options?.behavior === 'smooth') {
        const current = window.pageYOffset;
        smoothScroll(current + (options.top || 0));
      } else if (typeof options === 'number') {
        const current = window.pageYOffset;
        smoothScroll(current + (y || 0));
      } else {
        originalScrollBy(options as any, y as any);
      }
    };

    // ---------------------------------------------
    // EVENT LISTENER
    // ---------------------------------------------
    document.addEventListener('click', handleAnchorClick);

    // ---------------------------------------------
    // CLEANUP
    // ---------------------------------------------
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.scrollTo = originalScrollTo;
      window.scrollBy = originalScrollBy;
    };
  }, []);

  return null;
}
