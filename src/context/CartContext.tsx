"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Category = {
  id: string;
  name: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  iconUrl: string | null;
  categoryId: string | null;
  category: Category | null;
  estimatedTime?: string | null;
  bookings?: any[];
};

type CartContextType = {
  cart: Service[];
  addToCart: (service: Service) => void;
  removeFromCart: (serviceId: string) => void;
  clearCart: () => void;
  isInCart: (serviceId: string) => boolean;
  isInitialized: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Service[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("helping-hands-cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {}
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("helping-hands-cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (service: Service) => {
    setCart((prev) => {
      if (prev.find((item) => item.id === service.id)) return prev;
      return [...prev, service];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== serviceId));
  };

  const clearCart = () => setCart([]);

  const isInCart = (serviceId: string) => {
    return cart.some((item) => item.id === serviceId);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isInCart, isInitialized }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
