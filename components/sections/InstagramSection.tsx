import React from 'react';
import { InstagramPost } from '@/types';
import { FiArrowRightCircle } from 'react-icons/fi';

interface InstagramSectionProps {
  posts: InstagramPost[];
}

const InstagramSection: React.FC<InstagramSectionProps> = ({ posts }) => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-base font-serif text-black mb-8">
          INSTABOOK
        </h2>
        
        <div className="flex justify-center gap-6 flex-wrap mb-6">
          {posts.map((post) => (
            <div key={post.id} className="relative flex flex-col items-center">
              <div className="bg-primary-brown h-[137px] w-[122px] rounded-2xl flex items-center justify-center">
                {post.isVideo && (
                  <p className="text-white text-sm font-serif text-center">
                    Video<br />Section
                  </p>
                )}
              </div>
              <p className="text-black text-xs font-serif mt-2">
                {post.label}
              </p>
            </div>
          ))}
        </div>

        <h3 className="text-center text-base font-serif text-black mb-6">
          Follow Us on Instagram
        </h3>

        <div className="flex justify-center gap-6 flex-wrap">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-primary-brown h-[137px] w-[122px] rounded"></div>
          ))}
          <div className="bg-primary-brown h-[137px] w-[122px] rounded flex items-center justify-center">
            <FiArrowRightCircle className="text-white w-6 h-6" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
