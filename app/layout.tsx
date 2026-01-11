import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { WishlistProvider } from '@/context/WishlistContext'
import FloatingContactButtons from '@/components/FloatingContactButtons'
import MobileBottomNav from '@/components/MobileBottomNav'
import SmoothScroll from '@/components/SmoothScroll'

export const metadata: Metadata = {
  title: 'Gopi Misthan Bhandar Neemuch - Traditional Indian Sweets',
  description: 'Serving Tradition & Sweetness Since 1968. Traditional Indian sweets, snacks, and namkeen from Neemuch.',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:wght@300;400;700&family=Inder&family=Inter:wght@300;400;500;600;700;800;900&family=Roboto+Slab:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Geom:ital,wght@0,300..900;1,300..900&family=Sora:wght@100..800&display=swap" rel="stylesheet" />
        <link href="/fonts/GeneralSans_Complete/Fonts/WEB/css/general-sans.css" rel="stylesheet" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ba0606" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gopi Sweets" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="antialiased">
        <SmoothScroll />
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <FloatingContactButtons />
              {/* <MobileBottomNav /> */}
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
