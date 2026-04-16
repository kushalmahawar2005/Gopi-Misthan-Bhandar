'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiFacebook, FiInstagram, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 2500);
  };

  const socialLinks = [
    { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FiYoutube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  const paymentStripSrc = '/visa.svg';

  const rangeLinks = [
    { label: 'Sweets', href: '/products?category=sweets' },
    { label: 'Dry Fruits', href: '/products?category=dry-fruit' },
    { label: 'Gifting', href: '/#gifting' },
    { label: 'Indian Bakery', href: '/products?category=bakery-items' },
    { label: 'Namkeen', href: '/products?category=namkeen' },
    { label: 'Savoury Snacks', href: '/products?category=savoury-snacks' },
  ];

  const aboutLinks = [
    { label: 'Company', href: '/#about' },
    { label: 'Our Story', href: '/#about' },
    { label: 'Contact Us', href: '/#contact' },
    { label: 'Login', href: '/login' },
    { label: 'Track Your Order', href: '/orders' },
  ];

  const legalLinks = [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Refund & Cancellation', href: '/refund-cancellation' },
  ];

  return (
    <footer id="contact" className="w-full bg-[#FFF8F1] text-[#503223]">
      <div className="w-full px-4 md:px-8 lg:px-12 pt-3 md:pt-4 pb-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between border-b border-[#e8d7c3] pb-6 md:pb-7">
          <Link href="/" className="relative w-[210px] h-[60px] md:w-[250px] md:h-[72px]">
            <Image src="/logo.png" alt="Gopi Misthan Bhandar" fill className="object-contain object-left" />
          </Link>

          <div className="hidden md:block relative w-[110px] h-[76px] opacity-80">
            <Image src="/bird.avif" alt="Decorative bird" fill className="object-contain" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.7fr] gap-8 md:gap-10 xl:gap-12 pt-8 md:pt-10">
          <div>
            <h4 className="text-[30px] md:text-[32px] font-roboto leading-none mb-4 text-[#503223]">Our Range</h4>
            <ul className="space-y-2.5 text-[15px] font-flama text-[#503223]">
              {rangeLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#FE8E02] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[30px] md:text-[32px] font-roboto leading-none mb-4 text-[#503223]">About Us</h4>
            <ul className="space-y-2.5 text-[15px] font-flama text-[#503223]">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#FE8E02] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[30px] md:text-[32px] font-roboto leading-none mb-4 text-[#503223]">Legal</h4>
            <ul className="space-y-2.5 text-[15px] font-flama text-[#503223]">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#FE8E02] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[34px] md:text-[38px] font-roboto leading-tight text-[#b37b20] mb-4 md:mb-5">
              We'd Be Happy To Assist You!
            </h4>

            <form onSubmit={handleSubscribe} className="flex items-center bg-white border border-[#e1cfba] overflow-hidden rounded-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
                className="w-full h-12 px-4 text-[15px] font-flama outline-none text-[#503223] placeholder:text-[#9d8f83]"
              />
              <button
                type="submit"
                className="h-12 px-5 md:px-7 bg-[#FE8E02] text-white text-[14px] font-flama whitespace-nowrap hover:bg-[#D87A0A] transition-colors"
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-5 text-[14px] font-flama text-[#503223]">
              <div>
                <p className="font-semibold mb-1">Timing :</p>
                <p>Monday To Saturday</p>
                <p>10:00 AM to 9:PM PM IST</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Email :</p>
                <a href="mailto:gopimisthan1968@gmail.com" className="hover:text-[#FE8E02] transition-colors block">
                  gopimisthan1968@gmail.com
                </a>
              </div>
              <div>
                <p className="font-semibold mb-1">Phone :</p>
                <a href="tel:+919425922445" className="hover:text-[#FE8E02] transition-colors">
                  +91 9425922445
                </a>
              </div>
              <div>
                <p className="font-semibold mb-1">Address :</p>
                <p>Shop No. 123, Main Street, Neemuch, MP 458441</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#ead9c6] bg-white/70">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[20px] md:text-[22px] font-roboto text-[#503223] mb-2">Payment Methods</p>
            <div className="relative h-[20px] w-[240px] md:h-[24px] md:w-[320px]">
              <Image src={paymentStripSrc} alt="Accepted payment methods" fill className="object-contain object-left" />
            </div>
          </div>

          <div className="md:text-right">
            <p className="text-[20px] md:text-[22px] font-roboto text-[#503223] mb-2">Follow Us On</p>
            <div className="flex md:justify-end gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-[#d9c4a8] bg-white text-[#b37b20] hover:text-[#FE8E02] hover:border-[#FE8E02] transition-colors flex items-center justify-center"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#ead9c6] bg-[#fff9f2]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-4 flex flex-col md:flex-row justify-between items-center gap-3 text-[14px] text-[#503223] font-flama">
          <p className="text-center md:text-left">© {new Date().getFullYear()} Gopi Misthan Bhandar. All Rights Reserved</p>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link href="/privacy" className="hover:text-[#FE8E02] transition-colors">Privacy Policy</Link>
            <span className="text-[#d9c4a8]">|</span>
            <Link href="/terms" className="hover:text-[#FE8E02] transition-colors">Terms & Conditions</Link>
            <span className="text-[#d9c4a8]">|</span>
            <Link href="/refund-cancellation" className="hover:text-[#FE8E02] transition-colors">Refund & Cancellation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;