import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  publishedDate: string;
}

interface BlogSectionProps {
  blogs: BlogItem[];
}

const BlogSection: React.FC<BlogSectionProps> = ({ blogs }) => {
  if (!blogs || blogs.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section className="py-12 md:py-20 px-4 bg-white w-full">
      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-serif text-black mb-12 md:mb-16 font-medium">
          Latest Blogs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full h-[250px] md:h-[300px] overflow-hidden">
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              
              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-gray-500 mb-3">
                  {formatDate(blog.publishedDate)}
                </p>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-primary-brown mb-3 line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed line-clamp-3 flex-grow">
                  {blog.description}
                </p>
                <Link
                  href={`/blog/${blog.slug}`}
                  className="text-primary-red hover:text-primary-darkRed font-medium text-sm md:text-base transition-colors inline-flex items-center gap-2"
                >
                  Read more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;

