import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary-darkRed w-full min-h-[400px] md:min-h-[500px]">
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
          {/* Company Info */}
          <div className="text-white">
            <h3 className="text-primary-yellow text-xl font-bold font-serif mb-4">
              GOPI MISTHAN BHANDAR
            </h3>
            <p className="text-sm font-roboto leading-relaxed text-gray-200 mb-4">
              Serving Tradition & Sweetness Since 1968
            </p>
            <p className="text-xs font-roboto text-gray-300">
              Neemuch, Madhya Pradesh
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-white">
            <h4 className="text-primary-yellow text-lg font-bold font-serif mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm font-roboto">
              <li><a href="#" className="text-gray-200 hover:text-primary-yellow transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-200 hover:text-primary-yellow transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-200 hover:text-primary-yellow transition-colors">Products</a></li>
              <li><a href="#" className="text-gray-200 hover:text-primary-yellow transition-colors">Categories</a></li>
              <li><a href="#" className="text-gray-200 hover:text-primary-yellow transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-white">
            <h4 className="text-primary-yellow text-lg font-bold font-serif mb-4">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm font-roboto text-gray-200">
              <li>Phone: +91 XXXXXXXXXX</li>
              <li>Email: info@gopimisthanbhandar.com</li>
              <li>Address: Neemuch, MP</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300 font-roboto">
            <p>© 2024 Gopi Misthan Bhandar. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary-yellow transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary-yellow transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
