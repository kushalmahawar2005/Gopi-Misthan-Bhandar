import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { WishlistProvider } from '@/context/WishlistContext'
import FloatingContactButtons from '@/components/FloatingContactButtons'
import MobileBottomNav from '@/components/MobileBottomNav'
import SmoothScroll from '@/components/SmoothScroll'
import TrendingBannerModal from '@/components/TrendingBannerModal'
import NextAuthSessionProvider from '@/components/NextAuthSessionProvider'
import Script from 'next/script'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gopimisthanbhandar.com';
const FSSAI_LICENSE = process.env.NEXT_PUBLIC_FSSAI_LICENSE || '';
const GST_NUMBER = process.env.NEXT_PUBLIC_GST_NUMBER || '';

const SAME_AS_EXTRA = [
  process.env.NEXT_PUBLIC_JUSTDIAL_URL,
  process.env.NEXT_PUBLIC_MAGICPIN_URL,
  process.env.NEXT_PUBLIC_INDIAMART_URL,
  process.env.NEXT_PUBLIC_WIKIDATA_URL,
  process.env.NEXT_PUBLIC_ZOMATO_URL,
  process.env.NEXT_PUBLIC_SWIGGY_URL,
].filter((url): url is string => typeof url === 'string' && url.trim().length > 0);

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Buy Indian Sweets Online — Mithai, Namkeen & Gift Boxes | Gopi Misthan Bhandar',
    template: '%s | Gopi Misthan Bhandar',
  },
  description: 'Order authentic Indian sweets online — Kaju Katli, Soan Papdi, Motichoor Ladoo, Milk Cake, Rasgulla, Gulab Jamun, Bikaneri Bhujia, Namkeen & premium dry-fruit gift hampers. Fresh, handcrafted mithai with 60-day shelf life. Pan-India delivery from Gopi Misthan Bhandar Neemuch since 1968.',
  authors: [{ name: 'Gopi Misthan Bhandar' }],
  creator: 'Gopi Misthan Bhandar',
  publisher: 'Gopi Misthan Bhandar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'Gopi Misthan Bhandar',
    title: 'Buy Indian Sweets, Mithai & Gift Boxes Online | Gopi Misthan Bhandar',
    description: 'Kaju Katli, Soan Papdi, Motichoor Ladoo, Milk Cake, Bhujia, Sev & premium gift hampers — fresh, handcrafted, pan-India delivery from Neemuch since 1968.',
    images: [
      {
        url: '/Hamper.jpg',
        width: 1200,
        height: 630,
        alt: 'Gopi Misthan Bhandar — premium Indian sweets and gift hampers since 1968',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy Indian Sweets Online — Mithai, Namkeen & Gift Boxes',
    description: 'Kaju Katli, Soan Papdi, Motichoor Ladoo, Milk Cake, Bhujia & dry-fruit hampers. Pan-India delivery from Gopi Misthan Bhandar Neemuch.',
    images: ['/Hamper.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: 'googlef13db792397cb182',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2YH8XGBEV6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-2YH8XGBEV6');
          `}
        </Script>
        {/* Preconnect to font CDN - reduces DNS lookup time */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for image CDN (Cloudinary) */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* ALL Google Fonts combined into ONE request (was 3 separate = 3× render-blocking calls) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:wght@300;400;700&family=Inder&family=Inter:wght@300;400;500;600;700;800;900&family=Jost:ital,wght@0,100..900;1,100..900&family=Roboto+Slab:wght@300;400;500;600;700&family=Sora:wght@100..800&display=swap"
          rel="stylesheet"
        />
        {/* Local font - self-hosted (no external request) */}
        <link href="/fonts/GeneralSans_Complete/Fonts/WEB/css/general-sans.css" rel="stylesheet" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ba0606" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gopi Sweets" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* JSON-LD: LocalBusiness Schema (Google Knowledge Panel) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['LocalBusiness', 'FoodEstablishment'],
              '@id': `${BASE_URL}/#organization`,
              name: 'Gopi Misthan Bhandar',
              alternateName: 'Gopi Sweets Neemuch',
              url: BASE_URL,
              logo: `${BASE_URL}/logo.png`,
              image: `${BASE_URL}/logo.png`,
              description: 'Serving Tradition & Sweetness Since 1968. Traditional Indian sweets, premium mithai, namkeen, dry fruit boxes, and gifting solutions from Neemuch, Madhya Pradesh.',
              foundingDate: '1968',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'SHOP-1 - 304,TILAK MARG NEEMUCH (M.P)',
                addressLocality: 'Neemuch',
                addressRegion: 'Madhya Pradesh',
                postalCode: '458441',
                addressCountry: 'IN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 24.4619,
                longitude: 74.8666,
              },
              telephone: '+91-9425922445',
              email: 'gopimisthan1968@gmail.com',
              servesCuisine: 'Indian Sweets',
              priceRange: '₹₹',
              currenciesAccepted: 'INR',
              paymentAccepted: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash'],
              openingHoursSpecification: [{
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '10:00',
                closes: '21:00',
              }],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                telephone: '+91-9425922445',
                email: 'gopimisthan1968@gmail.com',
                areaServed: 'IN',
                availableLanguage: ['en', 'hi'],
              },
              sameAs: [
                'https://instagram.com/gopimisthanbhandar',
                'https://facebook.com/gopimisthanbhandar',
                'https://youtube.com/@gopimisthan1968',
                ...SAME_AS_EXTRA,
              ],
              ...(FSSAI_LICENSE && {
                hasCredential: {
                  '@type': 'EducationalOccupationalCredential',
                  credentialCategory: 'FSSAI License',
                  recognizedBy: { '@type': 'Organization', name: 'Food Safety and Standards Authority of India' },
                  identifier: FSSAI_LICENSE,
                },
              }),
              ...(GST_NUMBER && {
                taxID: GST_NUMBER,
                vatID: GST_NUMBER,
              }),
              hasMap: 'https://maps.google.com/maps?q=Gopi%20Misthan%20Bhandar%20Neemuch%20Madhya%20Pradesh&t=&z=15&ie=UTF8&iwloc=&output=embed',
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Gopi Misthan Bhandar Products',
                itemListElement: [
                  { '@type': 'OfferCatalog', name: 'Traditional Sweets' },
                  { '@type': 'OfferCatalog', name: 'Premium Sweets' },
                  { '@type': 'OfferCatalog', name: 'Namkeen & Snacks' },
                  { '@type': 'OfferCatalog', name: 'Dry Fruit Gift Boxes' },
                ],
              },
            }),
          }}
        />
        {/* JSON-LD: WebSite Schema (Google Sitelinks Search Box) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Gopi Misthan Bhandar',
              url: BASE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${BASE_URL}/products?search={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased overflow-x-hidden w-full relative min-h-screen">
        <SmoothScroll />
        <NextAuthSessionProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <FloatingContactButtons />
                <TrendingBannerModal />
                {/* <MobileBottomNav /> */}
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}