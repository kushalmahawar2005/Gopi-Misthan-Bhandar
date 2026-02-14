'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Assuming lucide-react is available given package.json

// Common path for the overlay mask layer & background frame
// Exactly identical as requested
const BACKGROUND_PATH = "M276.688 174.524H281.922C281.922 174.524 256.105 165.622 257.279 140.686C257.446 137.139 258.064 132.716 258.762 127.722C262.969 97.6167 270.069 46.8118 198.604 42.7401C198.604 42.7401 204.47 25.5231 175.135 24.3396C145.795 23.1518 142.273 0 142.273 0C142.273 0 135.67 23.6542 111.759 22.5557C83.0971 21.2445 84.1828 40.9562 84.1828 40.9562C84.1828 40.9562 47.218 36.2092 27.8518 68.855C27.8518 68.855 20.8115 80.1329 23.1597 108.036C23.4602 111.607 23.8472 115.168 24.2296 118.686C26.7466 141.848 29.0656 163.187 5.23444 173.476H0C0 173.476 25.8173 182.378 24.6432 207.314C24.4762 210.861 23.858 215.284 23.1602 220.278C18.9529 250.383 11.8528 301.188 83.3181 305.26C83.3181 305.26 77.4519 322.477 106.787 323.66C136.127 324.848 139.649 348 139.649 348C139.649 348 146.252 324.346 170.163 325.444C198.825 326.756 197.739 307.044 197.739 307.044C197.739 307.044 234.704 311.791 254.07 279.145C254.07 279.145 261.11 267.867 258.762 239.964C258.462 236.393 258.075 232.832 257.692 229.314C255.175 206.152 252.856 184.813 276.688 174.524Z";
const OVERLAY_PATH = "M258.971 163.489H263.865C263.865 163.489 239.707 155.159 240.805 131.826C240.962 128.507 241.54 124.367 242.193 119.695C246.13 91.5236 252.774 43.9828 185.9 40.1727C185.9 40.1727 191.39 24.062 163.939 22.9545C136.484 21.843 133.188 0.178711C133.188 0.178711 127.01 22.3131 104.635 21.2852C77.8148 20.0582 78.8308 38.5035 78.8308 38.5035C78.8308 38.5035 44.2409 34.0615 26.1191 64.6098C26.1191 64.6098 19.5311 75.163 21.7284 101.273C22.0096 104.615 22.3717 107.947 22.7296 111.24C25.085 132.914 27.2551 152.884 4.95095 162.511H0.0566711C0.0566711 162.511 24.2152 170.841 23.1166 194.174C22.9603 197.493 22.3818 201.633 21.7288 206.305C17.7918 234.476 11.1479 282.017 78.0216 285.827C78.0216 285.827 72.5323 301.938 99.9829 303.046C127.437 304.157 130.733 325.821 130.733 325.821C130.733 325.821 136.912 303.687 159.286 304.715C186.107 305.942 185.091 287.496 185.091 287.496C185.091 287.496 219.681 291.939 237.803 261.39C237.803 261.39 244.391 250.837 242.193 224.727C241.912 221.385 241.55 218.053 241.192 214.76C238.837 193.086 236.667 173.116 258.971 163.489Z";

// Slide Data
const SLIDES_DATA = [
    {
        id: 1,
        imageSrc: "/card1.png",
        frameFill: "rgb(241, 121, 169)",
        maskFill: "rgb(133, 49, 145)",
        imageScale: 1.1,
        title: "The Royal\nMotichoor"
    },
    {
        id: 2,
        imageSrc: "/card2.png",
        frameFill: "rgb(247, 183, 39)",
        maskFill: "rgb(242, 138, 97)",
        imageScale: 1.5,
        title: "Silver Leaf\nKaju Katli"
    },
    {
        id: 3,
        imageSrc: "/card3.png",
        frameFill: "rgb(77, 192, 184)",
        maskFill: "rgb(32, 126, 118)",
        imageScale: 0.8,
        title: "Traditional\nMilk Cake"
    }
];

