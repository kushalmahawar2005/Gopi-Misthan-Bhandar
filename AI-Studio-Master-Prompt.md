# Google AI Studio — Master Prompt
## White-Label Restaurant Ordering SaaS Platform

---

## PROMPT 1: PRODUCT BLUEPRINT & ARCHITECTURE

Copy-paste this in Google AI Studio (Gemini 2.0 Pro / Flash):

---

You are a senior SaaS product architect and full-stack engineer with 10+ years of experience building multi-tenant platforms like Shopify, Calendly, and Linear.

I am building a **white-label restaurant ordering SaaS platform** for the Indian market. Think "Shopify for restaurants" — each restaurant signs up, sets up their business, and instantly gets their own branded ordering website (PWA-based).

### CORE CONCEPT
- Multi-tenant SaaS, fully web-based (PWA — no native app)
- Each restaurant gets a subdomain like `rajusweets.myplatform.com` (free plan)
- Paid plans support custom domains like `rajusweets.com`
- Customer of a restaurant only sees that restaurant — no marketplace
- Restaurant owner manages everything from a centralized admin dashboard
- I am a solo founder starting lean, scaling gradually

### MVP SCOPE (Phase 1 — Week 1 to 4)

**Restaurant Owner Panel:**
1. Signup/Login (email + OTP based)
2. Business profile setup (name, logo upload, brand color, contact, address, GSTIN optional)
3. Choose from 3-4 pre-built professional themes
4. Menu builder — categories, items, photos, price, veg/non-veg tag, in-stock toggle
5. Live order dashboard with statuses: Placed → Accepted → Preparing → Ready → Out for Delivery → Delivered → Cancelled
6. Settings — delivery radius, delivery charges, opening hours, payment modes (COD/UPI/Online)
7. Basic analytics — today's orders, revenue, top 5 items, weekly trend

