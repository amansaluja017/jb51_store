'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Product } from '@repo/products';
import { toast } from 'sonner';

export interface CartItem {
  id: string; // generated as `productId-color`
  product: Product;
  size?: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, color: string, quantity?: number, size?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jb51_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('jb51_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product: Product, color: string, quantity = 1, size?: string) => {
    const itemId = `${product.id}-${color}${size ? '-' + size : ''}`;
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === itemId);
      
      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const newItems = [...prevItems];
        const newQty = newItems[existingItemIndex].quantity + quantity;
        
        // Check stock limit if variants have stock limits
        const matchingVariant = product.variants.find(v => v.color === color);
        if (matchingVariant && newQty > matchingVariant.stock) {
          toast.error(`Only ${matchingVariant.stock} items available in stock.`);
          return prevItems;
        }
        
        newItems[existingItemIndex].quantity = newQty;
        toast.success(`Updated ${product.name} quantity in cart`);
        return newItems;
      } else {
        // Item does not exist, add new item
        const matchingVariant = product.variants.find(v => v.color === color);
        if (matchingVariant && quantity > matchingVariant.stock) {
          toast.error(`Only ${matchingVariant.stock} items available in stock.`);
          return prevItems;
        }
        
        toast.success(`Added ${product.name} to cart`);
        return [...prevItems, {
          id: itemId,
          product,
          size,
          color,
          quantity
        }];
      }
    });
    
    // Automatically open cart drawer to provide direct visual feedback
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    toast.success('Removed item from cart');
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === cartItemId) {
          // Check stock
          const matchingVariant = item.product.variants.find(v => v.color === item.color);
          if (matchingVariant && quantity > matchingVariant.stock) {
            toast.error(`Only ${matchingVariant.stock} items available in stock.`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
