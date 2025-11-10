import React from 'react';
import Image from 'next/image';

interface DecorativeBannerProps {
  image?: string;
  alt?: string;
  bgColor?: 'brown' | 'red';
  height?: string;
}

const DecorativeBanner: React.FC<DecorativeBannerProps> = ({ 
  image, 
  alt = 'Decorative banner',
  bgColor = 'brown',
  height = 'h-12 sm:h-16 md:h-20 lg:h-24'
}) => {
  const bgClass = bgColor === 'red' ? 'bg-primary-red' : 'bg-primary-brown';

  return (
    <div className={`w-full ${height} ${!image ? bgClass : ''} my-4 sm:my-6 md:my-8 lg:my-12 relative overflow-hidden`}>
      {image && image.trim() !== '' ? (
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      ) : (
        <div className={`w-full h-full ${bgClass}`} />
      )}
    </div>
  );
};

export default DecorativeBanner;
