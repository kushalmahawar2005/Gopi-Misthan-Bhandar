import React from 'react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <div className="w-full h-[400px] md:h-[450px] relative overflow-hidden">
      <Image
        src="https://picsum.photos/seed/hero/1200/600"
        alt="Gopi Misthan Bhandar - Traditional Indian Sweets"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
    </div>
  );
};

export default HeroSection;
