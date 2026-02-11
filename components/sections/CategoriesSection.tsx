'use client';

import React, { useRef } from 'react';
import CategoryCard from '../CategoryCard';
import { Category } from '@/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface CategoriesSectionProps {
  categories: Category[];
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !bgRef.current) return;

    gsap.fromTo(
      bgRef.current,
      {
        width: '100%',
      },
      {
        width: '85%', // 👈 SIDE SE SHRINK
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=350',
          scrub: true,
        },
        ease: 'none',
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-20 overflow-hidden">
      {/* SHRINKING BACKGROUND */}
      <div
        ref={bgRef}
        className="mx-auto bg-[#FFF0F5]  px-4 md:px-10 will-change-[width]"
      >
        {/* HEADING */}
        <div className="text-center mb-12 pt-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-brown">
            Our Categories
          </h2>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mt-3">
            Explore our wide range of traditional Indian sweets, snacks, and namkeen
          </p>
        </div>

        {/* RESPONSIVE LAYOUT: Slider on Mobile, Grid on Desktop */}
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-4 md:gap-8 max-w-4xl mx-auto pb-4 md:pb-16 scrollbar-hide md:justify-items-center px-4 md:px-0">
          {categories.slice(0, 6).map((category) => (
            <div
              key={category.id}
              className="flex-shrink-0 w-[40vw] sm:w-[30vw] md:w-full md:max-w-[170px]"
            >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
