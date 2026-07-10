"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { createPortal } from "react-dom";

export function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
      >
        <LogOut className="w-5 h-5" /> Logout
      </button>

      {showConfirm && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out</h3>
            <p className="text-gray-600 mb-8 font-medium">Are you sure you want to log out?</p>
            
            <div className="flex items-center gap-3 justify-end">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-5 py-2.5 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
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
