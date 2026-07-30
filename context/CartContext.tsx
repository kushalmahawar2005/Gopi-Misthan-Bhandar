'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

/**
 * A cart line stores only what the cart/checkout actually render. It is
 * deliberately NOT the whole Product - persisting description/images/sizes
 * bloated both localStorage and the Mongo cart document.
 */
export interface CartItem {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedWeight?: string;
  defaultWeight?: string;
  /** Live stock from the last revalidation. null = unlimited/unknown. */
  stock?: number | null;
}

/** Hard ceiling per line, independent of stock. */
const MAX_QUANTITY_PER_LINE = 10;

interface CartContextType {
  cartItems: CartItem[];
  /**
   * False until the cart is authoritative: read back from localStorage and, for
   * a signed-in user, synced with /api/cart. Consumers that act on an empty
   * cart (checkout redirecting to /products, for example) must wait for this,
   * otherwise a direct visit or a refresh sees the initial empty array and
   * bounces the customer out mid-checkout.
   */
  isCartReady: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string, selectedSize?: string, selectedWeight?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedWeight?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  /** Max this line may be raised to, honouring both stock and the hard cap. */
  getMaxQuantity: (item: CartItem) => number;
  /** Re-price the cart against the live catalogue. */
  revalidateCart: () => Promise<void>;
  cartNotice: string | null;
  dismissCartNotice: () => void;
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

/** Keep only the fields the cart actually needs. */
const toCartItem = (product: Product & Partial<CartItem>, quantity: number): CartItem => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  price: product.price,
  image: product.image,
  quantity,
  selectedSize: product.selectedSize,
  selectedWeight: product.selectedWeight,
  defaultWeight: product.defaultWeight,
  stock: typeof product.stock === 'number' ? product.stock : null,
});

