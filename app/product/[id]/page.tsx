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
import { ProductDetailSkeleton } from '@/components/SkeletonLoaders';
import {
  FiMinus,
  FiPlus,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiShare2,
  FiFacebook,
  FiTwitter,
} from 'react-icons/fi';
import { Product } from '@/types';

type LightweightProduct = Pick<Product, 'id' | 'slug' | 'name' | 'price' | 'image' | 'category' | 'images'>;

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
  const [imageAspectMap, setImageAspectMap] = useState<Record<string, number>>({});
  const [recentlyViewed, setRecentlyViewed] = useState<LightweightProduct[]>([]);
  const [openAccordion, setOpenAccordion] = useState<string | null>('Description');
  const [reviewStats, setReviewStats] = useState<{ averageRating: number; totalReviews: number }>({
    averageRating: 0,
    totalReviews: 0,
  });
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);

  // Size selection state
  const [selectedSize, setSelectedSize] = useState<{ weight: string; price: number; label?: string } | null>(null);

  // Slider State
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

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
  const activeImageAspectRatio = currentImage ? imageAspectMap[currentImage] || 1 : 1;

  const handleImageLoad = (imageUrl: string, width: number, height: number) => {
    if (!imageUrl || width <= 0 || height <= 0) return;

    const aspectRatio = width / height;
    if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) return;

    setImageAspectMap((prev) => {
      if (prev[imageUrl] === aspectRatio) return prev;
      return { ...prev, [imageUrl]: aspectRatio };
    });
  };

  // Slider Handlers
  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Touch Handlers for Swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleNextImage();
    if (isRightSwipe) handlePrevImage();
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/reviews?productId=${productId}&approved=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.stats) {
          setReviewStats({
            averageRating: data.stats.averageRating || 0,
            totalReviews: data.stats.totalReviews || 0,
          });
        }
      })
      .catch(() => {});
  }, [productId]);

  const scrollToReviews = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!product) return;

    // Prefetch related product images to make navigation faster
    if (relatedProducts.length > 0) {
      relatedProducts.forEach(p => {
        if (p.image) {
          const img = new window.Image();
          img.src = p.image;
        }
      });
    }

    if (typeof window === 'undefined') return;

    try {
      const storageKey = 'recentlyViewedProducts';
      const storedRaw = window.localStorage.getItem(storageKey);
      let stored: LightweightProduct[] = storedRaw ? JSON.parse(storedRaw) : [];

      stored = stored.filter((item) => item.id !== product.id);

      const newEntry: LightweightProduct = {
        id: product.id,
        slug: product.slug,
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
        const relatedResp = await fetchProducts({ category: productData.category, limit: 8 });
        const related = Array.isArray(relatedResp) ? relatedResp : relatedResp.products;
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
      <div className="min-h-screen bg-white pt-24 pb-12">
        <Header />
        <Navigation />
        <Cart />
        <ProductDetailSkeleton />
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
    const selectedWeight = selectedSize?.weight;
    return {
      ...product,
      price: currentPrice,
      selectedSize: selectedWeight,
      selectedWeight,
      defaultWeight: selectedWeight || product.defaultWeight,
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

  const priceRange = (() => {
    if (!product.sizes || product.sizes.length === 0) return null;
    const prices = product.sizes.map((s) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? null : { min, max };
  })();

  const sku = `GMB-${product.id.slice(-8).toUpperCase()}`;

  const accordionItems = [
    {
      key: 'Description',
      title: 'Description',
      content: (
        <p className="leading-relaxed text-[#6f5d4e]">
          {product.description || 'Delightful gourmet sweets crafted with premium ingredients.'}
        </p>
      ),
    },
    {
      key: 'AdditionalInfo',
      title: 'Additional Information',
      content: (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-[#6f5d4e] sm:grid-cols-2">
          {product.shelfLife && (
            <div className="flex justify-between border-b border-[#f0e5d8] py-1.5">
              <dt className="font-medium text-[#3f3228]">Shelf Life</dt>
              <dd>{product.shelfLife}</dd>
            </div>
          )}
          {product.deliveryTime && (
            <div className="flex justify-between border-b border-[#f0e5d8] py-1.5">
              <dt className="font-medium text-[#3f3228]">Delivery</dt>
              <dd>{product.deliveryTime}</dd>
            </div>
          )}
          <div className="flex justify-between border-b border-[#f0e5d8] py-1.5">
            <dt className="font-medium text-[#3f3228]">Availability</dt>
            <dd>
              {product.stock !== undefined && product.stock > 0
                ? `${product.stock} in stock`
                : product.stock === 0
                  ? 'Currently unavailable'
                  : 'Available on request'}
            </dd>
          </div>
          <div className="flex justify-between border-b border-[#f0e5d8] py-1.5 capitalize">
            <dt className="font-medium text-[#3f3228]">Category</dt>
            <dd>{product.category}</dd>
          </div>
          {product.defaultWeight && (
            <div className="flex justify-between border-b border-[#f0e5d8] py-1.5">
              <dt className="font-medium text-[#3f3228]">Default Weight</dt>
              <dd>{product.defaultWeight}</dd>
            </div>
          )}
        </dl>
      ),
    },
    {
      key: 'Shipping',
      title: 'Shipping & Storage',
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-[#6f5d4e]">
          <p>
            Same-day dispatch from our Jaipur kitchen for orders placed before 2 PM. Pan-India delivery
            via trusted partners — expected transit time is{' '}
            <span className="font-medium text-[#3f3228]">{product.deliveryTime || '3-5 working days'}</span>.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>All sweets are packed fresh in food-grade, tamper-evident boxes.</li>
            <li>Final box design may vary based on stock availability at the time of dispatch.</li>
            <li>
              Store in a cool, dry place. Best consumed within{' '}
              <span className="font-medium text-[#3f3228]">{product.shelfLife || '5-7 days'}</span> of
              delivery for optimal taste and freshness.
            </li>
            <li>Self-pickup available at SL Marg, Chandrakala Colony, Durgapura — usually ready in 24 hours.</li>
          </ul>
        </div>
      ),
    },
    {
      key: 'RefundPolicy',
      title: 'Refund & Cancellation Policy',
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-[#6f5d4e]">
          <p>
            As our products are perishable food items prepared fresh on order, we follow a strict
            no-return policy. However, your satisfaction is our priority.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="font-medium text-[#3f3228]">Cancellations:</span> Orders can be cancelled
              free of cost within 2 hours of placement, provided dispatch has not started.
            </li>
            <li>
              <span className="font-medium text-[#3f3228]">Damaged / Wrong Item:</span> If the product
              arrives damaged or incorrect, share unboxing photos within 24 hours of delivery for a
              full refund or replacement.
            </li>
            <li>
              <span className="font-medium text-[#3f3228]">Refund Timeline:</span> Approved refunds
              are processed within 5-7 business days to the original payment method.
            </li>
            <li>
              Refunds are not applicable for taste preferences or delays caused by incorrect
              addresses, courier issues, or unavailability of the recipient.
            </li>
          </ul>
          <p>
            For any concerns, reach out via WhatsApp or email — we&apos;re here to help.
          </p>
        </div>
      ),
    },
    {
      key: 'Terms',
      title: 'Terms & Conditions',
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-[#6f5d4e]">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              All prices are inclusive of applicable taxes. GST invoice is provided with every order
              on request.
            </li>
            <li>
              Product weight mentioned is the gross packed weight, including standard packaging.
              Minor variation of ±5% may occur in handcrafted items.
            </li>
            <li>
              Images on the website are for representation purposes only. Actual product colour,
              shape, or garnish may vary slightly based on seasonal ingredients.
            </li>
            <li>
              Delivery is subject to serviceable pincodes. Estimated delivery dates are indicative
              and may shift due to weather, festivals, or courier delays.
            </li>
            <li>
              By placing an order, you confirm that the recipient is available to receive the parcel
              at the provided address.
            </li>
            <li>
              Gopi Misthan Bhandar reserves the right to refuse or cancel any order at its sole
              discretion, with a full refund initiated for the cancelled order.
            </li>
          </ul>
        </div>
      ),
    },
  ];

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
              href={`/products?category=${product.category}`}
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
      <section className="px-4 py-6 sm:py-8 md:py-10">
        <div className="mx-auto grid w-full max-w-7xl items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[1.02fr,0.98fr] md:gap-8 lg:gap-10">
          {/* Product Images Gallery */}
          <div className="h-fit animate-[fadeInUp_0.55s_ease-out]">
            <div className="grid gap-3 md:grid-cols-[88px,1fr]">
              {productImages.length > 1 && (
                <div className="hidden max-h-[560px] flex-col gap-3 overflow-y-auto pr-1 md:flex no-scrollbar">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-[88px] w-full overflow-hidden rounded-xl border-2 transition ${selectedImageIndex === index
                        ? 'border-[#b58a3a] shadow-[0_0_0_2px_rgba(181,138,58,0.18)]'
                        : 'border-[#e6d8c7] hover:border-[#c99c53]'
                        }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - View ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="90px"
                      />
                    </button>
                  ))}
                </div>
              )}

              <style>{`
                .product-image-container { aspect-ratio: 1 / 1; }
                @media (min-width: 768px) {
                  .product-image-container { aspect-ratio: ${activeImageAspectRatio}; }
                }
              `}</style>
              <div
                className="group relative w-full overflow-hidden rounded-2xl border border-[#e6d8c7] bg-white product-image-container"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <Image
                  src={currentImage || product.image}
                  alt={product.name}
                  fill
                  className="object-contain"
                  onLoadingComplete={(img) =>
                    handleImageLoad(currentImage || product.image, img.naturalWidth, img.naturalHeight)
                  }
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />

                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-2 text-gray-800 shadow-md transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <FiChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-2 text-gray-800 shadow-md transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <FiChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
                      {selectedImageIndex + 1} / {productImages.length}
                    </div>
                  </>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="mt-1 flex gap-2 overflow-x-auto pb-1 md:hidden no-scrollbar">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-lg border-2 transition ${selectedImageIndex === index ? 'border-[#b58a3a]' : 'border-[#e6d8c7]'
                        }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} mobile view ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="70px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="h-fit animate-[fadeInUp_0.65s_ease-out]">
            <div className="space-y-5">
              {/* Title + wishlist */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-['FlamaCondensed','Flama','sans-serif'] text-4xl leading-tight text-[#1f1a17] sm:text-5xl">
                  {product.name}
                </h1>
                <button
                  onClick={handleWishlistToggle}
                  className={`shrink-0 rounded-xl border p-2 transition ${isFavorite
                    ? 'border-[#d23030] bg-red-50 text-[#d23030]'
                    : 'border-[#e3d4c2] text-[#6b5647] hover:border-[#c99c53] hover:text-[#c99c53]'
                    }`}
                  title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Rating + reviews link */}
              <button
                type="button"
                onClick={scrollToReviews}
                className="flex items-center gap-2 text-left"
              >
                <span className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const filled = s <= Math.round(reviewStats.averageRating || 5);
                    return (
                      <FiStar
                        key={s}
                        className={`h-4 w-4 ${filled ? 'fill-[#f5b820] text-[#f5b820]' : 'text-[#d8c7b5]'}`}
                      />
                    );
                  })}
                </span>
                <span className="text-sm text-[#6f5d4e] underline-offset-2 hover:underline">
                  ({reviewStats.totalReviews > 0 ? `${reviewStats.totalReviews} customer review${reviewStats.totalReviews > 1 ? 's' : ''}` : 'Write a review'})
                </span>
              </button>

              {/* Price (range or single) */}
              <p className="font-['FlamaCondensed','Flama','sans-serif'] text-3xl font-bold text-[#1f1a17] sm:text-4xl">
                {priceRange ? (
                  <>
                    ₹ {priceRange.min.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {' – '}
                    ₹ {priceRange.max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </>
                ) : (
                  <>₹ {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                )}
              </p>

              {/* Weight pills */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#45372d]">
                    Weight : <span className="ml-1 font-normal text-[#8a7360]">{displayWeight}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => {
                      const isSelected = selectedSize?.weight === size.weight;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSizeChange(size)}
                          className={`rounded-md border px-4 py-2 text-sm font-medium transition ${isSelected
                            ? 'border-[#b58a3a] bg-white text-[#1f1a17] shadow-[inset_0_0_0_1px_#b58a3a]'
                            : 'border-[#d8c7b5] bg-white text-[#3f3228] hover:border-[#b58a3a]'
                            }`}
                        >
                          {size.weight}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSize && (
                    <button
                      type="button"
                      onClick={() => setSelectedSize(null)}
                      className="flex items-center gap-1 text-xs text-[#7f6a58] hover:text-[#1f1a17]"
                    >
                      <FiPlus className="h-3 w-3 rotate-45" /> Clear
                    </button>
                  )}
                </div>
              )}

              {/* Selected price (when size picked from a multi-price product) */}
              {priceRange && selectedSize && (
                <p className="font-['FlamaCondensed','Flama','sans-serif'] text-3xl font-bold text-[#1f1a17]">
                  ₹ {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}

              {/* Qty + Add to Cart + Buy Now */}
              <div className="flex flex-wrap items-stretch gap-3">
                <div className="inline-flex h-[48px] items-center justify-between rounded-md border border-[#d8c7b5] bg-white px-1 w-[110px]">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="rounded p-2 text-[#4b3e33] transition hover:bg-[#f3e8db] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <FiMinus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-base font-semibold text-[#201914]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="rounded p-2 text-[#4b3e33] transition hover:bg-[#f3e8db] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || (product.stock !== undefined && product.stock === 0)}
                  className="h-[48px] flex-1 min-w-[140px] rounded-md bg-[#b58a3a] px-5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9d742f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAdding ? 'Adding...' : 'Add To Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isBuying || (product.stock !== undefined && product.stock === 0)}
                  className="h-[48px] flex-1 min-w-[140px] rounded-md border-2 border-[#b58a3a] bg-white px-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#b58a3a] transition hover:bg-[#fff6e8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBuying ? 'Redirecting...' : 'Buy Now'}
                </button>
              </div>

              {/* Delivery info line */}
              <p className="text-sm leading-relaxed text-[#6f5d4e]">
                Same-day dispatch from Neemuch.{' '}
                Expected delivery time across India:{' '}
                <span className="font-medium text-[#3f3228]">{product.deliveryTime || '3-5 Working Days'}</span>.
              </p>

              {/* Payment icons */}
              <div className="relative h-9 w-full max-w-[320px]">
                <Image
                  src="/visa.svg"
                  alt="Accepted payment methods: Visa, Mastercard, RuPay, UPI"
                  fill
                  className="object-contain object-left"
                />
              </div>

              {/* Accordions */}
              <div className="space-y-2 pt-1">
                {accordionItems.map((item) => {
                  const isOpen = openAccordion === item.key;
                  return (
                    <div key={item.key} className="overflow-hidden border-b border-[#eadfce]">
                      <button
                        type="button"
                        onClick={() => setOpenAccordion(isOpen ? null : item.key)}
                        className="flex w-full items-center justify-between py-4 text-left"
                      >
                        <span className="text-sm font-semibold uppercase tracking-wide text-[#2b221b]">
                          {item.title}
                        </span>
                        {isOpen ? (
                          <FiMinus className="h-4 w-4 text-[#2b221b]" />
                        ) : (
                          <FiPlus className="h-4 w-4 text-[#2b221b]" />
                        )}
                      </button>
                      {isOpen && <div className="pb-5 text-sm">{item.content}</div>}
                    </div>
                  );
                })}
              </div>

              {/* SKU */}
              <p className="text-xs text-[#7f6a58]">
                <span className="font-medium text-[#3f3228]">SKU:</span> {sku}
              </p>

              {/* Share */}
              <div className="flex items-center gap-3 text-xs text-[#7f6a58]">
                <span className="font-medium text-[#3f3228]">Share:</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7f6a58] hover:text-[#b58a3a]"
                  aria-label="Share on Facebook"
                >
                  <FiFacebook className="h-4 w-4" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&text=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7f6a58] hover:text-[#b58a3a]"
                  aria-label="Share on Twitter"
                >
                  <FiTwitter className="h-4 w-4" />
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${typeof window !== 'undefined' ? encodeURIComponent(product.name + ' ' + window.location.href) : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7f6a58] hover:text-[#b58a3a]"
                  aria-label="Share on WhatsApp"
                >
                  <FiShare2 className="h-4 w-4" />
                </a>
              </div>

              {/* Disclaimer */}
              <p className="text-xs leading-relaxed text-[#9c8773]">
                Images shown on this website are for reference purpose only. Actual product or packaging may vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Reviews — always visible */}
      <div ref={reviewSectionRef} className="w-full px-4 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto">
          <ProductReviews productId={productId} productName={product.name} />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="w-full px-4 py-8 md:py-12 bg-white">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-bold font-general-sansal-sansal-sans text-primary-brown mb-8 text-center">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}