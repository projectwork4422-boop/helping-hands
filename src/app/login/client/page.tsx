"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User, Phone, CheckCircle2 } from "lucide-react";
import { registerClient } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    if (isLogin) {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        role: "CLIENT",
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/client/dashboard");
        router.refresh();
      }
    } else {
      const res = await registerClient(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsLogin(true); // Switch to login after successful registration
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full mx-auto relative z-10">
        <Link href="/login-selection" className="inline-flex items-center text-sm font-medium text-black/40 hover:text-black mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Roles
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-black" />
          
          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2 tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-black/60 text-sm">
              {isLogin 
                ? "Enter your credentials to access your client portal." 
                : "Register in seconds to start booking premium home services."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-start gap-3 overflow-hidden"
              >
                <div className="mt-0.5 shrink-0">⚠️</div>
                <div>{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <form action={handleSubmit} className="space-y-5">
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-2">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <input type="text" name="name" required={!isLogin} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium" placeholder="Jane Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-2">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input type="tel" name="phone" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium" placeholder="+91 9876543210" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input type="email" name="email" required className="w-full pl-11 pr-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium" placeholder="jane@example.com" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60">Password</label>
                {isLogin && <Link href="#" className="text-xs font-bold text-black/40 hover:text-black transition-colors">Forgot?</Link>}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input type="password" name="password" required className="w-full pl-11 pr-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-black/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all mt-8 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                isLogin ? "Sign In Securely" : "Create Account"
              )}
            </button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm font-medium text-black/60"
        >
          {isLogin ? "New to Helping Hands?" : "Already a member?"}{" "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }} 
            className="text-black font-bold hover:underline underline-offset-4 decoration-2 decoration-black/20"
          >
            {isLogin ? "Create an account" : "Sign in to your account"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
