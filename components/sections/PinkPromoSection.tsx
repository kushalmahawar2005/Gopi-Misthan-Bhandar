'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const PinkPromoSection = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const containerRect = container.getBoundingClientRect();
            const containerCenter = containerRect.left + containerRect.width / 2;

            let closestDistance = Infinity;
            let closestId: number | null = null;

            Array.from(container.children).forEach((child: Element) => {
                const childRect = child.getBoundingClientRect();
                const childCenter = childRect.left + childRect.width / 2;
                const distance = Math.abs(containerCenter - childCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    const id = child.getAttribute('data-id');
                    if (id) closestId = Number(id);
                }
            });

            setActiveCardId((prev) => (prev !== closestId ? closestId : prev));
        };

        // Run initially after slight delay to allow for rendering
        setTimeout(handleScroll, 100);

        container.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    // Placeholder data for 4 images
    const slides = [
        { id: 1, src: '/s1.png' },
        { id: 2, src: '/s2.png' },
        { id: 3, src: '/s3.png' },
        { id: 4, src: '/s3.png' },
    ];

    return (
        <section className="w-full relative overflow-hidden py-16 md:py-24" style={{ backgroundColor: '#FABFD7' }}>
            {/* Decorative yellow brush image on the left, halfway outside */}
            <div className='absolute top-30 -translate-y-1/2 left-0 -translate-x-1/2 w-24 md:w-34 lg:w-44 z-0'>
                <img src="/t2.png" alt="Decorative background" className="w-full h-auto object-contain object-right" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center w-full flex flex-col items-center justify-center">
                <div className="relative inline-flex flex-col items-center justify-center mt-4 mb-20 px-4 w-full max-w-4xl">
                    <div className="absolute top-[40%] md:top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[260px] opacity-40 pointer-events-none z-0">
                        <img src="/Frame.png" alt="Decorative Frame" className="w-full h-auto object-contain" />
                    </div>

                    <div className="relative z-10">
                        <h3 className="font-serif text-base md:text-xl text-[#1e3a8a] mb-0 md:mb-1 font-bold tracking-tight">
                            The Heritage of Sweetness
                        </h3>
                        <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold text-[#1e3a8a] mb-5 leading-none tracking-tight">
                            India’s Finest Mithai
                        </h2>

                        <div className="flex items-center justify-center gap-3 text-[#e11d48] mb-6">
                            <span className="text-lg md:text-xl mt-1">✦</span>
                            <span className="font-serif text-2xl md:text-4xl font-bold tracking-[0.2em]">1985</span>
                            <span className="text-lg md:text-xl mt-1">✦</span>
                        </div>
                    </div>
                </div>

                {/* Slider Section */}
                <div className="relative w-full max-w-7xl mx-auto px-8 md:px-16 mb-20">
                    {/* Navigation Arrows */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 md:w-12 md:h-12 bg-[#db2777] text-white flex items-center justify-center rounded-lg hover:bg-[#be185d] transition-all shadow-md active:scale-95 group focus:outline-none"
                        aria-label="Previous frame"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 md:w-12 md:h-12 bg-[#db2777] text-white flex items-center justify-center rounded-lg hover:bg-[#be185d] transition-all shadow-md active:scale-95 group focus:outline-none"
                        aria-label="Next frame"
                    >
                        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Scrollable Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-16 pt-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {slides.map((slide) => {
                            const isActive = activeCardId === slide.id;
                            return (
                                <div
                                    key={slide.id}
                                    data-id={slide.id}
                                    className={`flex-shrink-0 w-[260px] md:w-[340px] snap-center flex flex-col items-center justify-center transition-all duration-500 ease-out ${isActive ? 'translate-y-8 md:translate-y-16 scale-[1.02]' : 'translate-y-0 scale-100'
                                        }`}
                                >
                                    {/* Actual Frame Image */}
                                    <img
                                        src={slide.src}
                                        alt={`Frame ${slide.id}`}
                                        className="w-full h-auto object-contain drop-shadow-xl transition-transform hover:scale-105 duration-300"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom CTA Button */}
                <button className="bg-[#db2777] hover:bg-[#be185d] text-white px-8 md:px-12 py-3 md:py-4 rounded-xl font-serif text-lg md:text-xl transition-all hover:scale-105 shadow-xl flex items-center gap-3 relative overflow-hidden group">
                    <span className="relative z-10">View All Programme</span>
                    <ArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" />

                    {/* Flower Decorations */}
                    <span className="absolute -bottom-3 -left-2 text-yellow-400 text-3xl opacity-80 animate-[spin_6s_linear_infinite] pointer-events-none">✱</span>
                    <span className="absolute -top-3 -right-2 text-yellow-400 text-3xl opacity-80 animate-[spin_6s_linear_infinite] pointer-events-none reverse">✱</span>
                </button>

                <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </div>
        </section>
    );
};

export default PinkPromoSection;
