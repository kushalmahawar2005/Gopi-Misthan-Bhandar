'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
 
const Cart: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    isCartOpen,
    closeCart,
  } = useCart();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // --- PROBLEM 1: Handle Browser Back Button to Close Cart ---
  useEffect(() => {
    if (isCartOpen) {
      // Push state only if it hasn't been pushed already for this session
      window.history.pushState({ cartOpen: true }, '');
      
      const handlePopState = (event: PopStateEvent) => {
        // Close cart if back button is pressed
        closeCart();
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isCartOpen, closeCart]);

  // Handle manual closure (clicking X or Overlay)
  const handleManualClose = () => {
    // If the top state is our cartOpen state, go back
    if (window.history.state?.cartOpen) {
      window.history.back();
    }
    closeCart();
  };

  // --- PROBLEM 2: Swipe Down to Close (Mobile Only) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    const isSwipeDown = distance > 80;
    
    if (isSwipeDown) {
      handleManualClose();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity animate-in fade-in duration-300"
        onClick={handleManualClose}
      />
      
      {/* Cart Sidebar */}
      <div 
        className="fixed right-0 bottom-0 md:top-0 h-[92vh] md:h-full w-full max-w-md bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto rounded-t-3xl md:rounded-none animate-in slide-in-from-bottom md:slide-in-from-right"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col h-full relative">
          {/* Mobile Swipe/Drag Handle */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="bg-white md:bg-primary-red text-gray-900 md:text-white p-6 flex items-center justify-between sticky top-0 z-10 border-b md:border-none">
            <div className="flex items-center gap-3">
              <FiShoppingBag className="w-6 h-6 text-primary-red md:text-white" />
              <h2 className="text-xl font-bold font-general-sans">
                Shopping Cart ({getTotalItems()})
              </h2>
            </div>
            <button
              onClick={handleManualClose}
              className="p-2 hover:bg-gray-100 md:hover:bg-white/20 rounded-full transition-colors text-gray-500 md:text-white"
              aria-label="Close cart"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 p-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FiShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-general-sans mb-2">Your cart is empty</p>
                <p className="text-gray-400 text-sm">Add some delicious sweets to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-general-sans font-medium text-sm mb-1 line-clamp-2 text-gray-800">
                        {item.name}
                      </h3>
                      <div className="flex flex-col gap-0.5 mb-2">
                        <p className="text-primary-red font-bold text-sm">
                          ₹{item.price}
                        </p>
                        {item.selectedSize && (
                          <span className="text-[10px] text-gray-500 font-medium uppercase">{item.selectedSize}</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors self-start"
                      aria-label="Remove item"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total and Checkout */}
          {cartItems.length > 0 && (
            <div 
              className="border-t border-gray-200 p-6 pb-12 md:pb-6 bg-gray-50 sticky bottom-0"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold font-general-sans text-gray-800">Total:</span>
                <span className="text-xl font-bold text-primary-red font-general-sans">
                  ₹{getTotalPrice().toLocaleString()}
                </span>
              </div>
              <div className="relative z-20">
                <Link
                  href="/checkout"
                  className="block w-full bg-[#FE8E02] text-white py-4 md:py-3 px-6 rounded-xl md:rounded-lg font-bold font-general-sans hover:opacity-90 transition-all text-center shadow-lg active:scale-95"
                  onClick={() => closeCart()}
                >
                  PROCEED TO CHECKOUT
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Cart;


