'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const TrendingBannerModal = dynamic(() => import('./TrendingBannerModal'), { ssr: false });

export default function DeferredPromotion() {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => { timer = setTimeout(() => setReady(true), 3000); };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', schedule);
    };
  }, []);
  if (!ready || pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;
  return <TrendingBannerModal />;
}
