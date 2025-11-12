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
  if (!giftBoxes || giftBoxes.length === 0) return null;

  return (
    <section className="py-12 md:py-20 px-4 bg-white w-full">
      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-center text-4xl text-black mb-2 md:mb-4 font-bold">
          GIFT BOX
        </h2>
        <p className="text-gray-800 text-sm text-center lg:text-[14px] md:text-base mb-12 leading-relaxed">
          Exquisitely packaged to benefit every occasion, we celebrate your pride, happiness and relationships with absolute grandeur.
        </p>

        {/* Mobile: slider / Desktop: grid */}
        <div
          className="
            md:grid md:grid-cols-3 md:gap-8
            flex gap-4 -mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory
          "
          role="region"
          aria-label="Gift box carousel"
        >
          {giftBoxes.map((item) => (
            <div
              key={item._id}
              className="
                flex flex-col gap-4
                snap-start shrink-0 w-[85%] sm:w-[70%]
                md:w-auto md:shrink md:snap-align-none
              "
            >
              {/* Image Card */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full h-[300px] sm:h-[340px] md:h-[400px]">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 70vw, 33vw"
                    priority={false}
                  />
                </div>
              </div>

              {/* Details Card */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg text-center font-serif font-[200] text-primary-brown">
                  {item.title}
                </h3>
                <p className="text-gray-800 text-sm text-center lg:text-[14px] md:text-base mb-2 leading-relaxed">
                  {item.description}
                </p>
                <Link
                  href={`/products?category=${item.category}`}
                  className="inline-block w-full text-center px-6 py-3 border-2 border-primary-red text-black rounded-lg hover:bg-primary-darkRed hover:text-white transition-colors font-medium font-poppins"
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
