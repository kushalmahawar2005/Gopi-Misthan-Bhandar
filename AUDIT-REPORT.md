# Gopi Misthan Bhandar — Complete Audit Report
**Audit Date:** 19 April 2026 | **Framework:** Next.js 14 (App Router) | **Audited By:** Claude Code

---

# PART 1 — FULL SITE AUDIT

## Overall Site Score: ~72/100

**Stack:** Next.js 14 + MongoDB + Tailwind CSS + Razorpay + NimbusPost + Cloudinary + NextAuth + Nodemailer + Twilio

---

## 1. FEATURES IMPLEMENTED

### Customer-Facing
| Feature | Status |
|---|---|
| Product Catalog + Category/Search Filtering | Working |
| Multi-image Product Gallery with Pinch-Zoom | Working |
| Size/Weight Selector with Dynamic Pricing | Working |
| Cart (localStorage + MongoDB sync on login) | Working |
| Wishlist (same pattern as Cart) | Working |
| Recently Viewed Products (localStorage) | Working |
| Coupon Code (server-side validation) | Backend Ready — UI Missing |
| Multi-step Checkout (address, billing, pincode) | Working |
| Razorpay Payment (UPI + Card) | Working |
| Post-payment Order Confirmation Email + SMS | Email Working, SMS Not Configured |
| Order History Page | Working |
| Order Status Tracking Page | Working |
| User Profile with Editable Address | Working |
| Wedding Gift Enquiry Form | Working |
| Blog Section | Working |
| Photo Gallery | Working |
| InstaBook (Short Video Reels) | Working |
| GSAP Hero Slider + Lenis Smooth Scroll | Working |
| Floating WhatsApp/Phone Contact Buttons | Working |
| Trending Banner Modal | Working |
| Mobile Bottom Nav | Component exists — COMMENTED OUT |
| SEO: JSON-LD Schema, Sitemap, robots.txt, OG, Twitter Cards | Partial |
| PWA Manifest | Working |
| Gift Box Browsing by Category | Working |

### Admin Panel
| Feature | Status |
|---|---|
| Dashboard with Live Stats | Partial (some stats hardcoded) |
| Analytics with Recharts (Revenue, Orders, Top Products) | Working |
| Order Management + Pagination + Status Updates | Working |
| Auto-Print New Orders (polls every 30s) | Working |
| NimbusPost Shipment Creation + AWB Tracking + Cancel | Working |
| Full Product CRUD + Cloudinary Image Upload | Working |
| Bulk Product Operations + Import | Working |
| Category + Subcategory Management | Working |
| Inventory Management | Working |
| Coupon CRUD | Working |
| User Management + Role Assignment | Working |
| Blog Post CRUD | Working |
| Hero Slider Management | Working |
| Gallery Management | Working |
| Gift Box Management | Working |
| Site Content (Editable Banner/Offer Text) | Working |
| Review Moderation | Working |
| Wedding Enquiry Inbox | Working |
| Print-friendly Order Receipt | Working |

---

## 2. ALL PAGES

### Public Pages
| Route | Purpose |
|---|---|
| `/` | Home — full marketing landing page |
| `/products` | Shop grid with category/search filtering |
| `/product/[id]` | Product detail with image zoom, size selector, reviews |
| `/category/[slug]` | Category-filtered product listing |
| `/checkout` | Multi-step checkout |
| `/checkout/success` | Post-payment success page |
| `/checkout/failed` | Payment failure page |
| `/orders` | User order history |
| `/orders/track` | Public order tracking |
| `/profile` | Account settings + saved address |
| `/wishlist` | Wishlist items |
| `/giftbox/[category]` | Gift box category browsing |
| `/gallery` | Photo gallery |
| `/login` | Login page |
| `/register` | Register page |
| `/forgot-password` | Forgot password (BROKEN — fake implementation) |
| `/privacy` | Privacy policy |
| `/terms` | Terms and conditions |
| `/refund-cancellation` | Refund & cancellation policy |

