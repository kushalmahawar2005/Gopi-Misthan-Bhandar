import React from 'react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <div className="w-full h-80 relative">
      <Image
        src="/1.jpg"
        alt="Hero Image"
        layout="fill"
        objectFit="cover"
      />
    </div>
  );
};

export default HeroSection;
