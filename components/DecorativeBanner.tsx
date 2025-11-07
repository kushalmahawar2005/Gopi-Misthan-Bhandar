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
  height = 'h-10'
}) => {
  const bgClass = bgColor === 'red' ? 'bg-primary-red' : 'bg-primary-brown';

  return (
    <div className={`w-full ${height} ${bgClass} my-8 relative overflow-hidden`}>
      {image && image.trim() !== '' ? (
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover object-center"
          priority
        />
      ) : null}
    </div>
  );
};

export default DecorativeBanner;