### Admin Pages
| Route | Purpose |
|---|---|
| `/admin` | Dashboard with stats |
| `/admin/analytics` | Charts: Revenue, Orders, Top Products |
| `/admin/orders` | Order list, status updates, auto-print |
| `/admin/orders/[id]` | Order detail |
| `/admin/orders/[id]/print` | Printable receipt |
| `/admin/products` | Product list (paginated) |
| `/admin/products/new` | Create product |
| `/admin/products/[id]` | Edit product |
| `/admin/products/bulk` | Bulk operations |
| `/admin/products/bulk/import` | Bulk import |
| `/admin/categories` | Category management |
| `/admin/inventory` | Inventory/stock view |
| `/admin/coupons` | Coupon CRUD |
| `/admin/users` | User list + role management |
| `/admin/blog` | Blog post CRUD |
| `/admin/hero-slider` | Homepage hero slide management |
| `/admin/featured` | Featured/trending products |
| `/admin/instabook` | InstaBook video reel content |
| `/admin/gallery` | Gallery image management |
| `/admin/giftbox` | Gift box item management |
| `/admin/site-content` | Editable promotional text/banners |
| `/admin/reviews` | Review moderation |
| `/admin/wedding-enquiries` | Wedding gifting enquiry inbox |
| `/admin/settings` | Store settings |

---

## 3. USER FLOWS

### Purchase Flow
1. Browse homepage or `/products`
2. Select product, choose size/weight, set quantity
3. Add to cart (drawer opens) or "Buy It Now"
4. Checkout: fill shipping address, pincode serviceability check via NimbusPost
5. Optionally add separate billing address
6. Choose UPI or Card via Razorpay
7. Order created in DB with `pending` status → Razorpay modal opens
8. On success: `/api/payment/verify` validates signature, marks order `confirmed`, fires email + SMS
9. Razorpay webhook also handles `payment.captured` — deducts stock + triggers NimbusPost shipment
10. Cart cleared, redirected to `/checkout/success`

### Authentication Flow
- Two parallel auth systems: NextAuth (Google OAuth) + custom email/password JWT
- Login stores token in localStorage + HttpOnly cookie
- `getRequestAuth()` checks NextAuth JWT first, then custom cookie token

---

## 4. API INTEGRATIONS

| Integration | Status | Notes |
|---|---|---|
| Razorpay | Fully Implemented | Create order, verify, webhook with HMAC validation |
| NimbusPost | Fully Implemented | Serviceability, shipment, AWB tracking, cancel, token cache |
| Cloudinary | Fully Implemented | Single + multi-image upload |
| Nodemailer | Implemented | Order confirmation, shipment, wedding enquiry (reset broken) |
| Twilio SMS | Not Live | Stub exists in lib/sms.ts — not configured |
| NextAuth + Google OAuth | Fully Implemented | Creates DB user on first sign-in |
| Custom JWT | Fully Implemented | 7-day HS256 token, HttpOnly cookie + localStorage |
| MongoDB Atlas | Fully Implemented | Mongoose models, singleton connection with cache |

---

## 5. CRITICAL BUGS

### 1. Coupon UI Missing from Checkout
**Impact: Direct Revenue Loss**
- Backend 100% complete — DB has coupons, API supports coupon application
- Checkout page has ZERO coupon input field
- Customers cannot apply any coupon code
- **Fix:** Add coupon input field in checkout UI (30 min work, backend ready)

### 2. Forgot Password — Fake Implementation
- `/forgot-password` handler does `setTimeout(1500)` — simulates API but sends nothing
- No password reset email is ever sent
- `/reset-password` page does not exist
- No API route to generate or consume reset tokens
- `sendPasswordResetEmail` exists in `lib/email.ts` but is never called
- **Fix:** Generate token → store hashed in DB → send email → create `/reset-password` page

