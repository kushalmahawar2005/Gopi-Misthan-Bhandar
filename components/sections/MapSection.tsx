import React from 'react';

const MapSection = () => {
  return (
    <section className="w-full py-8 md:py-12 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-general-sans text-black font-[500] tracking-wide mb-4">
            Visit Our Store
          </h2>
          <div className="w-24 h-1 bg-primary-red mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the sweetness in person. Visit our outlet in Neemuch.
          </p>
        </div>

        <div className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-xl border border-gray-100">
          <iframe
            width="100%"
            height="100%"
            id="gmap_canvas"
            src="https://maps.google.com/maps?q=Gopi%20Misthan%20Bhandar%20Neemuch%20Madhya%20Pradesh&t=&z=15&ie=UTF8&iwloc=&output=embed"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            title="Gopi Misthan Bhandar Location"
            className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