const clampQuantity = (quantity: number, stock?: number | null): number => {
  const ceiling = typeof stock === 'number' && stock >= 0
    ? Math.min(MAX_QUANTITY_PER_LINE, stock)
    : MAX_QUANTITY_PER_LINE;
  return Math.max(0, Math.min(quantity, ceiling));
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const { user } = useAuth();

  const [isInitialized, setIsInitialized] = useState(false);
  // For a signed-in user the authoritative cart comes back from /api/cart, not
  // localStorage. Until that first sync lands the cart may look empty.
  const [hasSyncedWithServer, setHasSyncedWithServer] = useState(false);
  const isSyncing = useRef(false);
  // Tracks the last signed-in user so we can detect logout / account switch.
  const lastUserIdRef = useRef<string | null>(null);
  // Mirror of cartItems for async callbacks. Reading state via a setState
  // updater does NOT work here - the updater runs on the next render, so the
  // value would still be empty by the time the callback continues.
  const cartItemsRef = useRef<CartItem[]>([]);

  const currentUserId = user ? String((user as any).id || (user as any).userId || '') : '';

  // Declared before every effect that reads the ref, so it is always current.
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCartItems(parsed);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  /**
   * Re-price every line against the catalogue. Cart lines persist the price
   * captured at add-time, so without this the customer can see a stale price
   * in the cart and at checkout while the server charges the current one.
   */
  const revalidateCart = useCallback(async () => {
    const currentItems = cartItemsRef.current;
    if (currentItems.length === 0) return;

    try {
      const res = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: currentItems.map((item) => ({ id: item.id, weight: normalizeLineVariant(item) })),
        }),
      });

      const data = await res.json();
      if (!data.success || !Array.isArray(data.data)) return;

      const fresh = new Map<string, any>(
        data.data.map((row: any) => [`${row.id}::${String(row.weight || '').trim()}`, row])
      );

      const removed: string[] = [];
      const repriced: string[] = [];

      setCartItems((prev) => {
        const next: CartItem[] = [];

        for (const item of prev) {
          const row = fresh.get(`${item.id}::${normalizeLineVariant(item)}`);
          if (!row) {
            next.push(item);
            continue;
          }

          if (!row.available || row.weightAvailable === false || row.stock === 0) {
            removed.push(item.name);
            continue;
          }

          if (typeof row.price === 'number' && row.price !== item.price) {
            repriced.push(item.name);
          }

          // Only take non-empty values - some products have an empty image
          // field, and overwriting a good cart image with "" breaks next/image.
          next.push({
            ...item,
            name: typeof row.name === 'string' && row.name ? row.name : item.name,
            image: typeof row.image === 'string' && row.image ? row.image : item.image,
            price: typeof row.price === 'number' ? row.price : item.price,
            stock: typeof row.stock === 'number' ? row.stock : null,
            quantity: clampQuantity(item.quantity, row.stock) || 1,
          });
        }

        return next;
      });

      const messages: string[] = [];
      if (removed.length) messages.push(`${removed.join(', ')} ab available nahi hai — cart se hata diya.`);
      if (repriced.length) messages.push(`${repriced.join(', ')} ka price update hua hai.`);
      setCartNotice(messages.length ? messages.join(' ') : null);
    } catch (error) {
      console.error('Cart revalidation failed:', error);
    }
  }, []);

  // Re-price once the cart has loaded, and again whenever the drawer opens.
  useEffect(() => {
    if (!isInitialized) return;
    revalidateCart();
  }, [isInitialized, revalidateCart]);

  useEffect(() => {
    if (isCartOpen) revalidateCart();
  }, [isCartOpen, revalidateCart]);

  // Clear the cart on logout or account switch, so the next person on this
  // device does not inherit (and silently merge in) someone else's cart.
  useEffect(() => {
    if (!isInitialized) return;

    const previousUserId = lastUserIdRef.current;

    if (previousUserId && previousUserId !== currentUserId) {
      setCartItems([]);
      setCartNotice(null);
      try {
        localStorage.removeItem('cart');
      } catch {
        /* storage unavailable - nothing to clean up */
      }
    }

    lastUserIdRef.current = currentUserId || null;
  }, [currentUserId, isInitialized]);

  // Merge this browser's cart into the saved cart when the user signs in.
  useEffect(() => {
    if (!isInitialized || !currentUserId) return;

    const syncCartWithDB = async () => {
      isSyncing.current = true;
      try {
        const localItems = cartItemsRef.current;

        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: localItems, action: 'sync' }),
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCartItems(data.data);
          localStorage.setItem('cart', JSON.stringify(data.data));
        }
      } catch (err) {
        console.error('Cart sync error:', err);
      } finally {
        isSyncing.current = false;
        setHasSyncedWithServer(true);
      }
    };

    syncCartWithDB().then(() => revalidateCart());
  }, [currentUserId, isInitialized, revalidateCart]);

  // Persist to localStorage, and to the DB when signed in.
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem('cart', JSON.stringify(cartItems));

    // While the login merge is in flight, don't push this browser's partial
    // state over the merged result.
    if (currentUserId && !isSyncing.current) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      }).catch((err) => console.error('Failed to save cart to DB:', err));
    }
  }, [cartItems, currentUserId, isInitialized]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => isSameCartLine(item, product));

      if (existingItem) {
        return prevItems.map((item) =>
          isSameCartLine(item, product)
            ? { ...item, quantity: clampQuantity(item.quantity + quantity, item.stock) }
            : item
        );
      }

      const next = toCartItem(product as Product & Partial<CartItem>, quantity);
      return [...prevItems, { ...next, quantity: clampQuantity(next.quantity, next.stock) || 1 }];
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
          ? { ...item, quantity: clampQuantity(quantity, item.stock) || 1 }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCartNotice(null);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getMaxQuantity = (item: CartItem) =>
    typeof item.stock === 'number' && item.stock >= 0
      ? Math.min(MAX_QUANTITY_PER_LINE, item.stock)
      : MAX_QUANTITY_PER_LINE;

  const dismissCartNotice = () => setCartNotice(null);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartReady: isInitialized && (!currentUserId || hasSyncedWithServer),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getMaxQuantity,
        revalidateCart,
        cartNotice,
        dismissCartNotice,
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