### 3. Cron Job Wrong Schedule
- Orders expire after 30 minutes (stock should be restored)
- `vercel.json` cron runs at `0 0 * * *` — only once at midnight
- Stock stays blocked for up to 23.5 hours
- **Fix:** Change cron to `*/30 * * * *`

### 4. User Address Missing Pincode Field
- `AddressSchema` in `models/User.ts` has only `type, street, city, state`
- Profile form collects pincode, checkout collects zipCode — both silently dropped
- **Fix:** Add `pincode/zipCode` to AddressSchema

### 5. Admin Dashboard Stats Hardcoded
- `contentCards` in `app/admin/page.tsx` shows static strings: `'Active Slides: 4'`, `'Published: 4'`
- Never updated from DB
- **Fix:** Fetch counts dynamically from API

### 6. Low Stock Counter Always 0
- `lowStockItems: 0` hardcoded in admin dashboard
- Low stock alert widget is completely non-functional
- **Fix:** Query `stock < threshold` from products collection

### 7. InstaPost API Route Missing
- `lib/api.ts` calls `/api/instapost` but route file doesn't exist (only `/api/instabook`)
- Silent 404 — error caught and returns `[]`
- **Fix:** Create `/api/instapost/route.ts` or remove dead `fetchInstaPosts` call

---

## 6. MODERATE ISSUES

| # | Issue | Fix |
|---|---|---|
| 8 | Checkout permanently blocked when NimbusPost returns no couriers | Add manual delivery fallback |
| 9 | Weight parsing inconsistency between checkout and webhook | Standardize to one field |
| 10 | `require('crypto')` inside ES module in `lib/razorpay.ts` | Move to top-level import |
| 11 | Cart sync race condition on login | Fix with proper async guards |
| 12 | Admin analytics calls `/api/orders` without pagination | Add pagination |
| 13 | `alert()` / `confirm()` used throughout admin UI | Replace with toast/modal components |
| 14 | Analytics fetches ALL orders at once — no pagination | Unbounded query — will slow/timeout at scale |
| 15 | Email CSS typo: `sans-general-sans` should be `sans-serif` | Fix CSS typo |

---

## 7. SECURITY ISSUES

| Issue | Risk |
|---|---|
| No rate limiting on `/api/auth/login` and `/api/auth/register` | Brute force attacks possible |
| No email verification on registration | Fake accounts, spam |
| Analytics unbounded MongoDB query | Server crash possible at scale |

---

## 8. MISSING FEATURES (Can Be Implemented)

### High Priority
1. **Coupon UI in Checkout** — backend ready, UI just missing
2. **Real Forgot Password Flow** — token → email → reset page
3. **Customer AWB Tracking UI** — show NimbusPost timeline on orders page

### Medium Priority
4. **COD (Cash on Delivery)** — backend supports it, UI doesn't offer it
5. **Search Bar in Header** — no search from homepage, must go to /products
6. **SMS Notifications** — Twilio not configured, silently failing
7. **Email Verification on Registration**
8. **Rate Limiting** on auth endpoints (Upstash ratelimit)

### Nice to Have
9. **Mobile Bottom Nav** — component exists, just commented out — enable it
10. **Product Recommendations** — "Related Products" section
11. **Review with Photos** — image upload in reviews
12. **Live Admin Dashboard Stats** — replace static numbers with dynamic
13. **Customer-facing AWB tracking** — let customers track their own orders

---

## 9. DATABASE MODELS SUMMARY

| Model | Key Fields |
|---|---|
| User | name, email, password (bcrypt), phone, role, addresses[] |
| Product | name, description, price, images[], category, subcategory, sizes[], stock, shelfLife |
| Order | userId, items[], shipping, billing, couponDiscount, shippingCost, total, paymentStatus, status (9 states), razorpayOrderId, awbNumber |
| Category | name, slug, image, subCategories[], order |
| Coupon | code, discountType, discountValue, minimumPurchase, startDate, endDate, usageLimit |
| Review | productId, userId, rating, comment, helpfulVotes, isApproved |
| Blog | title, description, imageUrl, slug, publishedDate, isActive |
| HeroSlider | image, mobileImage, title, order, isActive |
| WeddingEnquiry | name, email, phone, location, giftType, description |
| SiteContent | section, key-value content |

