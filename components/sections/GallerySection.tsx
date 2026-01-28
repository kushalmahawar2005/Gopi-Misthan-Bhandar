import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface GalleryItem {
  _id: string;
  imageUrl: string;
  title?: string;
  description?: string;
}

interface GallerySectionProps {
  galleryItems: GalleryItem[];
  showAll?: boolean;
}

const GallerySection: React.FC<GallerySectionProps> = ({ galleryItems, showAll = false }) => {
  if (!galleryItems || galleryItems.length === 0) {
    return null;
  }

  // Show only first 4 items on homepage, all items on gallery page
  const displayedItems = showAll ? galleryItems : galleryItems.slice(0, 4);

  return (
    <section className="py-8 md:py-12 bg-white w-full">
      <div className="section-container w-full max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-general-sans text-black font-[500] tracking-wide mb-12 md:mb-16">
          Our Shop Gallery
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayedItems.map((item) => (
            <div
              key={item._id}
              className="relative group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3]">
                <Image
                  src={item.imageUrl}
                  alt={item.title || 'Gallery image'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {(item.title || item.description) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                      {item.title && (
                        <h3 className="text-lg md:text-xl font-general-sans font-semibold mb-2">
                          {item.title}
                        </h3>
                      )}
                      {item.description && (
                        <p className="text-sm md:text-base text-white/90 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* More Images Button - Only show on homepage when there are more than 4 items */}
        {!showAll && galleryItems.length > 4 && (
          <div className="text-center mt-12">
            <Link
              href="/gallery"
              className="inline-block px-8 py-3 bg-primary-red text-white rounded-full hover:bg-primary-darkRed transition-colors font-medium text-sm md:text-base font-general-sans shadow-md hover:shadow-lg"
            >
              More Images
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
