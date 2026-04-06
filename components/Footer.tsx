'use client';

import React from 'react';
import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  const socialLinks = [
    { icon: FiFacebook, href: '#', label: 'Facebook' },
    { icon: FiInstagram, href: '#', label: 'Instagram' },
    { icon: FiTwitter, href: '#', label: 'Twitter' },
    { icon: FiYoutube, href: '#', label: 'YouTube' },
  ];

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/#about' },
    { label: 'Products', href: '/products' },
    { label: 'Categories', href: '/#categories' },
    { label: 'Contact', href: '/#contact' },
  ];

  return (
    <footer id="contact" className="bg-[#F88E0C] w-full text-white">
      {/* Content */}
      <div className="w-full px-4 md:px-12 py-16 md:py-24 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-12">

          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-white text-2xl font-playfair font-bold tracking-[0.05em]">
              Gopi Misthan Bhandar
            </h3>
            <p className="text-[14px] text-white leading-relaxed font-dm-sans max-w-[280px]">
              Distilling generations of tradition into premium sweets since 1968. A legacy of taste and purity.
            </p>
            <p className="text-[14px] flex items-center gap-2 font-dm-sans text-white">
              <FiMapPin className="w-4 h-4 text-white" />
              Neemuch, Madhya Pradesh
            </p>

            {/* Social Media Links */}
            <div className="flex gap-4 mt-8">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 border border-white hover:border-white rounded-full flex items-center justify-center text-white hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white text-lg font-playfair font-bold tracking-[0.1em] uppercase">
              Quick Links
            </h4>
            <ul className="space-y-4 text-[14px] font-dm-sans">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white hover:text-white transition-opacity flex items-center gap-2 group"
                  >
                    <span className="w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-white text-lg font-playfair font-bold tracking-[0.1em] uppercase">
              Connect With Us
            </h4>
            <ul className="space-y-5 text-[14px] font-dm-sans">
              <li className="flex items-center gap-3">
                <FiPhone className="w-4 h-4 text-white" />
                <a href="tel:+919425922445" className="text-white hover:text-white transition-opacity">
                  +91 9425922445
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="w-4 h-4 text-white" />
                <a href="mailto:gopimisthan1968@gmail.com" className="text-white hover:text-white transition-opacity">
                  gopimisthan1968@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin className="w-4 h-4 text-white mt-1" />
                <span className="text-white leading-relaxed">Shop No. 123, Main Street,<br />Neemuch, MP 458441</span>
              </li>
            </ul>
          </div>

          {/* Find Us - Map Integration */}
          <div className="space-y-6">
            <h4 className="text-white text-lg font-playfair font-bold tracking-[0.1em] uppercase">
              Locate Us
            </h4>
            <div className="relative w-full h-[200px] rounded-2xl overflow-hidden shadow-2xl border border-white/5 group ring-1 ring-white/10">
              <iframe
                width="100%"
                height="100%"
                src="https://maps.google.com/maps?q=Gopi%20Misthan%20Bhandar%20Neemuch%20Madhya%20Pradesh&t=&z=14&ie=UTF8&iwloc=&output=embed"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                title="Gopi Misthan Bhandar Location"
                className="w-full h-full grayscale hover:grayscale-0 transition-all duration-1000 opacity-60 group-hover:opacity-100"
              />
              <a
                href="https://maps.google.com/?q=Gopi%20Misthan%20Bhandar%20Neemuch%20Madhya%20Pradesh"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-transparent cursor-pointer z-10"
              />
            </div>
            <p className="text-[12px] text-white italic mt-4 font-dm-sans">
              Experience the sweetness at our flagship store.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-10 mt-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-white font-dm-sans">
            <p>© {new Date().getFullYear()} Gopi Misthan Bhandar. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-gray-200 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-200 transition-colors">Terms & Conditions</Link>
              <Link href="/refund-cancellation" className="hover:text-gray-200 transition-colors">Refund & Cancellation</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;