/**
 * Hero Slider — Slide Content Data
 * ──────────────────────────────────
 * HOW TO ADD / EDIT SLIDES
 * 1. Add a new object to the `heroSlides` array below.
 * 2. Place your image in `public/hero/` (ideally a high-res PNG with transparent
 *    background for the product cutout, or a full-width JPG for the backdrop).
 * 3. Set `bgColor` to a soft pastel that complements the product.
 * 4. CTA `href` should point to the relevant product listing or page.
 * 5. Restart the dev server if images aren't appearing (Next.js caches aggressively).
 */

export interface SlideData {
  id: number;
  eyebrow: string;
  headline: string;
  subtext: string;
  cta: {
    label: string;
    href: string;
  };
  bgColor: string;
  /** Product / hero image displayed on the right side */
  image: string;
  /** Alt text for the product image */
  imageAlt: string;
}

export const heroSlides: SlideData[] = [
  {
    id: 1,
    eyebrow: "GOPI'S SIGNATURE",
    headline: 'Authentic Indian\nNamkeen',
    subtext:
      'Because Every Bite Should Feel Right — Crafted with traditional recipes since 1968',
    cta: { label: 'SHOP NAMKEEN', href: '/products?category=namkeen' },
    bgColor: '#FDF8F3',
    image: '/hero/namkeen-pack.png',
    imageAlt: 'Gopi Misthan Bhandar Signature Namkeen collection',
  },
  {
    id: 2,
    eyebrow: 'FESTIVE COLLECTION',
    headline: 'Master The Art\nof Gifting',
    subtext:
      'Premium mithai boxes for every celebration — weddings, Diwali, corporate gifting',
    cta: { label: 'EXPLORE GIFTING', href: '/giftbox' },
    bgColor: '#FBEEE6',
    image: '/hero/mithai-box.png',
    imageAlt: 'Gopi Misthan Bhandar premium mithai gift box',
  },
  {
    id: 3,
    eyebrow: 'SINCE 1968',
    headline: 'Three Generations\nof Trust',
    subtext:
      'From our family kitchen to yours — pure ghee, no preservatives, made fresh daily',
    cta: { label: 'OUR STORY', href: '/#about' },
    bgColor: '#FAF3E7',
    image: '/hero/heritage.png',
    imageAlt: 'Gopi Misthan Bhandar heritage — three generations of sweetness',
  },
];
