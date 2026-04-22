# BhojanSaaS

## Project Overview

White-label restaurant ordering SaaS for the Indian market. Think "Shopify for restaurants" — each restaurant signs up, sets up their business, and instantly gets their own branded ordering website (PWA-based).

- **Multi-tenant** SaaS, fully web-based PWA (no native app)
- **Subdomain routing**: `rajusweets.bhojan.in` per tenant (free plan)
- **Custom domains**: paid plan supports `rajusweets.com`
- Customer of a restaurant only sees that restaurant — no marketplace
- Solo founder building lean, scaling gradually

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict mode, no `any`) |
| Frontend | React 18 + Vite |
| Backend | Express server (`server.ts`) + Supabase Edge Functions where needed |
| Database | Supabase (PostgreSQL) |
| Auth | Custom OTP via MSG91 + JWT in httpOnly cookies (using `jose`) |
| Realtime | Supabase Realtime (Postgres WAL) |
| State (client) | Zustand with persist middleware |
| Styling | Tailwind CSS + shadcn/ui components |
| Cart Storage | localStorage via Zustand persist |
| File Storage | Supabase Storage (`menu-images` bucket) |
| Payments | Razorpay (planned, not yet integrated) |
| SMS/OTP | MSG91 |
| Routing | react-router-dom |
| Forms | react-hook-form + zod validation |

### Important Env Variables

```
VITE_SUPABASE_URL=https://hzyanbqypfrvdvpzviak.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
MSG91_AUTH_KEY=...
MSG91_TEMPLATE_ID=...
MSG91_SENDER_ID=...
JWT_SECRET=...
```

The `VITE_` prefix is mandatory for client-exposed variables (Vite requirement).

## Multi-Tenancy Strategy

- **Shared database, shared schema** approach with `tenant_id` column on all tenant-scoped tables
- Tenant resolved via Express middleware in `server.ts` from:
  1. Subdomain (`rajusweets.bhojan.in` → slug `rajusweets`)
  2. Custom domain (lookup `tenants.custom_domain`)
  3. Query param `?tenant=rajusweets` (dev only)
- Resolved `tenantId` available via `TenantProvider` (`src/lib/tenant.tsx`)
- All Supabase queries MUST include `WHERE tenant_id = current_tenant_id`
- Supabase RLS policies enforce isolation at DB level as defense-in-depth

## Database Schema (Implemented)

```sql
tenants            id, slug, custom_domain, name, logo_url, brand_config (jsonb), gstin, status, created_at
users              id, tenant_id, phone (unique), email, role (owner|manager|kitchen), is_active, created_at
menu_categories    id, tenant_id, name, sort_order
menu_items         id, tenant_id, category_id, name, description, price, image_url, is_veg, is_in_stock, is_bestseller, created_at
orders             id, tenant_id, customer_name, customer_phone, address, total_amount, status, payment_status, payment_method, created_at
order_items        id, order_id, item_id, quantity, unit_price, subtotal (generated), notes
addresses          id, tenant_id, customer_phone, label, address_line, landmark, pincode, city, state, latitude, longitude, is_default, created_at
```

### Order Status Pipeline
`placed` → `accepted` → `preparing` → `ready` → `out_for_delivery` → `delivered` (or `cancelled` at any point)

### Migrations Location
`supabase/migrations/` — use `supabase db push` to apply.

## Folder Structure

```
src/
  App.tsx                       # Router + ProtectedRoute setup
  main.tsx
  index.css                     # Tailwind + design tokens
  lib/
    supabase.ts                 # Supabase client (lazy init)
    tenant.tsx                  # TenantProvider context
    menu.ts                     # Menu CRUD + image upload helpers
    dashboardStore.ts           # Zustand store for dashboard
    utils.ts                    # cn() helper, formatters
  components/
    ui/                         # shadcn primitives (Button, Input, Sheet, etc.)
    shared/                     # Layout, Sidebar, Topbar
    merchant/                   # Owner-side components
    customer/                   # Storefront components
  pages/
    Auth/Login.tsx
    Onboarding.tsx
    Admin/Dashboard.tsx
    Admin/MenuBuilder.tsx
    Storefront/Storefront.tsx
server.ts                       # Express server (auth, tenant resolution, APIs)
supabase/migrations/            # SQL migration files
```

## Design System

**Color palette (Graphite — Option C)**: warm neutrals that pair with food photography.
- Background: `#F5F5F4`
- Primary: `#1C1917`
- Border: `#E7E5E4`
- Brand color: dynamic per tenant (defaults to indigo, applied via CSS variable `--primary`)
- Use `getContrastColor()` utility to auto-determine button text color based on tenant brand color

**Typography**:
- Display: Instrument Serif (italic for emphasis)
- Body: Instrument Sans / Inter

**Tokens**: 8pt spacing grid, border radius scale (4/8/12/16/24px), 3-tier shadow scale (subtle/premium/float).

