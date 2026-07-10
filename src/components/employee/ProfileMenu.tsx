"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { LogOut, User, Settings, ShieldCheck, ChevronDown } from "lucide-react";
import Link from "next/link";

interface ProfileMenuProps {
  userName: string | null | undefined;
  profileStatus?: string;
}

export default function ProfileMenu({ userName, profileStatus = "PENDING" }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowConfirm(true);
  };

  const handleConfirmLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 p-1.5 pr-3 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-black/5"
        >
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
            {userName?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="text-sm font-bold text-gray-900 hidden sm:block">
            {userName?.split(" ")[0]}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            
            <div className="p-3 mb-2 bg-gray-50 rounded-xl">
              <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <ShieldCheck className={`w-3.5 h-3.5 ${profileStatus === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`} />
                <p className={`text-xs font-bold uppercase tracking-wider ${profileStatus === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {profileStatus}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Link href="/employee/profile" onClick={() => setIsOpen(false)} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors">
                <User className="w-4 h-4 text-gray-400" />
                My Profile
              </Link>
              <Link href="/employee/settings" onClick={() => setIsOpen(false)} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors">
                <Settings className="w-4 h-4 text-gray-400" />
                Settings
              </Link>
            </div>

            <div className="h-px bg-gray-100 my-2"></div>

            <button
              onClick={handleLogoutClick}
              className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <LogOut className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight">Sign Out</h3>
            <p className="text-gray-500 mb-8">Are you sure you want to end your session and sign out of the professional portal?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmLogout}
                className="flex-1 py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
