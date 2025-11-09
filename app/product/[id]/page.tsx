'use client';

import React, { useState, useEffect } from 'react';
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
import { FiShoppingCart, FiArrowLeft, FiMinus, FiPlus, FiHeart } from 'react-icons/fi';
import { Product } from '@/types';

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
  
  // Size selection state
  const [selectedSize, setSelectedSize] = useState<{ weight: string; price: number; label?: string } | null>(null);
  
  useEffect(() => {
    loadProduct();
  }, [productId]);

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
          <h1 className="text-3xl font-bold font-serif mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="bg-primary-red text-white px-6 py-3 rounded-lg font-bold font-serif hover:bg-primary-darkRed transition-colors"
          >
            Go Back Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    // Create product with selected size price
    const productWithSize = {
      ...product,
      price: currentPrice,
      selectedSize: selectedSize?.weight,
    };
    for (let i = 0; i < quantity; i++) {
      addToCart(productWithSize, 1);
    }
    setTimeout(() => setIsAdding(false), 500);
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
      <div className="w-full px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Image */}
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif text-primary-brown mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-primary-red">₹{currentPrice.toLocaleString()}</span>
                {selectedSize && (
                  <span className="text-sm text-gray-600">({displayWeight})</span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-primary-brown mb-3">Select Size/Weight:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => handleSizeChange(size)}
                      className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                        selectedSize?.weight === size.weight
                          ? 'border-primary-red bg-red-50 text-primary-red'
                          : 'border-gray-300 hover:border-primary-red text-gray-700'
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

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-primary-brown mb-3">Quantity:</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={quantity >= 10}
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-2 text-sm text-gray-600">
              {product.shelfLife && (
                <p><span className="font-semibold">Shelf Life:</span> {product.shelfLife}</p>
              )}
              {product.deliveryTime && (
                <p><span className="font-semibold">Delivery Time:</span> {product.deliveryTime}</p>
              )}
              <p><span className="font-semibold">Category:</span> <span className="capitalize">{product.category}</span></p>
              {product.stock !== undefined && (
                <p><span className="font-semibold">Stock:</span> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || (product.stock !== undefined && product.stock === 0)}
                className="flex-1 bg-primary-red text-white px-6 py-4 rounded-lg font-bold font-serif hover:bg-primary-darkRed transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiShoppingCart className="w-5 h-5" />
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  isFavorite
                    ? 'border-primary-red bg-red-50 text-primary-red'
                    : 'border-gray-300 hover:border-primary-red text-gray-700'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      <div className="w-full px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <ProductReviews productId={productId} />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="w-full px-4 py-8 md:py-12 bg-gray-50">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-primary-brown mb-8 text-center">
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
