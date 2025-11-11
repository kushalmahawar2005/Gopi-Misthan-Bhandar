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
    <section className="py-12 md:py-16 px-4 bg-white w-full">
      <div className="w-full">
        <h2 className="text-center text-2xl md:text-3xl  text-black mb-12 md:mb-16 font-bold">
          Our Shop Gallery
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
          {displayedItems.map((item) => (
            <div
              key={item._id}
              className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative w-full h-[300px] md:h-[350px] lg:h-[400px]">
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
                        <h3 className="text-lg md:text-xl font-serif font-semibold mb-2">
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
              className="inline-block px-8 py-3 bg-primary-red text-white rounded-lg hover:bg-primary-darkRed transition-colors font-medium text-lg font-serif"
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

