'use client';

import React, { useState, useRef } from 'react';
import { InstagramPost } from '@/types';
import Link from 'next/link';
import { FiVolume2, FiVolumeX, FiMaximize2 } from 'react-icons/fi';

interface InstaBookSectionProps {
  instaBooks: InstagramPost[];
}

const InstaBookSection: React.FC<InstaBookSectionProps> = ({ instaBooks }) => {
  return (
    <section className="py-12 md:py-16 px-4 bg-white w-full">
      <div className="w-full">
        <h2 className="text-center text-2xl md:text-3xl  text-black mb-10 md:mb-14 font-bold">
          INSTABOOK
        </h2>

        <div className="flex justify-center gap-4 sm:gap-5 md:gap-6 lg:gap-8 flex-wrap">
          {instaBooks.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface VideoCardProps {
  item: InstagramPost;
}

const VideoCard: React.FC<VideoCardProps> = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
      else if ((videoRef.current as any).webkitRequestFullscreen) (videoRef.current as any).webkitRequestFullscreen();
      else if ((videoRef.current as any).mozRequestFullScreen) (videoRef.current as any).mozRequestFullScreen();
      else if ((videoRef.current as any).msRequestFullscreen) (videoRef.current as any).msRequestFullscreen();
    }
  };

  return (
    <div className="relative flex flex-col items-center group">
      {/* Video Container */}
      <div
        className="
          relative rounded-lg overflow-hidden cursor-pointer shadow-lg
          /* MOBILE — bigger reels */
          w-[88vw] max-w-[380px] sm:w-[85vw] sm:max-w-[400px] aspect-[9/16]
          /* DESKTOP/TABLET — revert to old sizes */
          md:aspect-auto md:w-[190px] md:h-[490px]
          lg:w-[180px] lg:h-[460px]
          xl:w-[220px] xl:h-[420px]
          2xl:w-[240px] 2xl:h-[420px]
          transition-transform duration-300 hover:scale-[1.02]
        "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
      >
        {item.isInstagramReel ? (
          <Link
            href={item.image}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center group"
          >
            <div className="text-center text-white p-4">
              <svg className="w-14 h-14 mx-auto mb-2 opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.947.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.073-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <p className="text-sm font-medium">View on Instagram</p>
            </div>
          </Link>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={item.image} type="video/mp4" />
            </video>

            {/* Hover Controls (desktop) */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 md:p-4 transition-opacity duration-300 z-20 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex items-center justify-end gap-3 md:gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <FiVolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  ) : (
                    <FiVolume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
                  aria-label="Fullscreen"
                >
                  <FiMaximize2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Label */}
      <p className="text-black text-[23px] mb-8 mt-2  md:text-base font-serif mt-4 text-center font-medium">
        {item.label}
      </p>
    </div>
  );
};

export default InstaBookSection;
