'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        <section ref={sectionRef} className="w-full relative z-10 -mt-32 md:-mt-48 lg:-mt-80 xl:-mt-96 overflow-visible pointer-events-none">
            {/* EXPANDING BACKGROUND */}
            <div
                ref={bgRef}
                className="mx-auto bg-[#FFF8F0] relative overflow-hidden py-16 md:py-24 pointer-events-auto will-change-[width]"
            >
                {/* Texture overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">

                        {/* LEFT: Text Content */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-[#941B1F] mb-6 leading-tight tracking-wide">
                                Let Authentic <br />
                                Indian <span className="italic text-[#D4AF37]">Mithai</span> Melt into <br />
                                Your Moments
                            </h2>

                            <p className="text-[#5A2E2E] text-sm md:text-base leading-relaxed mb-8 tracking-wide font-medium max-w-xl mx-auto md:mx-0">
                                Discover the taste of perfection at <span className="font-bold">Gopi Misthan Bhandar</span>, a luxurious mithai gift boutique where each sweet is handcrafted to deliver an unforgettable experience.
                            </p>

                            <Link href="/shop" className="inline-block bg-[#941B1F] text-[#FFF8F0] px-10 py-4 text-sm md:text-base font-bold tracking-widest hover:bg-[#7a1519] transition-all duration-300 uppercase shadow-lg transform hover:-translate-y-1 mx-auto md:mx-0">
                                Shop Now
                            </Link>
                        </div>

                        {/* RIGHT: Image */}
                        <div className="w-full md:w-1/2 relative h-auto aspect-square md:aspect-auto md:h-[500px]">
                            <div className="relative w-full h-full border-[3px] border-[#D4AF37]/50 rounded-xl p-3 shadow-sm">
                                <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl">
                                    <Image
                                        src="/Hamper.png"
                                        alt="Gopi Misthan Bhandar Gift Hamper"
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default InternationalShippingBanner;
