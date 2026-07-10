"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { registerEmployee } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type Service = {
  id: string;
  name: string;
  iconUrl: string | null;
  basePrice: number;
  category: Category | null;
};

export default function EmployeeLoginForm({ services }: { services: Service[] }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [aadhaarPreviews, setAadhaarPreviews] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const router = useRouter();

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const urls = files.map(file => URL.createObjectURL(file));
      setAadhaarPreviews(urls);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

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
        role: "EMPLOYEE",
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/employee/dashboard");
        router.refresh();
      }
    } else {
      const res = await registerEmployee(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Registration successful! Our team will review your profile. You can now log in.");
        setIsLogin(true); // Switch to login after successful registration
      }
    }
    setLoading(false);
  }

  return (
    <>
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in cursor-pointer"
          onClick={() => setFullScreenImage(null)}
        >
          <img 
            src={fullScreenImage} 
            alt="Preview" 
            className="max-w-full max-h-full rounded-2xl shadow-2xl" 
          />
          <button 
            className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md"
            onClick={() => setFullScreenImage(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px]" />
          <div className="absolute -top-[10%] right-[10%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-2xl w-full mx-auto relative z-10">
          <Link href="/login-selection" className="inline-flex items-center text-sm font-medium text-black/40 hover:text-black mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Roles
          </Link>
          
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black" />
            
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-2 tracking-tight">
                {isLogin ? "Professional Login" : "Join as a Professional"}
              </h2>
              <p className="text-black/60 text-sm">
                {isLogin 
                  ? "Welcome back! Enter your credentials to access your dashboard." 
                  : "Register to start receiving job assignments in your area."}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-start gap-3">
                <div className="mt-0.5 shrink-0">⚠️</div>
                <div>{error}</div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-sm font-medium flex items-start gap-3">
                <div className="mt-0.5 shrink-0">✅</div>
                <div>{success}</div>
              </div>
            )}

            <form action={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-2">Full Name</label>
                      <input type="text" name="name" required className="w-full px-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-2">Phone Number</label>
                      <input type="tel" name="phone" className="w-full px-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium" placeholder="+91 9876543210" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-2">Gender</label>
                      <select name="gender" className="w-full px-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium cursor-pointer">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-2">Date of Birth</label>
                      <input type="date" name="dob" className="w-full px-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium text-black/80" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-2">Residential Address</label>
                    <textarea name="address" className="w-full px-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium resize-none h-24" placeholder="Enter your full address"></textarea>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-black/60 mb-6">Expertise</h3>
                    
                    {Object.entries(
                      services.reduce((acc, service) => {
                        const catName = service.category?.name || "Other Services";
                        if (!acc[catName]) acc[catName] = [];
                        acc[catName].push(service);
                        return acc;
                      }, {} as Record<string, Service[]>)
                    ).map(([categoryName, categoryServices]) => (
                      <div key={categoryName} className="mb-6 last:mb-0">
                        <h4 className="font-semibold text-sm text-black mb-3">{categoryName}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryServices.map(service => (
                            <label key={service.id} className="group relative flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-black/20 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-all">
                              <input 
                                type="checkbox" 
                                name="services" 
                                value={service.name} 
                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black transition-all cursor-pointer" 
                              />
                              <span className="font-medium text-sm flex items-center gap-2">
                                {service.iconUrl && (
                                  <img src={service.iconUrl} alt="" className="w-5 h-5 object-cover" />
                                )}
                                {service.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-black/60 mb-6">Identity Verification</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold mb-2">Aadhaar Card (Front & Back)</label>
                        <input onChange={handleAadhaarChange} type="file" name="aadhaar" multiple accept="image/*" className="w-full text-sm text-black/60 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-gray-100 file:text-black hover:file:bg-gray-200 transition-colors cursor-pointer" />
                        <p className="text-xs font-bold text-black/40 uppercase tracking-wider mt-2 mb-4">Max 1MB per file</p>
                        {aadhaarPreviews.length > 0 && (
                          <div className="flex gap-4 overflow-x-auto pb-2">
                            {aadhaarPreviews.map((url, i) => (
                              <div key={i} className="relative group shrink-0">
                                <img 
                                  src={url} 
                                  alt={`Aadhaar ${i + 1}`} 
                                  className="h-24 w-36 object-cover rounded-xl border border-gray-200 cursor-zoom-in" 
                                  onClick={() => setFullScreenImage(url)}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none flex items-center justify-center text-white">
                                  <Eye className="w-6 h-6" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold mb-2">Passport-size Photograph</label>
                        <input onChange={handlePhotoChange} type="file" name="photo" accept="image/*" className="w-full text-sm text-black/60 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-gray-100 file:text-black hover:file:bg-gray-200 transition-colors cursor-pointer" />
                        <p className="text-xs font-bold text-black/40 uppercase tracking-wider mt-2 mb-4">Max 1MB</p>
                        {photoPreview && (
                          <div className="relative group inline-block">
                            <img 
                              src={photoPreview} 
                              alt="Passport Photo" 
                              className="h-24 w-24 object-cover rounded-xl border border-gray-200 cursor-zoom-in" 
                              onClick={() => setFullScreenImage(photoPreview)}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none flex items-center justify-center text-white">
                              <Eye className="w-6 h-6" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black/60 mb-2">Email Address</label>
                <input type="email" name="email" required className="w-full px-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium" placeholder="john@example.com" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-black/60">Password</label>
                  {isLogin && <Link href="#" className="text-xs font-bold text-black/40 hover:text-black transition-colors">Forgot?</Link>}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required 
                    className="w-full px-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-transparent focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium pr-12" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-black/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all mt-8 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  isLogin ? "Sign In Securely" : "Submit Registration"
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-black/60">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }} 
                className="text-black font-bold hover:underline underline-offset-4 decoration-2 decoration-black/20"
              >
                {isLogin ? "Register now" : "Log in instead"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
