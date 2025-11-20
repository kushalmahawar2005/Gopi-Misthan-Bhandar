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

  // Pehla item hero / big card, baaki right side products
  const [featured, ...rest] = giftBoxes;

  return (
    <section className="py-12 md:py-20 px-4 bg-white w-full">
      <div className="w-full max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-center text-4xl text-black mb-2 font-general-sans md:mb-4 font-[500]">
          GIFT BOX
        </h2>
        <p className="text-gray-800 text-sm text-center lg:text-[15px] md:text-md font-jost mb-12 leading-relaxed">
          Exquisitely packaged to benefit every occasion, we celebrate your pride, happiness and relationships with absolute grandeur.
        </p>

        {/* Layout:
            Mobile: 1 column (hero upar, baaki niche)
            Desktop: 2 columns - left big, right 2-per-row cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* LEFT: BIG HERO CARD */}
          <div className="lg:col-span-1">
            <Link
              href={`/products?category=${featured.category}`}
              className="group block w-full h-full"
            >
              <div className="relative w-full h-[320px] sm:h-[380px]  md:h-[830px] overflow-hidden">
                <Image
                  src={featured.imageUrl}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 33vw"
                  priority={false}
                />

                {/* Overlay content */}
                <div className="absolute inset-x-6 bottom-8 text-white">
                  <p className="text-xs uppercase tracking-[0.35em] mb-2">
                    New Arrivals
                  </p>
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3">
                    {featured.title}
                  </h3>

                  <button className="inline-flex items-center px-5 py-2.5 text-sm md:text-[15px] bg-white text-black rounded-full shadow-md group-hover:translate-y-[1px] transition">
                    View Collection
                  </button>
                </div>
              </div>
            </Link>
          </div>

          {/* RIGHT: SMALL PRODUCT CARDS (2 per row on desktop) */}
          <div className="lg:col-span-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {rest.map((item) => (
                <div
                  key={item._id}
                  className="group bg-white overflow-hidden  flex flex-col"
                >
                  {/* Image + hover button inside card */}
                  <div className="relative w-full h-[280px] sm:h-[190px] md:h-[300px] lg:h-[320px] overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={false}
                    />

                    {/* Dark gradient on hover */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* View Collection button inside card */}
                    <div className="absolute inset-x-4 bottom-4 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Link
                        href={`/products?category=${item.category}`}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-white text-black text-xs md:text-sm font-medium font-poppins shadow-md hover:bg-gray-100"
                      >
                        View Collection
                      </Link>
                    </div>
                  </div>

                  {/* Details (image ke niche) */}
                  <div className="px-3 md:px-4 pt-3 pb-4 flex flex-col gap-2">
                    <h3 className="text-sm md:text-base text-center md:text-left font-general-sans font-[500] text-primary-brown">
                      {item.title}
                    </h3>
                    <p className="text-gray-800 text-xs md:text-sm text-center font-jost md:text-left leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftBoxSection;
