import React from 'react';

const AboutSection = () => {
  return (
    <section className="bg-primary-darkRed py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Shop Image */}
          <div className="bg-primary-brown h-60 w-full flex items-center justify-center rounded">
            <p className="text-white text-sm font-serif">SHOP IMG</p>
          </div>

          {/* Right Side - Content */}
          <div className="text-white">
            <h2 className="text-primary-yellow text-xs font-extrabold mb-2">
              GOPI MISTHAN BHANDAR
            </h2>
            <p className="text-sm font-serif mb-4">
              Serving Tradition & Sweetness Since 1968
            </p>
            <p className="text-xs font-serif mb-2">Our Believe...</p>
            <p className="text-[8px] font-roboto leading-relaxed">
              Hailing from the land of sun and blue, over the years we've specialized in making traditional Indian sweets while maintaining their authentic tastes
            </p>

            {/* Additional Images */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-primary-brown h-24 w-full rounded"></div>
              <div className="bg-primary-brown h-24 w-full rounded"></div>
            </div>
            <div className="bg-primary-brown h-28 w-full rounded mt-4"></div>

            <p className="text-xs font-serif mt-6 mb-2">Gifts and more....</p>
            <p className="text-[8px] font-roboto leading-relaxed">
              Hailing from the land of sun and blue, over the years we've specialized in making traditional Indian sweets while maintaining their authentic tastes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
