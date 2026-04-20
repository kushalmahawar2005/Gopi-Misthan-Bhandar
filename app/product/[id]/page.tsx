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
  FiTruck,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
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
  const [showReviews, setShowReviews] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<LightweightProduct[]>([]);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
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
    if (showReviews) {
      reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showReviews]);

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
        const relatedResp = await fetchProducts({ category: productData.category, limit: 4 });
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
  const productUrl = `/product/${item.slug || item.id}`;
  return (
    <Link
      key={item.id}
      href={productUrl}
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
                  {/* Removed label line from size selection */}
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
                      className={`relative h-[88px] w-full overflow-hidden rounded-xl border-2 transition ${
                        selectedImageIndex === index
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

              <div
                className="group relative w-full overflow-hidden rounded-2xl border border-[#e6d8c7] bg-white"
                style={{ aspectRatio: activeImageAspectRatio }}
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
                      className={`relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        selectedImageIndex === index ? 'border-[#b58a3a]' : 'border-[#e6d8c7]'
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
          <div className="rounded-[28px] border border-[#ead8c3] bg-white p-5 shadow-[0_16px_46px_rgba(133,74,31,0.10)] animate-[fadeInUp_0.65s_ease-out] sm:p-7">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <h1 className="font-['Platina','Georgia','serif'] text-4xl leading-tight text-[#1f1a17] sm:text-5xl">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-[#f6e8e2] px-3 py-1 text-xs font-semibold text-[#5f4738]">
                      Handmade in India
                    </span>
                    <span className="rounded-md bg-[#f6e8e2] px-3 py-1 text-xs font-semibold text-[#5f4738]">
                      Traditional Products
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleWishlistToggle}
                  className={`rounded-xl border p-2 transition ${
                    isFavorite
                      ? 'border-[#d23030] bg-red-50 text-[#d23030]'
                      : 'border-[#e3d4c2] text-[#6b5647] hover:border-[#c99c53] hover:text-[#c99c53]'
                  }`}
                  title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <p className="text-sm leading-relaxed text-[#735f50]">{shortDescription}</p>

              <div className="flex flex-wrap items-end justify-between gap-3">
                <p className="font-['FlamaCondensed','Flama','sans-serif'] text-4xl font-bold text-[#1f1a17]">
                  Rs. {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-[#7f6a58]">Subtotal: Rs. {(currentPrice * quantity).toLocaleString()}</p>
              </div>

              <div className="h-px bg-[#efe5d9]" />

              <div className="space-y-4">
                <p className="text-base font-semibold text-[#45372d]">
                  Weight : <span className="ml-1 font-normal text-[#8a7360]">{displayWeight}</span>
                </p>

                {product.sizes && product.sizes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {product.sizes.map((size, index) => {
                      const compactWeight = size.weight.replace(/\s+/g, '').toLowerCase();
                      const isSelected = selectedSize?.weight === size.weight;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSizeChange(size)}
                          className={`group flex min-h-[96px] flex-col items-center justify-center rounded-2xl border-2 px-3 py-2 text-center transition ${
                            isSelected
                              ? 'border-[#b58a3a] bg-[#fff6e8] shadow-[0_8px_22px_rgba(181,138,58,0.18)]'
                              : 'border-[#cfad6a] bg-white hover:bg-[#fffaf2]'
                          }`}
                        >
                          <span className="font-['FlamaCondensed','Flama','sans-serif'] text-4xl leading-none text-[#161311]">
                            {compactWeight}
                          </span>
                          <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#7f6a58]">
                            Rs. {size.price.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="inline-flex rounded-xl border border-[#cfad6a] bg-white px-4 py-3 text-lg font-semibold text-[#1f1a17]">
                    {displayWeight}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-stretch">
                <div className="inline-flex h-[58px] sm:h-[54px] items-center justify-between rounded-xl border border-[#d8c7b5] bg-[#fffaf3] px-2 sm:w-[120px]">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="rounded-md p-2.5 sm:p-2 text-[#4b3e33] transition hover:bg-[#f3e8db] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <FiMinus className="h-4 w-4 sm:h-4 sm:w-4" />
                  </button>
                  <span className="w-8 text-center text-[22px] sm:text-lg font-semibold text-[#201914]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="rounded-md p-2.5 sm:p-2 text-[#4b3e33] transition hover:bg-[#f3e8db] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                  >
                    <FiPlus className="h-4 w-4 sm:h-4 sm:w-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || (product.stock !== undefined && product.stock === 0)}
                  className="h-[56px] sm:h-[54px] flex-1 rounded-xl border border-[#30251d] bg-white px-5 text-[17px] sm:text-sm font-semibold uppercase tracking-[0.11em] sm:tracking-[0.08em] text-[#30251d] transition hover:bg-[#f8f1e9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAdding ? 'Adding...' : 'Add To Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isBuying || (product.stock !== undefined && product.stock === 0)}
                  className="h-[56px] sm:h-[54px] flex-1 rounded-xl bg-[#b58a3a] px-5 text-[17px] sm:text-sm font-semibold uppercase tracking-[0.11em] sm:tracking-[0.08em] text-white transition hover:bg-[#9d742f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBuying ? 'Redirecting...' : 'Buy It Now'}
                </button>
              </div>

              <div className="grid gap-3 rounded-2xl border border-[#f0e5d8] bg-[#fffbf5] p-4 sm:grid-cols-2">
                {infoItems.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex items-start gap-3 rounded-xl bg-white/80 p-3">
                    <div className="mt-0.5 rounded-full bg-[#f9efe3] p-2">{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-[#3f3228]">{item.title}</p>
                      <p className="text-xs text-[#7a6655]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-1">
                {accordionItems.map((item) => {
                  const isOpen = openAccordion === item.key;
                  return (
                    <div key={item.key} className="overflow-hidden rounded-2xl border border-[#eadfce] bg-[#fffdf8]">
                      <button
                        type="button"
                        onClick={() => setOpenAccordion(isOpen ? null : item.key)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left"
                      >
                        <span className="text-base font-semibold text-[#2b221b]">{item.title}</span>
                        {isOpen ? (
                          <FiMinus className="h-4 w-4 text-[#2b221b]" />
                        ) : (
                          <FiPlus className="h-4 w-4 text-[#2b221b]" />
                        )}
                      </button>
                      {isOpen && <div className="px-5 pb-5 text-sm text-[#6f5d4e]">{item.content}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

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