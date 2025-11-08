/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.figma.com',
      },
      {
        protocol: 'https',
        hostname: '**.figma.com',
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
        hostname: 'fastly.picsum.photos',
      },
    ],
    // Increase minimum cache time to reduce frequent fetches
    minimumCacheTTL: 60,
    // Disable image optimization to prevent timeout errors with external images
    // Remove this line when you have your own images hosted locally
    unoptimized: true,
  },
}

module.exports = nextConfig