**Themes**: 4 storefront themes (Minimalist, Industrial, Elegant, Bold) — selected during onboarding, stored in `tenants.brand_config.theme`.

## What's Built (as of last session)

- [x] Supabase setup + initial schema migration
- [x] Multi-tenant routing via Express middleware + TenantProvider
- [x] Auth: OTP via MSG91 (with dev mode `000000` skip OTP for `Raju Sweets`), JWT in httpOnly cookies
- [x] Owner Onboarding wizard (4 steps: Profile → Address → Branding → Theme)
- [x] Admin Dashboard with live stats (revenue, orders, avg ticket, completion rate) wired to Supabase
- [x] Live order feed with realtime sync via Supabase Realtime
- [x] Order status update dropdown on each order card
- [x] "Seed Sample Data" button for dev testing
- [x] Menu Builder at `/menu`: categories CRUD with drag reorder, items CRUD with image upload to `menu-images` bucket, optimistic updates, validation
- [x] Customer Storefront wired to live menu data: tenant filter, in-stock filter, category grouping, Featured Dishes from bestsellers
- [x] Storefront UI v2: hero with CTAs + delivery info strip, premium menu cards with quantity stepper, About/Reviews/Visit sections, footer, mobile sticky cart bar
- [x] Protected routes (dashboard, menu, settings) — redirect to /login if no JWT

## What's Pending

### Next Up: Cart + Checkout + Order Tracking
- Cart store with Zustand + localStorage persist, cross-tenant guard
- `/checkout` page: accordion multi-step (Contact → Address → Summary → Payment)
- COD-only for now (Razorpay later)
- Server-side stock + price validation before order insert
- Sequential `order_number` (ORD-XXXX per tenant)
- `/order/:id` confirmation page with live status tracker (Realtime subscription)
- `/my-orders` page for customer order history with reorder button
- Owner notification: browser notification + ding sound on new order arrival

### After That
- [ ] Razorpay integration (UPI, cards, netbanking) + webhook handler with idempotency
- [ ] WhatsApp notifications via Meta Cloud API (order placed, status updates)
- [ ] SMS notifications via MSG91 templates
- [ ] Multi-outlet support (one owner, multiple branches)
- [ ] Custom domain connection (Vercel Domains API or Cloudflare for SaaS)
- [ ] Analytics page (cohorts, top items, repeat rate)
- [ ] Loyalty program (points, referrals)
- [ ] Coupon/discount engine
- [ ] PWA manifest per tenant
- [ ] Hindi + regional language UI

## Coding Conventions

- **TypeScript strict** — no `any`, define interfaces for all data shapes
- **Server components by default** for Next-style patterns; client components only when needed (state, effects, browser APIs)
- **Optimistic updates** for all mutations — instant UI change, then sync to DB, rollback on error
- **Skeleton loaders** for all async fetches (no blank screens, no full-page spinners)
- **Toast notifications** for all user actions: success, error, info — using `sonner`
- **Form validation** via zod schemas + react-hook-form
- **Error boundaries** around major route segments
- **No `console.log`** in committed code — use proper error tracking
- **Mobile-first** — design for 375px width, scale up

## Security Rules (Non-negotiable)

1. **Every Supabase query** must include `WHERE tenant_id = current_tenant_id` AT THE QUERY LEVEL
2. **Supabase RLS policies** enforce same isolation at DB level (defense-in-depth)
3. **Never trust client-side prices** — always re-validate on server before order insert
4. **Rate limit** OTP endpoint (max 5 per phone per hour) and order creation (max 5 per phone per minute)
5. **Validate all inputs** with zod
6. **JWT in httpOnly cookies only** — never accessible to JavaScript
7. **Never use Supabase service role key on client** — only `publishable`/`anon` key

## Pricing Model (Reference)

- **Free Starter**: 5% per order commission, platform subdomain, 50 menu items max
- **Standard ₹1,499/mo**: 0% platform fee, custom domain, unlimited items, 2 staff accounts
- **Pro ₹3,999/mo**: Advanced analytics, SMS marketing, loyalty engine, 10 staff accounts

## Common Commands

```bash
# Dev server
npm run dev

# Build + typecheck
npm run build

# Apply Supabase migrations
supabase db push

# Generate types from Supabase schema
supabase gen types typescript --linked > src/lib/database.types.ts

# Lint
npm run lint
```

## Working with Claude Code on This Project

When asked to add a feature:
1. Check this CLAUDE.md for relevant context (architecture, patterns)
2. Read the existing files for the affected module before writing new code
3. Follow the security rules — every query needs `tenant_id` filter
4. Add a migration file if schema changes are needed
5. Update this CLAUDE.md's "What's Built" section after completion

When debugging:
1. Check browser console + network tab first
2. Check Supabase logs (Dashboard → Logs)
3. Check `server.ts` logs in terminal
4. Verify env variables are set correctly with `VITE_` prefix where required
