'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProductById, fetchProducts } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiHeart,
  FiTruck,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiChevronDown,
  FiStar,
} from 'react-icons/fi';
import { Product } from '@/types';

type LightweightProduct = Pick<Product, 'id' | 'name' | 'price' | 'image' | 'category' | 'images'>;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<LightweightProduct[]>([]);
  const [openAccordion, setOpenAccordion] = useState<string | null>('Description');
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);
  
  // Size selection state
  const [selectedSize, setSelectedSize] = useState<{ weight: string; price: number; label?: string } | null>(null);
  
  // Get all product images (main image + additional images)
  const getAllImages = () => {
    if (!product) return [];
    const images = [product.image];
    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    }
    return images;
  };
  
  const productImages = getAllImages();
  const currentImage = productImages[selectedImageIndex] || product?.image;
  
  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (showReviews) {
      reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showReviews]);

useEffect(() => {
  if (!product) return;
  if (typeof window === 'undefined') return;

  try {
    const storageKey = 'recentlyViewedProducts';
    const storedRaw = window.localStorage.getItem(storageKey);
    let stored: LightweightProduct[] = storedRaw ? JSON.parse(storedRaw) : [];

    stored = stored.filter((item) => item.id !== product.id);

    const newEntry: LightweightProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      images: product.images || [],
    };

    const updated = [newEntry, ...stored].slice(0, 8);
    window.localStorage.setItem(storageKey, JSON.stringify(updated));

    setRecentlyViewed(updated.filter((item) => item.id !== product.id));
  } catch (error) {
    console.error('Error updating recently viewed products:', error);
  }
}, [product]);

  const loadProduct = async () => {
    try {
      const productData = await fetchProductById(productId);
      if (productData) {
        setProduct(productData);
        // Initialize selected size
        if (productData.sizes && productData.sizes.length > 0) {
          const defaultSize = productData.sizes.find(s => s.weight === productData.defaultWeight) || productData.sizes[0];
          setSelectedSize(defaultSize);
        }
        // Load related products
        const related = await fetchProducts({ category: productData.category, limit: 4 });
        setRelatedProducts(related.filter(p => p.id !== productData.id).slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = product ? isInWishlist(product.id) : false;
  
  // Calculate current price based on selected size
  const currentPrice = selectedSize ? selectedSize.price : (product?.price || 0);
  const displayWeight = selectedSize ? selectedSize.weight : (product?.defaultWeight || '500g');

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <Navigation />
        <Cart />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <Navigation />
        <Cart />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-3xl font-bold font-general-sansal-sansal-sans mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="bg-primary-red text-white px-6 py-3 rounded-lg font-bold font-general-sansal-sansal-sans hover:bg-primary-darkRed transition-colors"
          >
            Go Back Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const createProductPayload = () => {
    if (!product) return null;
    return {
      ...product,
      price: currentPrice,
      selectedSize: selectedSize?.weight,
    };
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    const productWithSize = createProductPayload();
    if (!productWithSize) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(productWithSize, 1);
    }
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleBuyNow = () => {
    if (product?.stock !== undefined && product.stock === 0) return;
    setIsBuying(true);
    const productWithSize = createProductPayload();
    if (!productWithSize) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(productWithSize, 1);
    }
    router.push('/checkout');
    setTimeout(() => setIsBuying(false), 500);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleSizeChange = (size: { weight: string; price: number; label?: string }) => {
    setSelectedSize(size);
  };

  const handleWishlistToggle = () => {
    if (isFavorite) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

const availabilityText =
  product.stock !== undefined
    ? product.stock > 0
      ? `${product.stock} in stock`
      : 'Currently unavailable'
    : 'Available on request';

const infoItems = [
  {
    title: 'Availability',
    description: availabilityText,
    icon: <FiCheckCircle className="w-5 h-5 text-green-500" />,
  },
  {
    title: 'Delivery',
    description: product.deliveryTime || 'Delivery within 2-3 business days',
    icon: <FiTruck className="w-5 h-5 text-primary-brown" />,
  },
  {
    title: 'Shelf Life',
    description: product.shelfLife || 'Enjoy fresh goodies with optimal taste',
    icon: <FiClock className="w-5 h-5 text-primary-brown" />,
  },
  {
    title: 'Packaging Disclaimer',
    description: 'Final box design depends on stock availability at the time of dispatch.',
    icon: <FiPackage className="w-5 h-5 text-primary-brown" />,
  },
];

const accordionItems = [
  {
    key: 'Description',
    title: 'Description',
    content: (
      <p className="leading-relaxed text-gray-600">
        {product.description || 'Delightful gourmet sweets crafted with premium ingredients.'}
      </p>
    ),
  },
  {
    key: 'RefundPolicy',
    title: 'Refund & Cancellation Policy',
    content: (
      <p className="leading-relaxed text-gray-600">
        Due to the perishable nature of our sweets, cancellations are accepted within 2 hours of placing the order.
        For concerns about your delivery, please reach out to our support team the same day with images and order
        details.
      </p>
    ),
  },
  {
    key: 'Terms',
    title: 'Terms & Conditions',
    content: (
      <p className="leading-relaxed text-gray-600">
        All orders are subject to availability. Delivery timelines may vary based on pin code. By placing an order,
        you agree to our privacy policy and terms of service available on the website.
      </p>
    ),
  },
];

const renderProductTile = (item: Product | LightweightProduct) => {
  const cardImage = item.images && item.images.length > 0 ? item.images[0] : item.image;
  return (
    <Link
      key={item.id}
      href={`/product/${item.id}`}
      className="group h-full rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative w-full aspect-square overflow-hidden rounded-t-xl bg-gray-50">
        <Image
          src={cardImage && cardImage.trim() !== '' ? cardImage : item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
        <p className="text-sm uppercase tracking-wide text-primary-brown">
          {item.category.replace(/-/g, ' ')}
        </p>
        <p className="text-lg font-bold text-primary-red">₹{item.price.toLocaleString()}</p>
      </div>
    </Link>
  );
};

const shortDescription =
  product.description && product.description.length > 180
    ? `${product.description.slice(0, 180)}...`
    : product.description || 'Handcrafted sweets made with premium ingredients.';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 px-4">
        <div className="w-full">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary-red transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-600 hover:text-primary-red transition-colors">
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={`/category/${product.category}`}
              className="text-gray-600 hover:text-primary-red transition-colors capitalize"
            >
              {product.category}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="w-full px-4 py-6 sm:py-8 md:py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8 lg:grid lg:grid-cols-[1.1fr,1fr] lg:gap-10">
          {/* Product Images Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:aspect-[5/4] lg:aspect-[4/3]">
              <Image
                src={currentImage || product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500"
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>

            {productImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square w-full overflow-hidden rounded-xl border-2 transition ${
                      selectedImageIndex === index
                        ? 'border-primary-red ring-2 ring-primary-red ring-offset-2'
                        : 'border-gray-200 hover:border-primary-red'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - View ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 20vw, 12vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-brown">
                  Gopi Misthan Collection
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm leading-relaxed text-gray-600">{shortDescription}</p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">₹{currentPrice.toLocaleString()}</span>
                  {selectedSize && (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium uppercase text-primary-red">
                      {displayWeight}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Subtotal: ₹{(currentPrice * quantity).toLocaleString()}
                </p>
              </div>

              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Select Size / Weight</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSizeChange(size)}
                        className={`rounded-lg border-2 px-4 py-3 text-left transition ${
                          selectedSize?.weight === size.weight
                            ? 'border-primary-red bg-red-50 text-primary-red'
                            : 'border-gray-300 hover:border-primary-red hover:text-primary-red'
                        }`}
                      >
                        <div className="font-medium">{size.weight}</div>
                        <div className="text-sm">₹{size.price.toLocaleString()}</div>
                        {size.label && <div className="text-xs text-gray-500">{size.label}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <FiMinus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-xl font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={quantity >= 10}
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`ml-auto rounded-lg border-2 p-2 transition ${
                      isFavorite
                        ? 'border-primary-red bg-red-50 text-primary-red'
                        : 'border-gray-300 text-gray-700 hover:border-primary-red hover:text-primary-red'
                    }`}
                    title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || (product.stock !== undefined && product.stock === 0)}
                  className="flex-1 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isBuying || (product.stock !== undefined && product.stock === 0)}
                  className="flex-1 rounded-lg bg-primary-red px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-primary-darkRed disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBuying ? 'Redirecting...' : 'Buy It Now'}
                </button>
              </div>

              <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-gray-900">Category:</span>{' '}
                  <span className="capitalize">{product.category.replace(/-/g, ' ')}</span>
                </p>
                {product.stock !== undefined && (
                  <p>
                    <span className="font-semibold text-gray-900">Stock:</span>{' '}
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </p>
                )}
                {product.deliveryTime && (
                  <p>
                    <span className="font-semibold text-gray-900">Delivery:</span> {product.deliveryTime}
                  </p>
                )}
                {product.shelfLife && (
                  <p>
                    <span className="font-semibold text-gray-900">Shelf Life:</span> {product.shelfLife}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                {infoItems.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-inner">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {accordionItems.map((item) => (
                <div key={item.key} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === item.key ? null : item.key)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left text-lg font-semibold text-gray-900"
                  >
                    <span>{item.title}</span>
                    <FiChevronDown
                      className={`h-5 w-5 transition-transform ${openAccordion === item.key ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openAccordion === item.key && <div className="px-6 pb-6 text-sm text-gray-600">{item.content}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      <div className="w-full px-4 pb-4 md:pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-general-sansal-sansal-sans text-primary-brown">Reviews & Ratings</h2>
            <p className="text-sm text-gray-500">Click below to read experiences or share your own.</p>
          </div>
          <button
            onClick={() => setShowReviews((prev) => !prev)}
            className="self-start sm:self-auto px-5 py-2 border border-primary-red text-primary-red rounded-lg font-semibold uppercase tracking-wide hover:bg-primary-red hover:text-white transition-colors text-sm"
          >
            {showReviews ? 'Close Reviews' : 'Write a Review'}
          </button>
        </div>
      </div>
      {showReviews && (
        <div ref={reviewSectionRef} className="w-full px-4 pb-8 md:pb-12">
          <div className="max-w-7xl mx-auto">
            <ProductReviews productId={productId} />
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="w-full px-4 py-8 md:py-12 bg-gray-50">
          <h2 className="text-2xl md:text-3xl font-bold font-general-sansal-sansal-sans text-primary-brown mb-8 text-center">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