---

## 10. SITE AUDIT PRIORITY FIX LIST

| Priority | Fix |
|---|---|
| P0 | Add coupon input field in checkout UI |
| P0 | Fix cron job schedule to `*/30 * * * *` |
| P1 | Implement real forgot password flow |
| P1 | Add pincode to User Address schema |
| P1 | Rate limiting on auth APIs |
| P2 | Replace `alert()` with proper toast/modal in admin |
| P2 | Fix InstaPost API route |
| P2 | Reduce font families from 6 to 2-3 |
| P3 | Email verification on registration |
| P3 | Customer AWB tracking UI |
| P3 | Dynamic admin dashboard stats |

---
---

# PART 2 — FULL SEO AUDIT

## Overall SEO Score: ~48/100

---

## SEO EXECUTIVE SUMMARY

Solid foundation hai — metadata most pages pe hai, structured data implement hai, sitemap aur robots.txt exist karte hain, Next.js image optimization configured hai. Lekin **36 specific issues** hain jo ranking potential ko directly affect kar rahe hain.

**Biggest problems:**
- Homepage `'use client'` hai — no server-rendered content for Googlebot
- Product/Blog URLs MongoDB ObjectIDs use karte hain (non-semantic)
- Category pages sitemap mein missing hain
- No `aggregateRating` in Product schema (no star snippets)
- LocalBusiness schema mein phone, email, correct coordinates missing

---

## 1. METADATA AUDIT

### Root Layout (`app/layout.tsx`)

| Field | Status | Issue |
|---|---|---|
| metadataBase | GOOD | Correctly set |
| title.template | GOOD | `%s \| Gopi Misthan Bhandar` pattern |
| title length | BAD | 63 chars — 3 chars over 60-char limit |
| description length | BAD | 220 chars — over 160-char limit |
| Global canonical | BAD | Points to homepage for ALL pages that don't override |
| OG image | BAD | `/logo.png` 512×512 — should be 1200×630px |
| Twitter card | PARTIAL | References same 512×512 logo |
| robots + googleBot | GOOD | Full directives set |
| og:locale:alternate | MISSING | Should add `hi_IN` for Hindi/India |

**Suggested Root Title (48 chars):**
`Gopi Misthan Bhandar — Indian Sweets Since 1968`

**Suggested Root Description (158 chars):**
`Order authentic traditional Indian sweets, namkeen & gift hampers online from Gopi Misthan Bhandar, Neemuch — serving quality since 1968. Free shipping available.`

---

### Homepage (`app/page.tsx`)

**CRITICAL: `'use client'` directive on line 1**

- Cannot export metadata object
- All content (products, categories, hero) loaded via `useEffect` — invisible to Googlebot on first crawl
- No H1 tag anywhere on the page
- Inherits only generic root layout metadata

**Fix:** Convert to Server Component, fetch data with `async/await`, extract client logic to child components.

---

### Per-Page Metadata Status

| Page | Title | Description | OG Image | Twitter Card | H1 Tag |
|---|---|---|---|---|---|
| / (Homepage) | Inherited | Inherited | Logo 512x512 | Inherited | MISSING |
| /products | OK (51 chars) | LONG (175 chars) | Logo 512x512 | MISSING | Client-only |
| /product/[id] | OK | OK (155 chars) | Product img | OK | OK |
| /category/[slug] | OK | OK | Category img | OK | MISSING |
| /gallery | OK | OK | MISSING | MISSING | Unknown |
| /giftbox | OK | LONG (175 chars) | MISSING | MISSING | OK |
| /giftbox/[category] | MISSING | MISSING | MISSING | MISSING | OK |
| /privacy | OK | OK | MISSING | MISSING | Unknown |
| /terms | OK | OK | MISSING | MISSING | Unknown |
| /refund-cancellation | OK | OK | MISSING | MISSING | Unknown |
| /login | MISSING | MISSING | MISSING | MISSING | Unknown |
| /register | MISSING | MISSING | MISSING | MISSING | Unknown |
| /checkout | MISSING | MISSING | MISSING | MISSING | Unknown |
| /orders | MISSING | MISSING | MISSING | MISSING | Unknown |
| /profile | MISSING | MISSING | MISSING | MISSING | Unknown |

