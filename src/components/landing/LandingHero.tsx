"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingHero({ 
  clientStats 
}: { 
  clientStats?: { happyClients: string; verifiedPros: string; servicesOffered: string; citiesServed: string }
}) {
  const stats = clientStats || {
    happyClients: "10k+",
    verifiedPros: "500+",
    servicesOffered: "50+",
    citiesServed: "20+",
  };

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gray-100 rounded-full blur-3xl"></div>
        <div className="absolute top-[20%] right-[-5%] w-[30rem] h-[30rem] bg-gray-50 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Your trusted home service partner
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
          >
            Professional Home Services, <br className="hidden md:block" />
            <span className="text-black/40">Just a Click Away.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-black/60 mb-10 max-w-2xl mx-auto"
          >
            Helping Hands connects you with trusted, skilled professionals for all your home maintenance needs. Fast, reliable, and premium quality service.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/explore" 
              className="w-full sm:w-auto px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-black/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-1"
            >
              Explore Services <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login-selection" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-gray-50 border border-gray-200 transition-all flex items-center justify-center hover:-translate-y-1"
            >
              Become a Provider
            </Link>
          </motion.div>
        </div>

        {/* Hero Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 pt-10 border-t border-gray-100"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div className="px-4">
              <div className="text-3xl md:text-4xl font-black mb-1">{stats.happyClients}</div>
              <div className="text-sm font-bold text-black/40 uppercase tracking-wider">Happy Clients</div>
            </div>
            <div className="px-4">
              <div className="text-3xl md:text-4xl font-black mb-1">{stats.verifiedPros}</div>
              <div className="text-sm font-bold text-black/40 uppercase tracking-wider">Verified Pros</div>
            </div>
            <div className="px-4">
              <div className="text-3xl md:text-4xl font-black mb-1">{stats.servicesOffered}</div>
              <div className="text-sm font-bold text-black/40 uppercase tracking-wider">Services Offered</div>
            </div>
            <div className="px-4">
              <div className="text-3xl md:text-4xl font-black mb-1">{stats.citiesServed}</div>
              <div className="text-sm font-bold text-black/40 uppercase tracking-wider">Cities Served</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
