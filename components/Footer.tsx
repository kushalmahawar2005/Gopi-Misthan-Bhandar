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
    <footer id="contact" className="bg-[#5A2525] w-full text-[#F3EEE9]">
      {/* Content */}
      <div className="w-full px-4 md:px-12 py-16 md:py-24 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-12">

          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-[#F3EEE9] text-2xl font-playfair font-bold tracking-[0.05em]">
              Gopi Misthan Bhandar
            </h3>
            <p className="text-[14px] leading-relaxed opacity-70 font-dm-sans max-w-[280px]">
              Distilling generations of tradition into premium sweets since 1968. A legacy of taste and purity.
            </p>
            <p className="text-[14px] flex items-center gap-2 opacity-80 font-dm-sans">
              <FiMapPin className="w-4 h-4 text-[#D4A373]" />
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
                  className="w-11 h-11 border border-[#F3EEE9]/10 hover:border-[#F3EEE9]/40 rounded-full flex items-center justify-center text-[#F3EEE9]/60 hover:text-[#F3EEE9] transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-[#F3EEE9] text-lg font-playfair font-bold tracking-[0.1em] uppercase">
              Quick Links
            </h4>
            <ul className="space-y-4 text-[14px] font-dm-sans">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="opacity-70 hover:opacity-100 transition-opacity flex items-center gap-2 group"
                  >
                    <span className="w-0 h-[1px] bg-[#D4A373] transition-all duration-300 group-hover:w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-[#F3EEE9] text-lg font-playfair font-bold tracking-[0.1em] uppercase">
              Connect With Us
            </h4>
            <ul className="space-y-5 text-[14px] font-dm-sans">
              <li className="flex items-center gap-3">
                <FiPhone className="w-4 h-4 text-[#D4A373]" />
                <a href="tel:+917746883645" className="opacity-70 hover:opacity-100 transition-opacity">
                  +91 7746883645
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="w-4 h-4 text-[#D4A373]" />
                <a href="mailto:gopimisthan@hotmail.com" className="opacity-70 hover:opacity-100 transition-opacity">
                  gopimisthan@hotmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin className="w-4 h-4 text-[#D4A373] mt-1" />
                <span className="opacity-70 leading-relaxed">Shop No. 123, Main Street,<br />Neemuch, MP 458441</span>
              </li>
            </ul>
          </div>

          {/* Find Us - Map Integration */}
          <div className="space-y-6">
            <h4 className="text-[#F3EEE9] text-lg font-playfair font-bold tracking-[0.1em] uppercase">
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
            <p className="text-[12px] opacity-50 italic mt-4 font-dm-sans">
              Experience the sweetness at our flagship store.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#F3EEE9]/10 pt-10 mt-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] opacity-40 font-dm-sans">
            <p>© {new Date().getFullYear()} Gopi Misthan Bhandar. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
              <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms & Conditions</Link>
              <Link href="/refund-cancellation" className="hover:opacity-100 transition-opacity">Refund & Cancellation</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;