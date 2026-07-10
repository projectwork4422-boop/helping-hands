"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/#home" },
  { name: "About", href: "/#about" },
  { name: "Services", href: "/#services" },
  { name: "Explore", href: "/explore" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const pathname = usePathname();



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
      </div>
    </header>
  );
}
