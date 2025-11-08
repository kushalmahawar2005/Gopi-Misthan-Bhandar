import React from 'react';
import { InstagramPost } from '@/types';
import Image from 'next/image';

interface InstagramSectionProps {
  posts: InstagramPost[];
}

const InstagramSection: React.FC<InstagramSectionProps> = ({ posts }) => {
  // Text overlays for each card (matching 2nd image style)
  const overlayTexts: { [key: string]: string } = {
    'Hampers': 'Filled with flavours of Joy & Celebration',
    'Gifting': 'LUXURY GIFTING with a taste of tradition',
    'Milk Cake': 'And that seemed to ground an idea',
    'Dry Fruits': 'DIY Mithai Box',
  };

  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-serif text-black mb-12 md:mb-16 font-medium">
          INSTABOOK
        </h2>
        
        {/* Main 5 Cards Row */}
        <div className="flex justify-center gap-4 md:gap-6 lg:gap-8 flex-wrap mb-16">
          {posts.map((post) => (
            <div key={post.id} className="relative flex flex-col items-center group cursor-pointer">
              {/* Card Image/Video Container */}
              <div className="relative w-[160px] md:w-[180px] lg:w-[200px] h-[280px] md:h-[320px] lg:h-[360px] rounded-lg overflow-hidden">
                {post.isVideo && post.image && post.image.trim() !== '' ? (
                  /* Video Element with Autoplay */
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  >
                    <source src={post.image} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={post.image && post.image.trim() !== '' ? post.image : `https://picsum.photos/seed/instagram${post.id}/200/360`}
                    alt={post.label}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                    priority={post.id === '1'}
                  />
                )}
                
                {/* Text Overlay (if exists) */}
                {overlayTexts[post.label] && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end z-10">
                    <p className="text-white text-xs md:text-sm font-serif px-4 pb-4 font-medium leading-relaxed">
                      {overlayTexts[post.label]}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Label Below Card */}
              <p className="text-black text-sm md:text-base font-serif mt-4 text-center font-medium">
                {post.label}
              </p>
            </div>
          ))}
        </div>

        {/* Follow Us Section */}
        <h3 className="text-center text-xl md:text-2xl font-serif text-black mb-8 md:mb-12 font-medium">
          Follow Us on Instagram
        </h3>

        {/* Instagram Posts Grid */}
        <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="relative w-[160px] md:w-[180px] lg:w-[200px] h-[280px] md:h-[320px] lg:h-[360px] rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105">
              <Image
                src={`https://picsum.photos/seed/igpost${item}/200/360`}
                alt={`Instagram post ${item}`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