// Reusable FeatureCard component
const FeatureCard = ({
    imageSrc,
    frameFill,
    maskFill,
    maskPathD,
    uniqueId, // Added to ensure unique ClipPath IDs
    imageScale = 1,
    title
}: {
    imageSrc: string;
    frameFill: string;
    maskFill: string;
    maskPathD: string;
    uniqueId?: string;
    imageScale?: number;
    title?: string;
}) => {
    // Generate a unique ID for the clip path based on frame color + random string or index if provided
    const clipId = `clip-${(uniqueId || frameFill).replace(/[^\w]/g, '')}`;

    return (
        <div className="relative w-[300px] h-[320px] mx-auto" style={{
            borderWidth: "0px",
            borderStyle: "solid",
            borderColor: "rgb(229, 231, 235)",
            padding: "0px",
            margin: "0px",
            boxSizing: "border-box",
            position: "relative",
            height: "320px",
            width: "300px",
            minHeight: "320px",
            minWidth: "300px",
            listStyleType: "none",
            listStyle: "outside none none",
        }}>
            {/* SVG 1 (Background Frame) */}
            <svg className="absolute w-[105%] h-[105%] object-contain z-20 left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
                height="348" width="300" fill="currentColor" viewBox="0 0 282 348" xmlns="http://www.w3.org/2000/svg"
                style={{
                    display: "block",
                    verticalAlign: "middle",
                    fill: frameFill,
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    zIndex: 20,
                    height: "105%",
                    width: "105%",
                    transform: "translate(-50%,-50%)",
                    objectFit: "contain",
                }}
            >
                <defs>
                    <clipPath id={clipId}>
                        <path clipRule="evenodd" d={BACKGROUND_PATH} fillRule="evenodd" />
                    </clipPath>
                </defs>
                <path clipRule="evenodd" d={BACKGROUND_PATH} fill={frameFill} fillRule="evenodd" />
            </svg>

            {/* Image */}
            <div className={`absolute z-50 left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]`}
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    zIndex: 50,
                    height: `${60 * imageScale}%`,
                    width: `${60 * imageScale}%`,
                    transform: "translate(-50%,-50%)",
                }}>
                <img className="w-full h-full object-contain" src={imageSrc} alt="Featured content"
                    style={{
                        display: "block",
                        maxWidth: "100%",
                        height: "100%",
                        width: "100%",
                        objectFit: "contain",
                    }}
                />
            </div>

            <svg
                className="absolute w-[95%] h-[95%] object-contain z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                viewBox="0 0 282 348"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d={BACKGROUND_PATH}
                    fill={maskFill}
                />
            </svg>
            {
                title && (
                    <div className="absolute -bottom-16 left-0 w-full text-center z-[60]">
                        <h3 className="text-[#a02126] font-serif hover:text-[#d97706] transition-colors text-xl leading-tight whitespace-pre-line font-medium drop-shadow-sm">
                            {title}
                        </h3>
                    </div>
                )
            }
        </div >
    );
};

// Extended slides for looping: 3 originals * 3 = 9 slides
const EXTENDED_SLIDES = [...SLIDES_DATA, ...SLIDES_DATA, ...SLIDES_DATA];

