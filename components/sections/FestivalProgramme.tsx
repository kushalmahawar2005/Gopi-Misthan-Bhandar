'use client';

import React from 'react';

const FestivalProgramme = () => {
    return (
        <section className="relative w-full overflow-hidden" style={{ backgroundColor: '#f9b6d0' }}>

            {/* Center abstract watermark */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] opacity-20 pointer-events-none">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#e04a82" strokeWidth="1.5">
                    <path d="M 100 10 C 130 50 140 70 190 100 C 140 130 130 150 100 190 C 70 150 60 130 10 100 C 60 70 70 50 100 10 Z" />
                    <circle cx="100" cy="100" r="15" strokeDasharray="3 3" />
                    {/* Inner diamonds */}
                    <path d="M 100 40 L 115 100 L 100 160 L 85 100 Z" />
                    <path d="M 40 100 L 100 115 L 160 100 L 100 85 Z" />
                </svg>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pt-16 pb-48 md:pb-64 flex flex-col items-center justify-center relative z-10 text-center">
                <h3 className="font-serif text-2xl md:text-3xl lg:text-[42px] font-medium tracking-tight mb-2" style={{ color: '#2d338b' }}>
                    Vedanta presents JaipurLiterature Festival
                </h3>

                <div className="flex items-center justify-center gap-4 my-2">
                    <span className="text-[#ec2e7a] text-xl">✦</span>
                    <h2 className="font-serif text-[56px] md:text-[80px] lg:text-[100px] font-bold tracking-tight leading-none" style={{ color: '#2d338b' }}>
                        Programme
                    </h2>
                    <span className="text-[#ec2e7a] text-xl">✦</span>
                </div>

                <div className="flex items-center justify-center gap-4 mt-2 mb-10 md:mb-16">
                    <span className="font-serif text-[40px] md:text-[60px] font-bold" style={{ color: '#ec2e7a' }}>२</span>
                    <span className="font-serif text-[40px] md:text-[60px] font-bold" style={{ color: '#ec2e7a' }}>०</span>
                    <span className="font-serif text-[40px] md:text-[60px] font-bold" style={{ color: '#ec2e7a' }}>२</span>
                    <span className="font-serif text-[40px] md:text-[60px] font-bold" style={{ color: '#ec2e7a' }}>६</span>
                </div>
            </div>

            {/* Left yellow abstract graphic */}
            <div className="absolute top-[20%] lg:top-[30%] -left-8 md:left-0 w-32 md:w-48 h-auto pointer-events-none opacity-90">
                <svg viewBox="0 0 100 200" fill="#facc15" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-20 20 Q40 10 60 50 T30 120 T70 170 T-20 200 Z" />
                    <path d="M-10 40 Q50 30 70 70 T40 140" stroke="#ca8a04" strokeWidth="2" fill="none" />
                </svg>
            </div>

            {/* Right pink flower */}
            <div className="absolute top-[40%] md:top-[50%] right-8 md:right-32 w-16 md:w-20 h-16 md:h-20 pointer-events-none text-[#ea2e7b]">
                <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 0 C 55 20 60 40 70 45 C 90 40 100 30 100 50 C 100 70 90 60 70 55 C 60 60 55 80 50 100 C 45 80 40 60 30 55 C 10 60 0 70 0 50 C 0 30 10 40 30 45 C 40 40 45 20 50 0 Z" />
                    <circle cx="50" cy="50" r="8" fill="#f9b6d0" />
                </svg>
            </div>

            {/* Bottom Arches */}
            <div className="absolute bottom-0 w-full flex justify-center items-end h-[150px] md:h-[250px] lg:h-[300px]">
                <div className="flex justify-between w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] h-full items-end">
                    {/* Left Arch */}
                    <div className="w-[32%] h-[70%] relative translate-y-[2px]">
                        <svg viewBox="0 0 200 150" className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 0 150 L 0 120 C 10 100 30 80 60 80 C 80 80 90 60 90 40 C 90 20 95 10 100 0 C 105 10 110 20 110 40 C 110 60 120 80 140 80 C 170 80 190 100 200 120 L 200 150 Z" fill="#ed795c" />
                            <path d="M 5 150 L 5 120 C 15 102 33 85 60 85 C 83 85 96 64 96 40 C 96 23 100 13 100 5 C 100 13 104 23 104 40 C 104 64 117 85 140 85 C 167 85 185 102 195 120 L 195 150" fill="none" stroke="#2d338b" strokeWidth="1.5" strokeDasharray="5 5" />
                        </svg>
                    </div>

                    {/* Center Arch */}
                    <div className="w-[38%] h-[85%] relative z-10 translate-y-[2px]">
                        <svg viewBox="0 0 200 150" className="w-full h-full text-[#1ba19e]" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 0 150 L 0 120 C 10 100 30 80 60 80 C 80 80 90 60 90 40 C 90 20 95 10 100 0 C 105 10 110 20 110 40 C 110 60 120 80 140 80 C 170 80 190 100 200 120 L 200 150 Z" fill="currentColor" />
                            <path d="M 5 150 L 5 120 C 15 102 33 85 60 85 C 83 85 96 64 96 40 C 96 23 100 13 100 5 C 100 13 104 23 104 40 C 104 64 117 85 140 85 C 167 85 185 102 195 120 L 195 150" fill="none" stroke="#2d338b" strokeWidth="1.5" strokeDasharray="5 5" />
                        </svg>
                    </div>

                    {/* Right Arch */}
                    <div className="w-[32%] h-[70%] relative translate-y-[2px]">
                        <svg viewBox="0 0 200 150" className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 0 150 L 0 120 C 10 100 30 80 60 80 C 80 80 90 60 90 40 C 90 20 95 10 100 0 C 105 10 110 20 110 40 C 110 60 120 80 140 80 C 170 80 190 100 200 120 L 200 150 Z" fill="#ed795c" />
                            <path d="M 5 150 L 5 120 C 15 102 33 85 60 85 C 83 85 96 64 96 40 C 96 23 100 13 100 5 C 100 13 104 23 104 40 C 104 64 117 85 140 85 C 167 85 185 102 195 120 L 195 150" fill="none" stroke="#2d338b" strokeWidth="1.5" strokeDasharray="5 5" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FestivalProgramme;
