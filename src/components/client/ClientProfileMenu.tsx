"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, CalendarClock, CreditCard, Star, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { createPortal } from "react-dom";

export default function ClientProfileMenu({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <div 
          className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold cursor-pointer hover:bg-black/80 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {userName?.charAt(0).toUpperCase() || "U"}
        </div>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-4 py-3 border-b border-gray-50 mb-2">
              <p className="font-semibold truncate">{userName}</p>
              <p className="text-xs text-black/50">Client Account</p>
            </div>
            
            <Link href="/client/bookings/active" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
              <CalendarClock className="w-4 h-4 text-black/60" /> Active Bookings
            </Link>
            <Link href="/client/payments" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
              <CreditCard className="w-4 h-4 text-black/60" /> Payment History
            </Link>
            <Link href="/client/bookings/history" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
              <Star className="w-4 h-4 text-black/60" /> Booking History & Feedback
            </Link>
            <Link href="/client/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4 text-black/60" /> Profile Settings
            </Link>
            
            <div className="border-t border-gray-50 mt-2 pt-2">
              <button 
                onClick={() => { setIsOpen(false); setShowLogoutModal(true); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {showLogoutModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogOut className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Logout</h2>
            <p className="text-black/60 text-center mb-8">Are you sure you want to log out?</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="py-3 px-4 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="py-3 px-4 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
