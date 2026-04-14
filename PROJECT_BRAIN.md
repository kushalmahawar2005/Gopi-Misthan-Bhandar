# PROJECT BRAIN: Gopi Misthan Bhandar eCommerce

A comprehensive technical and functional documentation of the Gopi Misthan Bhandar Next.js 14 eCommerce application.

---

## 1. PROJECT OVERVIEW
- **Project Name:** Gopi Misthan Bhandar
- **Purpose:** Premium sweets and savories eCommerce platform with integrated shipping, payments, and gift box customization.
- **Target Audience:** Premium food enthusiasts, NRIs, and gift seekers in India.
- **Tech Stack:**
  * **Framework:** Next.js 14 (App Router)
  * **Language:** TypeScript
  * **Database:** MongoDB (Atlas) with Mongoose
  * **Styling:** Tailwind CSS, CSS Modules
  * **Animations:** GSAP, Framer Motion, Intersection Observer
  * **Auth:** NextAuth (Google OAuth) + Custom JWT
  * **Payments:** Razorpay
  * **Shipping:** NimbusPost
  * **Storage:** Cloudinary
  * **Email:** Nodemailer (SMTP)
  * **SMS:** Twilio

### Environment Variables
| Variable | Purpose |
| :--- | :--- |
| `MONGODB_URI` | Connection string for MongoDB Atlas. |
| `NEXTAUTH_SECRET` | Secret key for signing NextAuth sessions. |
| `NEXTAUTH_URL` | Base URL for authentication callbacks. |
| `GOOGLE_CLIENT_ID` | OAuth Client ID for Google Login. |
| `GOOGLE_CLIENT_SECRET` | OAuth Secret for Google Login. |
| `RAZORPAY_KEY_ID` | Public Key for Razorpay checkout. |
| `RAZORPAY_KEY_SECRET` | Secret Key for Razorpay API. |
| `RAZORPAY_WEBHOOK_SECRET` | Secret for verifying incoming payment webhooks. |
| `NIMBUSPOST_CLIENT_ID` | Identity for NimbusPost shipping API. |
| `NIMBUSPOST_API_KEY` | API Key for NimbusPost. |
| `NIMBUSPOST_BASE_URL` | Base URL for NimbusPost API calls. |
| `CLOUDINARY_API_KEY` | Key for Cloudinary media uploads. |
| `CLOUDINARY_API_SECRET` | Secret for Cloudinary media uploads. |
| `SMTP_HOST` / `PORT` / `USER` / `PASSWORD` | Credentials for automated emails. |
| `TWILIO_ACCOUNT_SID` / `AUTH_TOKEN` | Credentials for SMS status updates. |
| `CRON_SECRET` | Secret for Vercel Cron jobs. |
| `SENDER_*` | Shop identity for shipping labels (Name, Phone, Address, Pincode). |

---

## 2. FOLDER STRUCTURE

- `app/`: Next.js 14 App Router routes (Pages & API).
  - `admin/`: Admin Dashboard protected by middleware.
  - `api/`: Backend API routes.
  - `checkout/`: Payment and shipping selection.
- `components/`: Modular UI components.
  - `sections/`: High-level page sections (Hero, Featured, Instagram, etc.).
- `lib/`: Business logic, third-party wrappers, and shared utilities.
  - `auth.ts`: Authentication helpers (requireAdmin).
  - `nimbuspost.ts`: Shipping API interaction logic.
  - `razorpay.ts`: Payment gateway logic.
  - `jwt.ts`: Custom token generation/verification.
- `models/`: Mongoose schemas and TypeScript interfaces.
- `public/`: Static assets (Lottie files, icons, logos).
- `scripts/`: Manual maintenance scripts.

---

## 3. DATABASE SCHEMA (Mongoose Models)

### **Product Model**
- **Fields:** `name`, `description`, `price`, `image`, `images` (array), `category`, `subcategory`, `featured`, `isPremium`, `stock`, `shelfLife`.
- **Relationship:** Belongs to a Category/Subcategory.

### **Order Model**
- **Fields:** `orderNumber`, `userId`, `items` (Product reference, qty, price), `total`, `status` (pending, confirmed, shipped, delivered, expired), `shipping` (Address object), `paymentId`, `awbNumber`, `courierName`.
- **Relationship:** references `User`.

