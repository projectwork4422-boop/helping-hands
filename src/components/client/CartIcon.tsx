"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartIcon() {
  const { cart, isInitialized } = useCart();

  // Optionally return a placeholder to avoid hydration mismatch
  if (!isInitialized) {
    return (
      <div className="relative p-2 bg-gray-50 rounded-full flex items-center justify-center opacity-50">
        <ShoppingCart className="w-5 h-5" />
      </div>
    );
  }

  return (
    <Link href="/client/cart" className="relative p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center">
      <ShoppingCart className="w-5 h-5" />
      {cart.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
          {cart.length}
        </span>
      )}
    </Link>
  );
}
