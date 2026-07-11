"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { name: "Home", href: "/#home" },
  { name: "About", href: "/#about" },
  { name: "Services", href: "/#services" },
  { name: "Explore", href: "/explore" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/10">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          Helping Hands.
        </Link>
        
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="relative text-sm font-medium transition-colors hover:text-black/70"
            >
              {link.name}
              {(pathname === link.href || (pathname === "/" && link.name === "Home")) && (
                <motion.div 
                  layoutId="underline" 
                  className="absolute left-0 top-full h-px w-full bg-black"
                />
              )}
            </Link>
          ))}
          <Link 
            href="/login-selection" 
            className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-black/90 transition-colors"
          >
            Login
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-black hover:bg-black/5 rounded-full transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-white shadow-2xl z-50 md:hidden flex flex-col"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                <span className="text-xl font-bold">Menu</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col p-6 gap-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link 
                  href="/login-selection" 
                  onClick={() => setIsOpen(false)}
                  className="mt-4 px-5 py-3 bg-black text-white text-center font-medium rounded-xl hover:bg-black/90 transition-colors"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
