import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://gopimisthanbhandar.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',        // Admin dashboard (private)
          '/api/',          // Backend API routes
          '/checkout/',     // Checkout flow (private to user)
          '/checkout/success',
          '/checkout/failed',
          '/orders/',       // User orders (private)
          '/profile/',      // User profile (private)
          '/login',         // Auth pages (no SEO value)
          '/register',      // Auth pages (no SEO value)
          '/forgot-password', // Auth pages
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/', '/checkout/success', '/checkout/failed', '/orders/', '/profile/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