**Customer Side (loads on restaurant's subdomain):**
1. Branded landing page with restaurant's logo, color, food images
2. Menu browse — categories, search, filter (veg/non-veg)
3. Cart — add, modify quantity, remove
4. Checkout — name, phone, address (with map pin optional), payment method
5. Order confirmation + live status tracking
6. Reorder option for repeat customers

**Super Admin (Platform Owner — me):**
1. List of all signed-up restaurants
2. Plan management (free / paid tiers)
3. Platform-wide metrics (total restaurants, orders, GMV)

### UI/UX REQUIREMENTS — NON-NEGOTIABLE
- Must look enterprise-grade from Day 1 (think Linear, Stripe, Notion quality)
- Modern, minimal, premium design language
- Mobile-first responsive
- Smooth micro-interactions and transitions
- Designed empty states, loading skeletons, error states
- Consistent design system (8pt spacing grid, defined typography scale, accessible color contrast)
- Restaurant customer pages should feel premium — focus on food photography
- Light theme by default, dark mode optional for admin panel
- WCAG AA accessibility compliant

### TECH STACK (recommended, justify if you change)
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Next.js API Routes + tRPC (or REST)
- Database: PostgreSQL with multi-tenant strategy (tenant_id column)
- Auth: Clerk or NextAuth + custom OTP
- File storage: Cloudinary (image optimization built-in)
- Payments: Razorpay (UPI, cards, netbanking, wallets)
- PWA: next-pwa
- Hosting: Vercel (frontend) + Supabase (DB + storage)
- Email/SMS: Resend (email) + MSG91 (SMS/OTP)

### DELIVERABLES I NEED FROM YOU

1. **Architecture diagram** in text/ASCII form (system components + data flow)
2. **Complete database schema** — all tables, columns, types, relationships, indexes (provide as SQL)
3. **Multi-tenancy strategy** — exactly how subdomain routing works in Next.js middleware
4. **Folder structure** — complete file tree for Next.js project
5. **All screens list** — categorized by user role (owner / customer / super admin) with purpose of each screen
6. **API endpoints list** — RESTful, organized by resource
7. **Component library plan** — list of shared components (Button, Input, Modal, OrderCard, MenuItem, etc.)
8. **Design system tokens** — exact color palette (with hex), typography scale, spacing scale, border radius, shadow tokens
9. **Theme system design** — how a restaurant's chosen theme + brand color overrides defaults
10. **90-day phased roadmap** — Week 1 to 12, broken down by what to build each week
11. **Top 10 risks** — technical, product, business — with mitigation for each
12. **Security checklist** — multi-tenant data isolation, payment security, auth, rate limiting
13. **Pricing strategy suggestion** — free / starter / pro / enterprise tiers with features and price points in INR
14. **First Week implementation order** — exact step-by-step what to code first, second, third

### CONSTRAINTS
- Solo developer (me), so prefer simpler tools and managed services
- India-first market (Hindi + English UI eventually, English-first for now)
- Lean budget — prefer free/cheap tiers initially
- UI quality is non-negotiable
- Code maintainability > feature count

### OUTPUT FORMAT
Be detailed, execution-ready, and opinionated. Don't say "you could do X or Y" — pick one and justify why. Every recommendation should have:
- The recommendation itself
- Why this over alternatives
- Concrete next step

Avoid filler. No emojis. No generic SaaS advice. Treat me as a serious founder building a real product.

---

## PROMPT 2: UI DESIGN SYSTEM (run separately after Prompt 1)

You are a senior product designer who has worked at Linear, Stripe, and Vercel. You specialize in SaaS dashboards and consumer-facing food/commerce experiences.

I am building a white-label restaurant ordering SaaS. There are two distinct UI surfaces:

1. **Admin Dashboard** — used by restaurant owners to manage orders, menu, settings
2. **Customer Storefront** — used by end customers to browse menu and order food

Both must look premium, modern, and trustworthy.

### Give me the following:

**For Admin Dashboard:**
- Layout structure (sidebar nav vs top nav, justify choice)
- Color palette (3 options — describe mood + provide hex codes)
- Typography pairing (heading + body fonts from Google Fonts)
- Spacing and grid system
- Component styling — buttons, inputs, cards, tables, modals, toasts
- Empty state, loading state, error state design patterns
- Data visualization style (charts) — minimal, no junk
- 5 reference SaaS dashboards I should study (with what to learn from each)

**For Customer Storefront:**
- Layout for menu browsing (grid vs list — which converts better?)
- Hero section design pattern for restaurant landing
- Menu item card design (must showcase food photography)
- Cart drawer vs cart page (recommend one)
- Checkout flow — single page vs multi-step (recommend one)
- Order tracking screen design
- 5 reference food/D2C sites I should study

**Design System Tokens:**
Provide exact tokens I can paste into Tailwind config:
- Colors (primary, secondary, neutral scale 50-950, success, warning, error, info)
- Typography (font family, sizes from xs to 6xl, line heights, weights)
- Spacing scale
- Border radius scale
- Shadow scale (sm to 2xl)
- Animation timing functions

**Theme Customization Strategy:**
Each restaurant picks 1 of 4 themes + their brand color. Explain how to architect this so:
- Brand color cleanly cascades through the UI
- Themes are visually distinct but all professional
- Restaurant cannot break the design by choosing bad colors

Be specific. Give me copy-paste ready Tailwind config and CSS variable structure.

---

## PROMPT 3: MVP CODE GENERATION (run after Prompts 1 & 2)

Based on the architecture and design system from previous prompts, generate the foundational code for Week 1 of development:

1. **Next.js 14 project setup** with App Router, TypeScript, Tailwind, shadcn/ui
2. **Middleware for subdomain-based multi-tenant routing**
3. **Database schema** as Prisma `schema.prisma` file
4. **Auth setup** with email + OTP flow (using Clerk or custom)
5. **Restaurant signup form** with validation
6. **Restaurant dashboard layout** (sidebar + topbar + main content area)
7. **Empty state for "No orders yet"** with proper illustration placeholder
8. **One reusable component example** — `<OrderCard />` with all states (placed, preparing, ready, delivered, cancelled)
9. **README.md** with setup instructions and folder structure explained

Code should be:
- Production-ready quality
- Properly typed (no `any`)
- Commented where logic is non-obvious
- Following Next.js 14 best practices (server components by default)
- Accessible (proper semantic HTML, ARIA where needed)

---

## HOW TO USE THESE PROMPTS

1. Open Google AI Studio → choose Gemini 2.5 Pro (or latest reasoning model)
2. Run **Prompt 1** first → save the full output (this is your product bible)
3. Run **Prompt 2** in a new chat → save design system
4. Run **Prompt 3** when ready to start coding
5. For each new feature later, write a focused mini-prompt referencing your saved bible

**Pro tip:** Before running Prompt 1, add this line at the very top:
> "Take your time. Think deeply. I'd rather have one excellent answer than five rushed ones."

This dramatically improves output quality on Gemini reasoning models.

---

## PHASE 2 IDEAS (for later — don't build now)

- Multi-outlet support (one owner, multiple branches)
- Custom domain connection (Cloudflare for SaaS API)
- WhatsApp order notifications (via Meta Cloud API)
- Kitchen Display System (KDS) — separate tablet view for kitchen
- Delivery partner integration (Dunzo, Porter, or in-house riders)
- Loyalty program (points, referrals)
- Coupon/discount engine
- Inventory and recipe-based stock management
- Customer CRM with order history
- Multi-language UI (Hindi, regional languages)
- Advanced analytics (cohorts, retention, item profitability)
- POS integration for dine-in
- Table booking + QR code menu for dine-in

---

## NOTES FOR YOU

- Don't run all 3 prompts at once. Run, review, refine, then move to next.
- After Prompt 1's output, ask follow-up questions to clarify anything fuzzy.
- Save outputs in a dedicated Notion/Google Doc — this becomes your product bible.
- The roadmap will likely shift after Week 2 — that's normal. Adjust based on real user feedback from your first 5 restaurants.
