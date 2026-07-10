"use client";

import Link from "next/link";
import { Briefcase, UserCircle, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginSelection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        className="max-w-2xl w-full text-center mb-16 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Welcome to Helping Hands</h1>
        <p className="text-black/60 text-lg">Choose your journey to get started with our platform.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10"
      >
        <motion.div variants={itemVariants}>
          <Link href="/login/client" className="group block h-full">
            <div className="p-10 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center h-full relative overflow-hidden group-hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-black transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <UserCircle className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-3">I am a Client</h2>
              <p className="text-black/60 mb-8 flex-1">Book professional home services, manage your appointments, and provide feedback.</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold bg-gray-50 px-6 py-3 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                Continue as Client <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Link href="/login/employee" className="group block h-full">
            <div className="p-10 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center h-full relative overflow-hidden group-hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-black transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Briefcase className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-3">I am a Professional</h2>
              <p className="text-black/60 mb-8 flex-1">Receive job assignments, track your earnings, and manage your expert profile.</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold bg-gray-50 px-6 py-3 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                Continue as Pro <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-16 text-center relative z-10"
      >
        <Link href="/login/admin" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-black/40 hover:text-black hover:bg-gray-100 rounded-lg transition-all">
          <Lock className="w-4 h-4" /> Admin Access
        </Link>
      </motion.div>
    </div>
  );
}
