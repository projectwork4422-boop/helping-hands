import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Helping Hands | Home Services",
  description: "Book skilled service professionals easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black antialiased`}>
        <CartProvider>
          <LocationProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </LocationProvider>
        </CartProvider>
      </body>
    </html>
  );
}
