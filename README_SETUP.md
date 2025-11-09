# Gopi Misthan Bhandar - Setup Guide

## MongoDB Setup

1. **Create MongoDB Atlas Account** (Free tier available)
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string

2. **Configure Environment Variables**
   - Create a `.env.local` file in the root directory
   - Add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
   ```

3. **Cloudinary Setup** (for image uploads)
   - Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
   - Go to Dashboard and copy your credentials
   - Add to `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Dashboard

1. **Create Admin User**
   - Register a new user through the registration page
   - Run the script to update user role:
     ```bash
     npm run update-admin
     ```
   - Or manually update in MongoDB:
     ```javascript
     db.users.updateOne(
       { email: "admin@example.com" },
       { $set: { role: "admin" } }
     )
     ```

2. **Create Categories**
   - Run the script to create all categories (including Classic Sweets and Premium Sweets):
     ```bash
     npm run create-categories
     ```
   - Or manually create categories through Admin Panel → Categories

3. **Access Admin Dashboard**
   - Login with admin credentials
   - Navigate to `/admin`

## API Routes

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/[id]` - Get single category
- `GET /api/categories/slug/[slug]` - Get category by slug
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/[id]` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/[id]` - Update order
- `DELETE /api/orders/[id]` - Delete order

### Users
- `GET /api/users` - Get all users
- `GET /api/users/[id]` - Get single user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Upload
- `POST /api/upload` - Upload image/video to Cloudinary

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables:
     - `MONGODB_URI`
     - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
   - Deploy

## Features

- ✅ MongoDB Integration
- ✅ Full CRUD Operations for Products, Categories, Orders, Users
- ✅ Admin Dashboard
- ✅ Authentication System (JWT)
- ✅ Order Management
- ✅ User Management
- ✅ Product Management
- ✅ Category Management
- ✅ Cloudinary Image Upload (Drag & Drop)
- ✅ Hero Slider Management
- ✅ InstaBook & InstaPost Management

## Notes

- The frontend still uses some mock data for initial display
- To fully integrate, update frontend components to fetch from API
- Admin routes are protected (check for admin role)
- Orders are automatically assigned order numbers