---

## 2. OPEN GRAPH & SOCIAL

### Critical OG Issues

1. **No dedicated 1200×630 OG image** — `/logo.png` (512×512) everywhere. WhatsApp/Facebook share pe thumbnail properly nahi dikhta. Direct CTR loss on social shares.

2. **Product OG `type: 'website'`** — should be `'product'`. Facebook price/availability data show nahi karega.

3. **Gallery, Giftbox pages pe OG images hi missing** — koi share karega toh blank thumbnail.

4. **Legal pages pe koi OG nahi** — low priority but fix should be done.

---

## 3. STRUCTURED DATA / JSON-LD AUDIT

### LocalBusiness Schema (`app/layout.tsx`)

| Field | Status | Issue |
|---|---|---|
| @type | GOOD | `['LocalBusiness', 'FoodEstablishment']` |
| name | GOOD | 'Gopi Misthan Bhandar' |
| address.streetAddress | BAD | `'Main Road'` — should be `'Shop No. 123, Main Street'` |
| geo.latitude/longitude | WRONG | Bhilwara (Rajasthan) ke coordinates — Neemuch ke nahi |
| telephone | MISSING | `+91 9425922445` footer mein hai lekin schema mein nahi |
| email | MISSING | `gopimisthan1968@gmail.com` footer mein hai lekin schema mein nahi |
| openingHours | MISMATCH | Schema: Mon-Sun 08:00-21:00 / Footer: Mon-Sat 10:00-21:00 |
| sameAs | MISSING | Social profile URLs nahi hain |
| hasMap | MISSING | Google Maps URL missing |
| priceRange | GOOD | '₹₹' |
| foundingDate | GOOD | '1968' |
| currenciesAccepted | MISSING | Should be 'INR' |
| paymentAccepted | MISSING | Should list UPI, Card, etc. |

### Product Schema (`app/product/[id]/layout.tsx`)

| Field | Status | Issue |
|---|---|---|
| @type Product | GOOD | Present |
| name, image, description, brand | GOOD | All present |
| offers.priceCurrency | GOOD | 'INR' |
| offers.availability | GOOD | InStock/OutOfStock mapped |
| aggregateRating | MISSING | Star snippets nahi dikhenge Google mein |
| sku | MISSING | No product identifier |
| review array | MISSING | Individual reviews not embedded |
| priceValidUntil | MISSING | Google recommends this |
| OG type | WRONG | `'website'` instead of `'product'` |

### BreadcrumbList Schema

| Issue | Fix |
|---|---|
| Position 3 uses query-param URL `/products?category=...` | Should use `/category/${slug}` static URL |

### Missing Schemas

| Page | Missing Schema |
|---|---|
| /category/[slug] | CollectionPage or ItemList |
| Homepage | ItemList (featured products) |
| /blog/[slug] | Article schema |

---

## 4. SITEMAP ISSUES (`app/sitemap.ts`)

| Issue | Severity |
|---|---|
| `/categories` in sitemap — page does not exist (404) | HIGH |
| `/category/[slug]` pages MISSING from sitemap | HIGH |
| Product URLs use MongoDB IDs not slugs | HIGH |
| Blog URLs use MongoDB IDs not slugs | HIGH |
| `/giftbox/[category]` pages missing | MEDIUM |
| `/wishlist` in sitemap but has `robots: noindex` (contradiction) | LOW |
| No sitemap index for large catalogs | LOW |

