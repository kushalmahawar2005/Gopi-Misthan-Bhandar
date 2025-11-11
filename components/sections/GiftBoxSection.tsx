import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface GiftBoxItem {
  _id: string;
  category: 'assorted' | 'dry-fruit' | 'souvenir';
  title: string;
  description: string;
  imageUrl: string;
}

interface GiftBoxSectionProps {
  giftBoxes: GiftBoxItem[];
}

const GiftBoxSection: React.FC<GiftBoxSectionProps> = ({ giftBoxes }) => {
  if (!giftBoxes || giftBoxes.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 px-4 bg-white w-full">
      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-center text-4xl  text-black mb-2 md:mb-4 font-bold">
          GIFT BOX
        </h2>
        <p className="text-gray-800 text-sm  text-center lg:text-[14px] md:text-base mb-12 leading-relaxed flex-grow">Exquisitely packaged to benefit every occasion, we celebrate your pride, happiness and relationships with absolute grandeur.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {giftBoxes.map((item) => (
            <div key={item._id} className="flex flex-col gap-4">
              {/* Image Card - Separate */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full h-[350px] md:h-[400px]">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </div>
              
              {/* Details Card - Separate */}
              <div className='flex flex-col gap-2'>
                <h3 className="text-lg text-center  font-serif  font-[200] text-primary-brown ">
                  {item.title}
                </h3>
                <p className="text-gray-800 text-sm  text-center lg:text-[14px] md:text-base mb-2 leading-relaxed flex-grow">
                  {item.description}
                </p>
                <Link
                  href={`/products?category=${item.category}`}
                  className="inline-block w-full text-center px-6 py-3 border-2 border-primary-red text-black rounded-lg hover:bg-primary-darkRed  hover:text-white transition-colors font-medium font-poppins"
                >
                  View Collection
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GiftBoxSection;

