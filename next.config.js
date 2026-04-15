/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Auto-convert ALL images to modern formats (AVIF > WebP > original)
    // AVIF is 50% smaller than JPEG, WebP is 30% smaller
    formats: ['image/avif', 'image/webp'],
    
    // Default quality is already 75 in next.js, which is optimal for webp/avif
    
    // Cache optimized images for 1 year (immutable content)
    minimumCacheTTL: 31536000,
    
    // Define exact device widths for responsive images
    // This prevents Next.js from generating too many sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Compress output for smaller transfer sizes
  compress: true,
  
  // Enable production source maps for debugging (optional, can disable)
  productionBrowserSourceMaps: false,
  
  // Performance headers
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache JS/CSS chunks
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Security headers (also helps SEO — Google prefers secure sites)
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
