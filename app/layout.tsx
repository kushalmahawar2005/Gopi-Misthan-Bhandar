import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gopi Misthan Bhandar Neemuch - Traditional Indian Sweets',
  description: 'Serving Tradition & Sweetness Since 1968. Traditional Indian sweets, snacks, and namkeen from Neemuch.',
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
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
