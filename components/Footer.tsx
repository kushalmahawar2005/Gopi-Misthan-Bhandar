'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    { icon: FiFacebook, href: '#', label: 'Facebook' },
    { icon: FiInstagram, href: '#', label: 'Instagram' },
    { icon: FiTwitter, href: '#', label: 'Twitter' },
    { icon: FiYoutube, href: '#', label: 'YouTube' },
  ];

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '#about' },
    { label: 'Products', href: '/products' },
    { label: 'Categories', href: '#categories' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="bg-primary-darkRed w-full">
      {/* Content */}
      <div className="w-full px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8">
          {/* Company Info */}
          <div className="text-white">
            <h3 className="text-primary-yellow text-xl font-bold font-jost tracking-wide mb-4">
              GOPI MISTHAN BHANDAR
            </h3>
            <p className="text-sm  leading-relaxed text-white mb-4">
              Serving Tradition & Sweetness Since 1968
            </p>
            <p className="text-sm  text-white mb-4 flex items-center gap-2">
              <FiMapPin className="w-4 h-4" />
              Neemuch, Madhya Pradesh
            </p>

            {/* Social Media Links */}
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-primary-yellow rounded-full flex items-center justify-center text-white hover:text-primary-darkRed transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-white">
            <h4 className="text-primary-yellow text-lg font-bold font-general-sansal-sans mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm ">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white hover:text-primary-yellow transition-colors flex items-center gap-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-white">
            <h4 className="text-primary-yellow text-lg font-bold font-general-sansal-sans mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-white">
              <li className="flex items-center gap-2">
                <FiPhone className="w-4 h-4 text-primary-yellow" />
                <a href="tel:+917746883645" className="hover:text-primary-yellow transition-colors">
                  +91 7746883645
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-primary-yellow" />
                <a href="mailto:gopimisthan@hotmail.com" className="hover:text-primary-yellow transition-colors">
                  gopimisthan@hotmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <FiMapPin className="w-4 h-4 text-primary-yellow mt-1" />
                <span>Shop No. 123, Main Street,<br />Neemuch, MP 458441</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-white">
            <h4 className="text-primary-yellow text-lg font-bold  mb-4">
              Newsletter
            </h4>
            <p className="text-sm font-jost tracking-wide text-white mb-4">
              Subscribe to get updates on new products and special offers
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-primary-yellow transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full bg-primary-yellow text-primary-darkRed px-4 py-2 rounded-lg font-bold font-poppins hover:bg-yellow-400 transition-colors"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white">
            <p>© {new Date().getFullYear()} Gopi Misthan Bhandar. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-primary-yellow transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary-yellow transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/refund-cancellation" className="hover:text-primary-yellow transition-colors">
                Refund & Cancellation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;