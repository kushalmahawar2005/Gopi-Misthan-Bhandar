# Gopi Misthan Bhandar - E-commerce Website

Traditional Indian sweets, snacks, and namkeen e-commerce website for Gopi Misthan Bhandar Neemuch.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Icons** - Icon library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Top header banner
│   ├── Navigation.tsx      # Navigation bar
│   ├── HeroSection.tsx     # Hero banner section
│   ├── ProductCard.tsx     # Product card component
│   ├── CategoryCard.tsx    # Category card component
│   ├── Footer.tsx          # Footer component
│   └── sections/           # Section components
│       ├── FeaturedCollection.tsx
│       ├── AboutSection.tsx
│       ├── CategoriesSection.tsx
│       ├── ProductSection.tsx
│       └── InstagramSection.tsx
├── lib/
│   └── data.ts             # Data and mock data
├── types/
│   └── index.ts            # TypeScript types
└── public/                 # Static assets
```

## Features

- ✅ Responsive design
- ✅ Home page with all sections
- ✅ Product listings
- ✅ Category sections
- ✅ Instagram integration section
- 🔄 Shopping cart (coming soon)
- 🔄 Product pages (coming soon)
- 🔄 Checkout (coming soon)

## Color Palette

- Primary Red: `#ba0606`
- Dark Red: `#b71a1a`
- Brown: `#331818`
- Yellow Accent: `#ffd901`

## Next Steps

- [ ] Add product images
- [ ] Implement shopping cart functionality
- [ ] Create product detail pages
- [ ] Add checkout flow
- [ ] Integrate payment gateway
- [ ] Add admin panel
