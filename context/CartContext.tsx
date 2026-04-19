'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedWeight?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string, selectedSize?: string, selectedWeight?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedWeight?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const normalizeLineVariant = (item: { selectedSize?: string; selectedWeight?: string; defaultWeight?: string }) => {
  return String(item.selectedWeight || item.selectedSize || item.defaultWeight || '').trim();
};

const isSameCartLine = (
  item: { id: string; selectedSize?: string; selectedWeight?: string; defaultWeight?: string },
  candidate: { id: string; selectedSize?: string; selectedWeight?: string; defaultWeight?: string }
) => {
  if (item.id !== candidate.id) return false;
  return normalizeLineVariant(item) === normalizeLineVariant(candidate);
};

const isTargetCartLine = (
  item: { id: string; selectedSize?: string; selectedWeight?: string; defaultWeight?: string },
  productId: string,
  selectedSize?: string,
  selectedWeight?: string
) => {
  if (item.id !== productId) return false;

  if (selectedSize === undefined && selectedWeight === undefined) {
    return true;
  }

  const targetVariant = normalizeLineVariant({ selectedSize, selectedWeight });
  return normalizeLineVariant(item) === targetVariant;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const isSyncing = useRef(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Sync cart when user logs in
  useEffect(() => {
    if (!isInitialized || !user) return;
    
    const sourceId = user.id || user.userId;
    if (!sourceId) return;

    const syncCartWithDB = async () => {
      isSyncing.current = true;
      try {
        const localCartStr = localStorage.getItem('cart');
        const localItems = localCartStr ? JSON.parse(localCartStr) : [];
        
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: sourceId, items: localItems, action: 'sync' })
        });
        
        const data = await res.json();
        if (data.success && data.data) {
          setCartItems(data.data);
          localStorage.setItem('cart', JSON.stringify(data.data));
        }
      } catch (err) {
        console.error('Cart sync error:', err);
      } finally {
        isSyncing.current = false;
      }
    };
    
    syncCartWithDB();
  }, [user, isInitialized]);

  // Save cart to DB and localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // If currently performing sync-merge, do not overwrite DB with incomplete local state
    if (user && !isSyncing.current) {
      const sourceId = user.id || user.userId;
      if (sourceId) {
        fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: sourceId, items: cartItems }),
        }).catch(err => console.error('Failed to save cart to DB:', err));
      }
    }
  }, [cartItems, user, isInitialized]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      // Find existing item keeping size/weight into account if they exist
      const existingItem = prevItems.find((item) => isSameCartLine(item, product));
      
      if (existingItem) {
        return prevItems.map((item) =>
          isSameCartLine(item, product)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedSize?: string, selectedWeight?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !isTargetCartLine(item, productId, selectedSize, selectedWeight))
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string, selectedWeight?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedWeight);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        isTargetCartLine(item, productId, selectedSize, selectedWeight)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
