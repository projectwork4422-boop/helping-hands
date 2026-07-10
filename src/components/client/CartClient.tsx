"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Bell, ArrowLeft, Trash2, Clock } from "lucide-react";
import ClientProfileMenu from "@/components/client/ClientProfileMenu";
import CartIcon from "@/components/client/CartIcon";
import Link from "next/link";
import BookingModal from "@/components/client/BookingModal";
import { useRouter } from "next/navigation";

type District = {
  id: string;
  name: string;
};

export default function CartClient({ userName, districts = [] }: { userName: string | null, districts?: District[] }) {
  const { cart, removeFromCart, clearCart, isInitialized } = useCart();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const router = useRouter();

  if (!isInitialized) return null;

  const total = cart.reduce((acc, service) => acc + service.basePrice, 0);

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    clearCart();
    router.push("/client/bookings/active");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/explore" className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-lg font-bold tracking-tight">Your Cart</span>
        </div>
        <div className="flex items-center gap-4">
          {userName && (
            <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><Bell className="w-5 h-5" /></button>
          )}
          <CartIcon />
          {userName && <ClientProfileMenu userName={userName} />}
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight mb-6">Service Cart</h1>

          {cart.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
              <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
              <p className="text-black/60 mb-6">Browse our services and add them to your cart to book.</p>
              <Link href="/explore" className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-black/80 transition-colors inline-block">
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map(service => (
                  <div key={service.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                      {(service as any).images?.[0] ? (
                        <img src={(service as any).images[0]} alt={service.name} className="w-full h-full object-cover" />
                      ) : (
                        service.iconUrl || "🔧"
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{service.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-black/50">{service.category?.name || "Service"}</p>
                        {service.estimatedTime && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            <Clock className="w-3 h-3" />
                            <span>{service.estimatedTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-sm">
                      ${service.basePrice.toFixed(2)}
                    </div>
                    <button 
                      onClick={() => removeFromCart(service.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                <h3 className="font-bold text-lg mb-4">Summary</h3>
                <div className="flex justify-between items-center mb-2 text-sm text-black/60">
                  <span>Services ({cart.length})</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-6 text-sm text-black/60">
                  <span>Taxes & Fees</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center font-bold text-lg mb-6">
                  <span>Total Estimate</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    if (!userName) {
                      alert("Please log in to continue with your booking.");
                      router.push("/login/client");
                    } else {
                      setShowBookingModal(true);
                    }
                  }}
                  className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-black/90 transition-colors shadow-sm"
                >
                  Proceed to Book
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showBookingModal && (
        <BookingModal 
          services={cart} 
          districts={districts}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
