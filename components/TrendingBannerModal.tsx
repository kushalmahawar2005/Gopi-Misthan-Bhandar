'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

interface TrendingBannerData {
  _id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  productId: string;
  delaySeconds?: number;
}

const SESSION_KEY = 'trending-banner-shown';

const TrendingBannerModal: React.FC = () => {
  const [banner, setBanner] = useState<TrendingBannerData | null>(null);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Don't show on admin pages
    if (pathname.startsWith('/admin')) return;

    // Only show once per session
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_KEY) === '1') {
      return;
    }

    let timeoutId: number | undefined;
    let cancelled = false;

    const loadBanner = async () => {
      try {
        const res = await fetch('/api/featured', { cache: 'no-store' });
        const data = await res.json();

        if (!data.success || !data.data || !data.data.isActive) {
          return;
        }

        if (cancelled) return;

        const delaySeconds: number =
          typeof data.data.delaySeconds === 'number' && !Number.isNaN(data.data.delaySeconds)
            ? data.data.delaySeconds
            : 12;

        setBanner(data.data);

        timeoutId = window.setTimeout(() => {
          setVisible(true);
          try {
            window.sessionStorage.setItem(SESSION_KEY, '1');
          } catch {
            // ignore
          }
        }, Math.max(5, delaySeconds) * 1000);
      } catch (error) {
        console.error('Error loading trending banner:', error);
      }
    };

    loadBanner();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [pathname]);

  if (!banner || !visible) return null;

  const handleClose = () => {
    setVisible(false);
  };

  const handleClick = () => {
    if (banner.productId) {
      router.push(`/product/${banner.productId}`);
      setVisible(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-xl w-full">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-black/80 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <button
          type="button"
          onClick={handleClick}
          className="w-full text-left focus:outline-none"
        >
          <div className="relative w-full h-60 sm:h-72">
            <Image
              src={banner.imageUrl}
              alt={banner.title || 'Trending product'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-2">
              {banner.title && (
                <h3 className="text-xl sm:text-2xl font-bold leading-snug">
                  {banner.title}
                </h3>
              )}
              {banner.subtitle && (
                <p className="text-sm sm:text-base text-gray-100 line-clamp-2">
                  {banner.subtitle}
                </p>
              )}
              <div>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-red text-white text-sm font-semibold shadow-lg hover:bg-primary-darkRed transition-colors">
                  {banner.buttonText || 'View Product'}
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TrendingBannerModal;