**Fix for `app/sitemap.ts` — Add category pages:**
```typescript
// Fetch all categories
const categories = await Category.find({ isActive: true })
const categoryUrls = categories.map(cat => ({
  url: `${BASE_URL}/category/${cat.slug}`,
  lastModified: cat.updatedAt,
  changeFrequency: 'weekly',
  priority: 0.8,
}))
```

---

## 5. ROBOTS.TXT ISSUES (`app/robots.ts`)

| Issue | Severity |
|---|---|
| `/checkout/success` not disallowed | MEDIUM |
| `/checkout/failed` not disallowed | MEDIUM |
| Login/Register pages — robots.txt disallow but no page-level `robots: noindex` | MEDIUM |
| Admin panel `/admin/` — correctly blocked | GOOD |
| API routes `/api/` — correctly blocked | GOOD |

---

## 6. URL STRUCTURE ISSUES

### Critical URL Problems

```
Product URLs:
  Current:      /product/507f1f77bcf86cd799439011
  Should be:    /product/kaju-katli-500g

Blog URLs:
  Current:      /blog/507f1f77bcf86cd799439011
  Should be:    /blog/top-10-traditional-indian-sweets

Category URLs (Nav/Footer):
  Current:      /products?category=sweets    (client-rendered, not indexed)
  Should be:    /category/sweets             (server-rendered, has metadata)
```

### Two Competing URL Patterns for Same Content
- `/products?category=sweets` (query param — client-rendered, NOT indexable)
- `/category/sweets` (static route — server-rendered, HAS proper metadata)

Navigation aur Footer `/products?category=...` use kar rahe hain — properly optimised `/category/[slug]` pages bypass ho rahe hain.

---

## 7. INTERNAL LINKING ISSUES

### Navigation (`Navigation.tsx`)
- Category links use `/products?category=sweets` not `/category/sweets`
- "Gifting" links to `/#gifting` anchor — no indexable dedicated URL
- Subcategory dropdown is dynamic from DB — GOOD

### Footer (`Footer.tsx`)
- "Our Range" links all use query-param URLs
- Social links point to `https://facebook.com` (generic) — not actual brand profiles
- `'Company'` and `'Our Story'` both link to `/#about` — redundant

### Breadcrumbs (`app/product/[id]/page.tsx`)
- Visual breadcrumb present — GOOD
- Category breadcrumb links to `/products?category=...` not `/category/slug`
- JSON-LD BreadcrumbList position 3 uses query-param URL — technically invalid

---

## 8. IMAGE SEO

### Alt Text Audit

| Component | Status | Alt Text |
|---|---|---|
| ProductCard main image | GOOD | `"${product.name} \| ${product.category} - Gopi Misthan Bhandar"` |
| ProductCard hover image | GOOD | `"${product.name} - View 2 \| Gopi Misthan Bhandar"` |
| Product detail images | GOOD | product.name |
| Hero slider images | GOOD | Slide title |
| Category card image | GOOD | cat.name |
| Footer logo | GOOD | "Gopi Misthan Bhandar" |
| Navigation logo | BAD | `alt="Logo"` — not descriptive |

**Fix Navigation logo:** Change `alt="Logo"` to `alt="Gopi Misthan Bhandar Logo"`

### Image Optimization
- All images use `next/image` component — no raw `<img>` tags — GOOD
- AVIF/WebP formats enabled — GOOD
- `sizes` attributes correctly specified — GOOD
- **Issue:** Cloudinary images use auto-generated IDs — descriptive naming would help Google Image Search

---

## 9. PERFORMANCE SEO (`next.config.js`)

### What's Good
- `formats: ['image/avif', 'image/webp']` — GOOD
- `minimumCacheTTL: 31536000` — 1 year cache — GOOD
- `compress: true` — Gzip/Brotli enabled — GOOD
- Aggressive cache headers on static assets — GOOD
- Security headers (X-Content-Type-Options, X-Frame-Options) — GOOD
- `productionBrowserSourceMaps: false` — smaller bundles — GOOD

