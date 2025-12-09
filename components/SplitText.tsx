'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Try to import GSAP SplitText, fallback to null if not available
let GSAPSplitText: any = null;
try {
  GSAPSplitText = require('gsap/SplitText').SplitText;
  gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);
} catch (e) {
  // GSAP SplitText not available, will use manual splitting
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: string;
  from?: { opacity?: number; y?: number; x?: number };
  to?: { opacity?: number; y?: number; x?: number };
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  onLetterAnimationComplete?: () => void;
  scrollTrigger?: boolean;
}

const SplitText = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
  scrollTrigger = true
}: SplitTextProps) => {
  const ref = useRef<HTMLElement>(null);
  const animationCompletedRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;

      const el = ref.current;
      if ((el as any)._rbsplitInstance) {
        try {
          (el as any)._rbsplitInstance.revert();
        } catch (_) {
          /* ignore */
        }
        (el as any)._rbsplitInstance = null;
      }

      // Manual text splitting fallback if GSAP SplitText is not available
      if (!GSAPSplitText) {
        // Wait for next frame to ensure DOM is ready
        requestAnimationFrame(() => {
          // Create spans for each character
          const chars = text.split('');
          const existingContent = el.textContent || '';
          if (existingContent !== text) {
            el.innerHTML = '';
            const spans: HTMLElement[] = [];
            
            chars.forEach((char, i) => {
              const span = document.createElement('span');
              span.textContent = char === ' ' ? '\u00A0' : char;
              span.style.display = 'inline-block';
              span.className = 'split-char';
              el.appendChild(span);
              spans.push(span);
            });

            const animationConfig: any = {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              onComplete: () => {
                animationCompletedRef.current = true;
                onLetterAnimationComplete?.();
              },
              willChange: 'transform, opacity',
              force3D: true
            };

            if (scrollTrigger) {
              const startPct = (1 - threshold) * 100;
              const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
              const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
              const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
              const sign =
                marginValue === 0
                  ? ''
                  : marginValue < 0
                    ? `-=${Math.abs(marginValue)}${marginUnit}`
                    : `+=${marginValue}${marginUnit}`;
              const start = `top ${startPct}%${sign}`;

              animationConfig.scrollTrigger = {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4
              };
            }

            const tl = gsap.fromTo(spans, { ...from }, animationConfig);
            (el as any)._rbsplitInstance = { revert: () => tl.kill() };
          }
        });
        return;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';

      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;

      const start = `top ${startPct}%${sign}`;

      let targets: any;

      const assignTargets = (self: any) => {
        if (splitType.includes('chars') && self.chars.length) targets = self.chars;
        if (!targets && splitType.includes('words') && self.words.length) targets = self.words;
        if (!targets && splitType.includes('lines') && self.lines.length) targets = self.lines;
        if (!targets) targets = self.chars || self.words || self.lines;
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self: any) => {
          assignTargets(self);

          const animationConfig: any = {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
            onComplete: () => {
              animationCompletedRef.current = true;
              onLetterAnimationComplete?.();
            },
            willChange: 'transform, opacity',
            force3D: true
          };

          if (scrollTrigger) {
            animationConfig.scrollTrigger = {
              trigger: el,
              start,
              once: true,
              fastScrollEnd: true,
              anticipatePin: 0.4
            };
          }

          return gsap.fromTo(targets, { ...from }, animationConfig);
        }
      });

      (el as any)._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill();
        });
        try {
          if ((el as any)._rbsplitInstance) {
            (el as any)._rbsplitInstance.revert();
          }
        } catch (_) {
          /* ignore */
        }
        (el as any)._rbsplitInstance = null;
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        onLetterAnimationComplete,
        scrollTrigger
      ],
      scope: ref
    }
  );

  const renderTag = () => {
    const style: React.CSSProperties = {
      textAlign,
      wordWrap: 'break-word',
      willChange: 'transform, opacity'
    };

    const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`;

    const commonProps = {
      ref: ref as any,
      style,
      className: classes
    };

    switch (tag) {
      case 'h1':
        return <h1 {...commonProps}>{text}</h1>;
      case 'h2':
        return <h2 {...commonProps}>{text}</h2>;
      case 'h3':
        return <h3 {...commonProps}>{text}</h3>;
      case 'h4':
        return <h4 {...commonProps}>{text}</h4>;
      case 'h5':
        return <h5 {...commonProps}>{text}</h5>;
      case 'h6':
        return <h6 {...commonProps}>{text}</h6>;
      default:
        return <p {...commonProps}>{text}</p>;
    }
  };

  return renderTag();
};

export default SplitText;