const ExclusiveFeatures = () => {
    // Start from the middle set (Index 4 is the center of 0-8)
    const [activeIndex, setActiveIndex] = useState(4);
    const [transitionDuration, setTransitionDuration] = useState(600); // 0.6s
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Reset silent loop logic
    useEffect(() => {
        if (!isTransitioning) {
            // Upper bound reset: If we are at the start of the 3rd set (Index 6, 7, 8)
            // Visual: Index 6 (Slide 1) -> Reset to Index 3 (Slide 1)
            // Let's give a buffer. Reset if >= 7.
            if (activeIndex >= 7) {
                setTransitionDuration(0);
                setActiveIndex(activeIndex - 3);
            }
            // Lower bound reset: If we are at the end of the 1st set (Index 0, 1, 2)
            // Reset if <= 1.
            else if (activeIndex <= 1) {
                setTransitionDuration(0);
                setActiveIndex(activeIndex + 3);
            }
        }
    }, [activeIndex, isTransitioning]);

    const handleNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setTransitionDuration(600);
        setActiveIndex(prev => prev + 1);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 600);
    };

    const handlePrev = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setTransitionDuration(600);
        setActiveIndex(prev => prev - 1);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 600);
    };

    // Swipe Logic
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        touchEndX.current = null;
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        }
        if (isRightSwipe) {
            handlePrev();
        }
    };

    return (
        <section className="w-full pt-0 relative overflow-hidden">
            {/* Top decorative layer image */}
            <div className="w-full relative z-20">
                <img
                    src="/back3.png"
                    alt="Decorative header"
                    className="w-full h-auto object-cover block"
                />
            </div>

            {/* Main Content Area with Background */}
            <div className="w-full pb-16 md:pb-24 pt-8 md:pt-12 relative" style={{ backgroundColor: '#FFE3C2' }}>
                {/* Background Texture Overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')"
                    }}>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center pt-10 pb-20 md:pb-24">
                    {/* Background Mughal Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[400px] opacity-[0.07] pointer-events-none z-0">
                        <svg viewBox="0 0 282 348" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d={BACKGROUND_PATH} />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <h3 className="font-serif text-lg md:text-2xl text-[#1e3a8a] mb-2 tracking-wide">
                            The Heritage of Sweetness
                        </h3>
                        <h2 className="font-geom text-2xl md:text-4xl lg:text-5xl font-bold text-[#1e3a8a] mb-5 leading-tight">
                            India’s Finest Mithai Experience
                        </h2>

                        <div className="flex items-center justify-center gap-3 text-[#db2777] mb-8">
                            <span className="text-lg opacity-80">✦</span>
                            <span className="font-serif text-2xl md:text-3xl font-bold tracking-[0.2em]">1985</span>
                            <span className="text-lg opacity-80">✦</span>
                        </div>

                        <p className="text-gray-800 max-w-2xl mx-auto leading-relaxed text-sm md:text-base font-medium">
                            Become a part of our sweet legacy and experience handcrafted Indian mithai made with purity, tradition, and generations of expertise. From rich laddus to delicate kaju katli, every creation celebrates authentic flavor and timeless excellence.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10 h-[450px] flex justify-center items-center">
                    {/* Navigation Arrows */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full transition-transform hover:scale-110 focus:outline-none"
                        style={{ color: '#d97706' }}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={44} />
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full transition-transform hover:scale-110 focus:outline-none"
                        style={{ color: '#d97706' }}
                        aria-label="Next slide"
                    >
                        <ChevronRight size={44} />
                    </button>

                    {/* Slides Container */}
                    <div
                        className="relative w-full h-full flex justify-center items-center"
                        style={{ touchAction: 'pan-y' }}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {EXTENDED_SLIDES.map((slide, index) => {
                            // Calculate offset
                            const offset = index - activeIndex;
                            const isActive = offset === 0;
                            const isPrev = offset === -1;
                            const isNext = offset === 1;

                            // Determine styles based on visibility criteria
                            let styles: React.CSSProperties = {
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transition: `all ${transitionDuration}ms ease-out`,
                                transform: 'translate(-50%, -50%) scale(0)',
                                opacity: 0,
                                zIndex: 0,
                            };

                            if (isActive) {
                                // Center Slide
                                styles = {
                                    ...styles,
                                    transform: 'translate(-50%, -50%) scale(1.15)',
                                    opacity: 1,
                                    zIndex: 10,
                                    filter: 'blur(0px) drop-shadow(0 25px 40px rgba(0,0,0,0.18))',
                                };
                            } else if (isPrev) {
                                // Left Slide
                                styles = {
                                    ...styles,
                                    transform: 'translate(-50%, -50%) translateX(-320px) scale(0.60)',
                                    opacity: 0.35,
                                    zIndex: 5,
                                    filter: 'blur(6px) drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
                                };
                            } else if (isNext) {
                                // Right Slide
                                styles = {
                                    ...styles,
                                    transform: 'translate(-50%, -50%) translateX(320px) scale(0.60)',
                                    opacity: 0.35,
                                    zIndex: 5,
                                    filter: 'blur(6px) drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
                                };
                            }
                            // Non-visible slides stay at default (scale 0, opacity 0)

                            return (
                                <div key={`${slide.id}-${index}`} style={styles}>
                                    <FeatureCard
                                        imageSrc={slide.imageSrc}
                                        frameFill={slide.frameFill}
                                        maskFill={slide.maskFill}
                                        maskPathD=""
                                        uniqueId={`slide-${index}`}
                                        imageScale={slide.imageScale}
                                        title={slide.title}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Button */}
                <div className="relative z-10 mt-24 mb-8 text-center flex justify-center">
                    <button className="relative bg-[#db2777] hover:bg-[#be185d] text-white px-14 py-3 rounded-xl font-serif text-xl transition-transform hover:scale-105 shadow-lg flex items-center gap-3 overflow-hidden group">
                        {/* Left Flower Decoration */}
                        <svg className="absolute -bottom-2 -left-2 w-8 h-8 text-yellow-400 animate-[spin_4s_linear_infinite]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 5.5c-1.38 0-2.5 1.12-2.5 2.5 0 .28.05.55.14.8C7.9 8.25 6.45 9.15 6 11.35c-.09.43-.09.87.01 1.29-.98.54-1.51 1.63-1.51 2.86 0 1.23.53 2.32 1.51 2.86-.1.42-.1.86-.01 1.29.45 2.2 1.9 3.1 3.64 2.55-.09.25-.14.52-.14.8 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-.28-.05-.55-.14-.8 1.74.55 3.19-.35 3.64-2.55.09-.43.09-.87-.01-1.29.98-.54 1.51-1.63 1.51-2.86 0-1.23-.53-2.32-1.51-2.86.1-.42.1-.86.01-1.29-.45-2.2-1.9-3.1-3.64-2.55.09-.25.14-.52.14-.8 0-1.38-1.12-2.5-2.5-2.5z" />
                        </svg>

                        <span className="relative z-10 pl-4">View Full Catalogue</span>
                        <ChevronRight className="relative z-10 w-6 h-6 transition-transform group-hover:translate-x-1" />

                        {/* Right Flower Decoration */}
                        <svg className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-[spin_4s_linear_infinite]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 5.5c-1.38 0-2.5 1.12-2.5 2.5 0 .28.05.55.14.8C7.9 8.25 6.45 9.15 6 11.35c-.09.43-.09.87.01 1.29-.98.54-1.51 1.63-1.51 2.86 0 1.23.53 2.32 1.51 2.86-.1.42-.1.86-.01 1.29.45 2.2 1.9 3.1 3.64 2.55-.09.25-.14.52-.14.8 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-.28-.05-.55-.14-.8 1.74.55 3.19-.35 3.64-2.55.09-.43.09-.87-.01-1.29.98-.54 1.51-1.63 1.51-2.86 0-1.23-.53-2.32-1.51-2.86.1-.42.1-.86.01-1.29-.45-2.2-1.9-3.1-3.64-2.55.09-.25.14-.52.14-.8 0-1.38-1.12-2.5-2.5-2.5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ExclusiveFeatures;
