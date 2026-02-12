'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const InternationalShippingBanner = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!sectionRef.current || !bgRef.current) return;

        gsap.fromTo(
            bgRef.current,
            {
                width: '85%',
            },
            {
                width: '100%',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom', // When top of section hits bottom of viewport
                    end: 'center center', // When center of section hits center of viewport
                    scrub: true,
                },
                ease: 'none',
            }
        );
    }, []);

    return (
        <section ref={sectionRef} className="w-full relative z-10 -mt-20 md:-mt-32 lg:-mt-48 overflow-visible pointer-events-none">
            {/* EXPANDING BACKGROUND */}
            <div
                ref={bgRef}
                className="mx-auto bg-[#941B1F] relative overflow-hidden py-20 md:py-32 pointer-events-auto will-change-[width]"
            >
                {/* Background Map Effect */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full object-cover" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
                        <path d="M200,150 Q250,100 300,150 T400,150 T500,150 T600,150 T700,150" fill="none" stroke="white" strokeWidth="2" />
                        <circle cx="200" cy="150" r="50" fill="white" />
                        <circle cx="800" cy="150" r="60" fill="white" />
                        <circle cx="500" cy="300" r="80" fill="white" />
                    </svg>
                </div>

                {/* Texture overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="animate-fade-in-up">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif italic text-white mb-4 tracking-wide">
                            From You, <br className="md:hidden" />
                            to <span className="italic">Anywhere</span> in the World
                        </h2>

                        <p className="text-white/90 text-sm md:text-base tracking-widest uppercase mb-10 font-medium max-w-2xl mx-auto mt-6">
                            LOVE KNOWS NO BORDERS WITH GOPI MISTHAN BHANDAR, <br className="hidden md:block" />
                            NOW DELIVERING WORLDWIDE.
                        </p>

                        <Link href="/contact" className="inline-block bg-[#F9F3E7] text-[#941B1F] px-8 py-4 text-sm md:text-base font-bold tracking-widest hover:bg-white transition-colors duration-300 uppercase shadow-lg ">
                            SHIP INTERNATIONALLY
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InternationalShippingBanner;
