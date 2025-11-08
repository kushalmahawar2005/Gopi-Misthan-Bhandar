'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
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

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={closeCart}
      />
      
      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-primary-red text-white p-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <FiShoppingBag className="w-6 h-6" />
              <h2 className="text-xl font-bold font-serif">
                Shopping Cart ({getTotalItems()})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
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
                <p className="text-gray-500 text-lg font-serif mb-2">Your cart is empty</p>
                <p className="text-gray-400 text-sm">Add some delicious sweets to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
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
                      <h3 className="font-serif font-medium text-sm mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-primary-red font-bold text-sm mb-2">
                        ₹{item.price}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="w-4 h-4" />
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
            <div className="border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold font-serif">Total:</span>
                <span className="text-xl font-bold text-primary-red font-serif">
                  ₹{getTotalPrice().toLocaleString()}
                </span>
              </div>
              <button
                className="w-full bg-primary-red text-white py-3 px-6 rounded-lg font-bold font-serif hover:bg-primary-darkRed transition-colors"
                onClick={() => {
                  alert('Checkout functionality will be implemented in backend phase!');
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;

