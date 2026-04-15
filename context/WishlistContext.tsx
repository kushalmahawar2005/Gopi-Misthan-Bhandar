'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const { user } = useAuth();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const isSyncing = useRef(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Sync wishlist with DB logic when user logs in
  useEffect(() => {
    if (!isInitialized || !user) return;
    
    const sourceId = user.id || user.userId;
    if (!sourceId) return;

    const syncWishlistWithDB = async () => {
      isSyncing.current = true;
      try {
        const localWishlistStr = localStorage.getItem('wishlist');
        const localItems = localWishlistStr ? JSON.parse(localWishlistStr) : [];
        
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: sourceId, items: localItems, action: 'sync' })
        });
        
        const data = await res.json();
        if (data.success && data.data) {
          setWishlistItems(data.data);
          localStorage.setItem('wishlist', JSON.stringify(data.data));
        }
      } catch (err) {
        console.error('Wishlist sync error:', err);
      } finally {
        isSyncing.current = false;
      }
    };
    
    syncWishlistWithDB();
  }, [user, isInitialized]);

  // Save wishlist to DB and localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));

    if (user && !isSyncing.current) {
      const sourceId = user.id || user.userId;
      if (sourceId) {
        fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: sourceId, items: wishlistItems }),
        }).catch(err => console.error('Failed to save wishlist to DB:', err));
      }
    }
  }, [wishlistItems, user, isInitialized]);

  const addToWishlist = (product: Product) => {
    setWishlistItems((prevItems) => {
      if (prevItems.find((item) => item.id === product.id)) {
        return prevItems; // Already in wishlist
      }
      return [...prevItems, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