### Issues
- Development CDNs in `remotePatterns`: `via.placeholder.com`, `picsum.photos`, `images.unsplash.com` — remove in production
- No `Content-Security-Policy` header
- No `Strict-Transport-Security` (HSTS) header

### Font Loading Issues
- 6 Google font families loaded — very heavy (LCP hit)
  - Averia Serif Libre, Inder, Inter, Jost, Roboto Slab, Sora
  - **Fix:** Reduce to 2-3 families max
- Manual `<link>` tag used for Google Fonts — should use `next/font/google`
  - `next/font/google` auto-applies `display: swap`, eliminates external request, zero-CLS
- Self-hosted GeneralSans local font — GOOD
- `preconnect` for fonts.googleapis.com — GOOD

---

## 10. LOCAL SEO — NAP Consistency

**NAP = Name, Address, Phone — must be identical everywhere**

| Location | Address |
|---|---|
| LocalBusiness Schema | `'Main Road', Neemuch, 458441` |
| Footer (displayed to users) | `'Shop No. 123, Main Street, Neemuch, MP 458441'` |

Schema aur displayed content match nahi karte — Google is inconsistency ko negatively treat karta hai.

**Google Maps Coordinates Check Needed:**
Schema mein latitude: 24.4619, longitude: 74.8666 hain — verify karo actual store location se.

---

## 11. TECHNICAL SEO

### Heading Hierarchy

| Page | H1 Status | Issue |
|---|---|---|
| Homepage | MISSING | No H1 — biggest SEO oversight |
| /product/[id] | GOOD | `{product.name}` is H1 |
| /category/[slug] | MISSING | Category name is in H3, not H1 |
| /giftbox/[category] | GOOD | `{heading}` is H1 |
| /blog/[slug] | Unknown | Needs verification |

### 404 Page
- Custom 404 page exists — GOOD
- Has H1 ("404"), H2 ("Page Not Found") — GOOD
- Links back to Home and Products — GOOD
- Missing `robots: { index: false }` — add it

### Duplicate Content Risks
1. `/products?category=sweets` AND `/category/sweets` — same content, competing URLs
2. Multiple pages showing same products without canonical cross-linking
3. Blog URLs are non-descriptive — all look structurally identical to crawlers

---

## 12. SEO CONSOLIDATED ISSUES LIST

### CRITICAL — Fix First

| # | Issue | Impact |
|---|---|---|
| 1 | Homepage `'use client'` — no server content for Googlebot | MASSIVE |
| 2 | Product URLs use MongoDB IDs — no keyword value | HIGH |
| 3 | Blog URLs use MongoDB IDs — no keyword value | HIGH |
| 4 | Category pages missing from sitemap | HIGH |
| 5 | `/categories` in sitemap but page doesn't exist (404) | HIGH |
| 6 | No `aggregateRating` in Product JSON-LD — no star snippets | HIGH |

### HIGH PRIORITY

| # | Issue |
|---|---|
| 7 | Homepage has no H1 tag |
| 8 | Category pages have no H1 tag |
| 9 | `telephone` and `email` missing from LocalBusiness schema |
| 10 | Opening hours mismatch (schema vs footer) |
| 11 | GeoCoordinates wrong — verify actual store location |
| 12 | `sameAs` social profile URLs missing from schema |
| 13 | OG image should be 1200×630px (not 512×512 logo) |
| 14 | Product OG `type` should be `'product'` not `'website'` |
| 15 | Navigation + Footer links use query params not `/category/[slug]` |

### MEDIUM PRIORITY

| # | Issue |
|---|---|
| 16 | Root title is 63 chars — trim to under 60 |
| 17 | Root description is 220 chars — trim to 160 |
| 18 | /products description 175 chars — trim to 160 |
| 19 | /giftbox description 175 chars — trim to 160 |
| 20 | OG image missing on gallery, giftbox, legal pages |
| 21 | Twitter card missing on products, gallery, giftbox, legal pages |
| 22 | BreadcrumbList position 3 uses query-param URL — fix to `/category/slug` |
| 23 | `/giftbox/[category]` pages missing from sitemap |
| 24 | `/wishlist` in sitemap but has `robots: noindex` — remove from sitemap |
| 25 | Login, Register, Checkout pages need page-level `robots: { index: false }` |
| 26 | No CollectionPage JSON-LD on category pages |

