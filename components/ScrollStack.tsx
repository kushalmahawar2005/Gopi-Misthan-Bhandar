'use client';

import { useLayoutEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import './ScrollStack.css';

export const ScrollStackItem = ({ children, itemClassName = '' }: { children: React.ReactNode; itemClassName?: string }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface ScrollStackProps {
  children: React.ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete
}: ScrollStackProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const lastTransformsRef = useRef(new Map<number, { translateY: number; scale: number; rotation: number; blur: number }>());
  const isUpdatingRef = useRef(false);
  const initialCardPositionsRef = useRef(new Map<number, number>());
  const lastScrollTopRef = useRef(0);
  const updateRequestRef = useRef<number | null>(null);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (end === start) return 0;
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value.toString());
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight
      };
    } else {
      const scroller = scrollerRef.current;
      if (!scroller) {
        return {
          scrollTop: 0,
          containerHeight: 0
        };
      }
      return {
        scrollTop: scroller.scrollTop,
        containerHeight: scroller.clientHeight
      };
    }
  }, [useWindowScroll]);

  const getInitialCardPosition = useCallback((card: HTMLElement, index: number): number => {
    const cached = initialCardPositionsRef.current.get(index);
    if (cached !== undefined) {
      return cached;
    }
    
    // Get initial position without transforms
    if (useWindowScroll) {
      // For window scroll, get the card's position relative to document
      const rect = card.getBoundingClientRect();
      const position = rect.top + window.scrollY;
      initialCardPositionsRef.current.set(index, position);
      return position;
    } else {
      const position = card.offsetTop;
      initialCardPositionsRef.current.set(index, position);
      return position;
    }
  }, [useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    const { scrollTop, containerHeight } = getScrollData();
    
    // Skip if scroll hasn't changed significantly
    if (Math.abs(scrollTop - lastScrollTopRef.current) < 0.5 && lastScrollTopRef.current !== 0) {
      isUpdatingRef.current = false;
      return;
    }
    
    lastScrollTopRef.current = scrollTop;

    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElement = useWindowScroll
      ? document.querySelector('.scroll-stack-end')
      : scrollerRef.current?.querySelector('.scroll-stack-end');

    const endElementTop = endElement ? getInitialCardPosition(endElement as HTMLElement, -1) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      // Use initial position (before transforms) for calculations
      const cardInitialTop = getInitialCardPosition(card, i);

      const triggerStart = cardInitialTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardInitialTop - scaleEndPositionPx;
      const pinStart = cardInitialTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      // For cards before pin range, keep them at initial state
      if (scrollTop < pinStart - 100) {
        const lastTransform = lastTransformsRef.current.get(i);
        if (!lastTransform || lastTransform.translateY !== 0 || lastTransform.scale !== 1) {
          card.style.transform = 'translate3d(0, 0, 0) scale(1)';
          card.style.filter = 'none';
          lastTransformsRef.current.set(i, {
            translateY: 0,
            scale: 1,
            rotation: 0,
            blur: 0
          });
        }
        return;
      }

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = Math.max(0.85, Math.min(1, 1 - scaleProgress * (1 - targetScale)));

      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCard = cardsRef.current[j];
          if (!jCard) continue;
          const jCardInitialTop = getInitialCardPosition(jCard, j);
          const jTriggerStart = jCardInitialTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }
        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
      if (isPinned) {
        translateY = scrollTop - cardInitialTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardInitialTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform = {
        translateY: Math.round(translateY * 10) / 10,
        scale: Math.round(scale * 100) / 100,
        rotation: Math.round(rotation * 10) / 10,
        blur: Math.round(blur * 10) / 10
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.01 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.5 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.3;

      if (hasChanged) {
        const rotationStr = newTransform.rotation !== 0 ? ` rotate(${newTransform.rotation}deg)` : '';
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale})${rotationStr}`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : 'none';

        card.style.transform = transform;
        card.style.filter = filter;

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
    getInitialCardPosition
  ]);

  const handleScroll = useCallback(() => {
    // Cancel any pending update
    if (updateRequestRef.current !== null) {
      cancelAnimationFrame(updateRequestRef.current);
    }
    
    // Schedule update in next frame
    updateRequestRef.current = requestAnimationFrame(() => {
      updateCardTransforms();
      updateRequestRef.current = null;
    });
  }, [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.12,
        syncTouch: true,
        syncTouchLerp: 0.1
      });

      lenis.on('scroll', handleScroll);

      const raf = (time: number) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };

      animationFrameRef.current = requestAnimationFrame(raf);
      lenisRef.current = lenis;

      return lenis;
    } else {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const lenis = new Lenis({
        wrapper: scroller,
        content: scroller.querySelector('.scroll-stack-inner') as HTMLElement,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.12,
        syncTouch: true,
        syncTouchLerp: 0.1
      } as any);

      lenis.on('scroll', handleScroll);

      const raf = (time: number) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };

      animationFrameRef.current = requestAnimationFrame(raf);
      lenisRef.current = lenis;

      return lenis;
    }
  }, [handleScroll, useWindowScroll]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const cards = Array.from(
        useWindowScroll
          ? document.querySelectorAll('.scroll-stack-card')
          : scroller.querySelectorAll('.scroll-stack-card')
      ) as HTMLElement[];

      if (cards.length === 0) return;

      cardsRef.current = cards;
      initialCardPositionsRef.current.clear();
      lastTransformsRef.current.clear();

      // Get section top offset for first card adjustment
      let sectionTopOffset = 0;
      if (useWindowScroll && cards.length > 0) {
        const firstCard = cards[0];
        const firstCardRect = firstCard.getBoundingClientRect();
        const sectionElement = firstCard.closest('section');
        if (sectionElement) {
          const sectionRect = sectionElement.getBoundingClientRect();
          sectionTopOffset = sectionRect.top + window.scrollY;
        }
      }

      cards.forEach((card, i) => {
        if (i < cards.length - 1) {
          card.style.marginBottom = `${itemDistance}px`;
        }

        card.style.willChange = 'transform';
        card.style.transformOrigin = 'center center';
        card.style.backfaceVisibility = 'hidden';
        card.style.transform = 'translate3d(0, 0, 0) scale(1)';
        card.style.webkitTransform = 'translate3d(0, 0, 0) scale(1)';
        card.style.position = 'relative';
        card.style.marginLeft = 'auto';
        card.style.marginRight = 'auto';
        card.style.contain = 'layout style paint';
        
        // Store initial position
        const rect = card.getBoundingClientRect();
        let initialPos = useWindowScroll ? rect.top + window.scrollY : card.offsetTop;
        
        // For first card, adjust position to start at section top
        if (i === 0 && useWindowScroll && sectionTopOffset > 0) {
          initialPos = sectionTopOffset;
        }
        
        initialCardPositionsRef.current.set(i, initialPos);
        
        // Initialize transform cache
        lastTransformsRef.current.set(i, {
          translateY: 0,
          scale: 1,
          rotation: 0,
          blur: 0
        });
      });

      setupLenis();
      
      // Initial update after a small delay
      setTimeout(() => {
        updateCardTransforms();
      }, 100);
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (updateRequestRef.current !== null) {
        cancelAnimationFrame(updateRequestRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      initialCardPositionsRef.current.clear();
      lastTransformsRef.current.clear();
      isUpdatingRef.current = false;
      lastScrollTopRef.current = 0;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    updateCardTransforms
  ]);

  return (
    <div className={`scroll-stack-scroller ${useWindowScroll ? 'use-window-scroll' : ''} ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
