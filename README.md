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

## Maintenance Mode

The whole storefront can be put behind an "Under Maintenance" page with an
environment variable — no code change or redeploy of the app logic required.

| Variable | Value | Effect |
|---|---|---|
| `MAINTENANCE_MODE` | `true` | Every public page and API returns the maintenance page with HTTP `503` |
| `MAINTENANCE_BYPASS_TOKEN` | any secret string | Enables the preview bypass (optional) |

**Turn it on:** set `MAINTENANCE_MODE=true` in Vercel (Production) and redeploy.
**Turn it off:** set it to `false` (or delete it) and redeploy.

Still reachable while maintenance is on:

- `/admin` and `/api/admin` (still protected by the normal admin login)
- `/login` and `/api/auth/*` — so you can sign in to the admin panel
- `/api/cron/*` — scheduled jobs keep running
- `robots.txt`, `sitemap.xml` and everything in `/public`

**Previewing the real site:** visit `https://<site>/?bypass=<MAINTENANCE_BYPASS_TOKEN>`.
That sets an httpOnly cookie for 7 days so you browse the live site normally while
every other visitor keeps seeing the maintenance page. Clear the
`gmb_maintenance_bypass` cookie to go back to the maintenance view.

The page returns `503` + `Retry-After` (not `200`), which is what Google expects
for temporary downtime — rankings are preserved instead of the pages being dropped.