### LOW PRIORITY

| # | Issue |
|---|---|
| 27 | Navigation logo `alt="Logo"` — change to descriptive alt |
| 28 | Footer social links generic (facebook.com) — update to brand profiles |
| 29 | Remove dev CDNs from next.config.js remotePatterns |
| 30 | Use `next/font/google` instead of manual `<link>` tags |
| 31 | Reduce Google Fonts from 6 families to 2-3 |
| 32 | Add HSTS and Content-Security-Policy headers |
| 33 | Add trailing slash normalisation in next.config.js |
| 34 | `streetAddress` in schema should match footer exactly |
| 35 | Cloudinary public IDs should be named descriptively |
| 36 | `/checkout/success` and `/checkout/failed` not disallowed in robots.ts |

---

## 13. SEO IMPLEMENTATION PLAN

### Phase 1 — Critical (Week 1)
- [ ] Add `slug` field to Product model, migrate product URLs to `/product/[slug]`
- [ ] Add `slug` field to Blog model, migrate blog URLs to `/blog/[slug]`
- [ ] Convert Homepage to Server Component — add H1, server-rendered content
- [ ] Add H1 to Category pages (`/category/[slug]`)
- [ ] Fix Sitemap: add `/category/[slug]` pages, remove `/categories` (404), remove `/wishlist`
- [ ] Fix LocalBusiness schema: add telephone, email, verify coordinates, fix hours, add sameAs

### Phase 2 — High Priority (Week 2)
- [ ] Add `aggregateRating` to Product JSON-LD schema (fetch avg rating)
- [ ] Change Navigation + Footer links from query params to `/category/[slug]`
- [ ] Create a proper 1200×630 OG banner image
- [ ] Fix Product OG type from `'website'` to `'product'`
- [ ] Fix root title (max 60 chars) and description (max 160 chars)
- [ ] Add missing OG metadata to gallery, giftbox, legal pages

### Phase 3 — Medium Priority (Week 3)
- [ ] Migrate Google Fonts to `next/font/google`
- [ ] Reduce font families from 6 to 2-3
- [ ] Fix BreadcrumbList JSON-LD position 3 URL
- [ ] Add CollectionPage JSON-LD to category pages
- [ ] Add page-level `robots: { index: false }` to login, register, checkout
- [ ] Add `/checkout/success` and `/checkout/failed` to robots.ts disallow
- [ ] Fix `streetAddress` in schema to match footer
- [ ] Update social links in footer to actual brand profile URLs

### Phase 4 — Polish (Week 4)
- [ ] Add HSTS + CSP headers to next.config.js
- [ ] Remove dev CDNs from remotePatterns
- [ ] Fix Navigation logo alt text
- [ ] Add trailing slash normalisation
- [ ] Rename Cloudinary uploads with descriptive public IDs

---

## 14. EXPECTED RESULTS AFTER FULL SEO FIX

| Metric | Current | Expected After Fixes |
|---|---|---|
| Google Indexing Quality | Poor (homepage JS-only) | Excellent (server-rendered) |
| Product URL Keyword Value | 0 (MongoDB IDs) | High (slug-based) |
| Star Ratings in SERP | Not showing | Showing (aggregateRating) |
| Category Page Discoverability | Low (missing from sitemap) | High |
| Local Search Visibility | Partial | Full (complete LocalBusiness schema) |
| Social Share Click-Through | Low (logo thumbnail) | High (proper OG image) |
| Core Web Vitals / LCP | Moderate | Improved (fewer fonts, next/font) |

---

*Report generated by Claude Code — 19 April 2026*
*Next Audit Recommended: After Phase 1 & 2 completion*
