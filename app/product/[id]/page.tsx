'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, getAllProducts, getProductsByCategory } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
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
  const product = getProductById(productId);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Size selection state
  const [selectedSize, setSelectedSize] = useState<{ weight: string; price: number; label?: string } | null>(null);
  
  // Initialize selected size when product loads
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      const defaultSize = product.sizes.find(s => s.weight === product.defaultWeight) || product.sizes[0];
      setSelectedSize(defaultSize);
    }
  }, [product]);
  
  // Calculate current price based on selected size
  const currentPrice = selectedSize ? selectedSize.price : (product?.price || 0);
  const displayWeight = selectedSize ? selectedSize.weight : (product?.defaultWeight || '500g');

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

  const relatedProducts = getProductsByCategory(product.category)
    .filter(p => p.id !== product.id)
    .slice(0, 4);

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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <Cart />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary-red transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-600 hover:text-primary-red transition-colors">
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/category/${product.category}`} className="text-gray-600 hover:text-primary-red transition-colors capitalize">
              {product.category}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-black font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-red transition-colors mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16">
          {/* Product Image */}
          <div className="relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <p className="text-sm text-primary-red font-bold font-serif mb-2">
                GOPI MISTHAN BHANDAR
              </p>
              <h1 className="text-3xl md:text-4xl font-bold font-serif text-black mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-primary-red font-serif">
                  ₹{currentPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₹{Math.round(currentPrice * 1.2)}
                </span>
                <span className="text-sm text-green-600 font-bold">
                  ({Math.round((1 - currentPrice / (currentPrice * 1.2)) * 100)}% OFF)
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold font-serif mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-bold font-serif mb-3 block">Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => handleSizeChange(size)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                        selectedSize?.weight === size.weight
                          ? 'border-primary-red bg-primary-red text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary-red hover:text-primary-red'
                      }`}
                    >
                      <span className="block text-sm font-bold">{size.weight}</span>
                      {size.label && (
                        <span className="block text-xs opacity-75">{size.label}</span>
                      )}
                      <span className="block text-xs mt-1">₹{size.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-sm font-bold font-serif mb-2 block">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="w-5 h-5" />
                </button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <FiPlus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-primary-red text-white px-8 py-4 rounded-lg font-bold font-serif text-lg hover:bg-primary-darkRed transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FiShoppingCart className="w-5 h-5" />
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`px-8 py-4 rounded-lg font-bold font-serif text-lg border-2 transition-colors flex items-center justify-center gap-2 ${
                  isFavorite
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-red-600' : ''}`} />
                Favorite
              </button>
            </div>

            {/* Product Features */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-bold font-serif mb-1">Category</p>
                  <p className="text-gray-600 capitalize">{product.category}</p>
                </div>
                <div>
                  <p className="font-bold font-serif mb-1">Weight</p>
                  <p className="text-gray-600">{displayWeight}</p>
                </div>
                <div>
                  <p className="font-bold font-serif mb-1">Shelf Life</p>
                  <p className="text-gray-600">{product.shelfLife || '7-10 days'}</p>
                </div>
                <div>
                  <p className="font-bold font-serif mb-1">Delivery</p>
                  <p className="text-gray-600">{product.deliveryTime || '2-3 days'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-black mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
