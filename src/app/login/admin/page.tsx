"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      role: "ADMIN",
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/admin");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      {/* Dark mode background blobs for Admin */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full mx-auto relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2 tracking-tight text-white">
              Admin Portal
            </h2>
            <p className="text-gray-400 text-sm">
              Authorized personnel only. Please sign in to continue.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium flex items-start gap-3 overflow-hidden"
              >
                <div className="mt-0.5 shrink-0">⚠️</div>
                <div>{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Admin Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input suppressHydrationWarning type="email" name="email" required className="w-full pl-11 pr-4 py-3.5 bg-black/40 hover:bg-black/60 focus:bg-black/80 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-white placeholder:text-gray-600" placeholder="admin@helpinghands.com" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  suppressHydrationWarning 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  className="w-full pl-11 pr-12 py-3.5 bg-black/40 hover:bg-black/60 focus:bg-black/80 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-white placeholder:text-gray-600" 
                  placeholder="••••••••" 
                />
                <button 
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button suppressHydrationWarning type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-100 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-8 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
              {loading ? (
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
              ) : (
                "Authenticate Securely"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login-selection" className="text-sm font-medium text-gray-500 hover:text-white transition-colors">
              Return to public login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