### **User Model**
- **Fields:** `name`, `email`, `password`, `role` (user/admin), `phone`, `addresses` (array).

### **Coupon Model**
- **Fields:** `code` (UPPERCASE), `discountType` (fixed/percentage), `value`, `expiryDate`, `minOrderAmount`, `isActive`.

### **Other Models:**
- `Blog`, `Category`, `Gallery`, `HeroSlider`, `InstaBook`, `Review`, `SiteContent`, `WeddingEnquiry`.

---

## 4. ALL API ROUTES

| Route | Method | Description | Auth |
| :--- | :--- | :--- | :--- |
| `/api/products` | GET | List all products. | No |
| `/api/products` | POST | Create new product. | Admin |
| `/api/products/[id]` | PUT/DELETE | Update or delete product. | Admin |
| `/api/payment/create-order` | POST | Create Razorpay order & pending Order in DB. | No |
| `/api/payment/verify` | POST | Verify signature after payment. | No |
| `/api/payment/webhook` | POST | Async payment success/failed updates. | No* (Signature) |
| `/api/delivery/create-shipment`| POST | Trigger NimbusPost shipment. | Admin |
| `/api/cron/cleanup-orders` | GET | Cleanup expired pending orders. | No* (Cron Secret) |
| `/api/users` | GET | List all registered users. | Admin |

---

## 5. FRONTEND PAGES

- **Home (`/`):** Dynamic sections for Hero, Featured, Categories, Reviews.
- **Shop (`/products`):** Grid of all products with filtering.
- **Product Details (`/product/[id]`):** Details, size selection, and stock status.
- **Admin Dashboard (`/admin`):** Analytics, Order Management, Product Catalog.
- **Checkout (`/checkout`):** Multi-step form for address → shipping → payment.
- **Profile (`/profile`):** User order history and address management.

---

## 6. COMPONENTS LIBRARY

- `Header.tsx`: Sticky navigation with cart counter.
- `Cart.tsx`: Sliding drawer for cart management.
- `HeroSection.tsx`: GSAP-powered animated slides.
- `ProductCard.tsx`: Display card with hover effects and "Quick Add".
- `SmoothScroll.tsx`: Lenis-based smooth scrolling wrapper.
- `requireAdmin`: Auth wrapper for protected pages/APIs.

---

## 7. INTEGRATIONS

### **Razorpay Flow**
1. User clicks "Pay Now".
2. API creates Order in Razorpay & DB.
3. Razorpay SDK opens on Client.
4. Success callback hits `/api/payment/verify`.
5. DB Order updated to `confirmed`.

### **NimbusPost Flow**
1. Admin triggers "Create Shipment" from Dashboard.
2. API validates Pincode with NimbusPost.
3. API creates shipment and retrieves AWB number.
4. DB Order updated with AWB and status `shipped`.

---

## 8. BUSINESS LOGIC

### **Checkout Flow**
1. Add items to Cart (Client State).
2. Enter Delivery Details.
3. Apply Coupons (Server Validation).
4. Select Shipping Mode.
5. Create Order → Pay → Confirm.

### **Order Lifecycle**
- `pending`: Created but payment not successful.
- `confirmed`: Payment verified.
- `processing`: Warehouse preparing order.
- `shipped`: Handed over to courier (AWB generated).
- `delivered`: Shipment reached customer.
- `expired`: Pending for >30 mins (Cron cleanup).

---

## 9. SECURITY LAYER

- **middleware.ts**: Protects `/admin/*` and management API paths.
- **requireAdmin()**: Server-side helper that checks NextAuth session role OR custom JWT token role.
- **Webhook Security**: Verifies `x-razorpay-signature` using HMAC SHA256.
- **Stock Guard**: Inventory is deducted only after a successful payment webhook or verification.

---

## 10. PRODUCTION READINESS CHECKLIST

- [x] Secure sensitive management API routes.
- [x] Implement Failed Order cleanup (restore stock).
- [x] Environment variable protection (Vercel).
- [ ] Add `TWILIO` credentials for live SMS status.
- [ ] Implement Vercel Cron Secret in settings.
- [ ] Final end-to-end testing of webhook flow.
