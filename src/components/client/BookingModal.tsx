"use client";

import { useState, useEffect } from "react";
import { createBooking } from "@/actions/booking";
import { validateCoupon, getAvailableCoupons } from "@/actions/coupon";
import { X, Loader2, Calendar as CalendarIcon, Clock, MapPin, Tag, Check, TicketPercent, ChevronDown, ChevronUp, BookmarkPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/context/LocationContext";

type Service = {
  id: string;
  name: string;
  basePrice: number;
  iconUrl?: string | null;
  estimatedTime?: string | null;
};

type District = {
  id: string;
  name: string;
};

export default function BookingModal({
  services,
  districts = [],
  onClose,
  onSuccess,
}: {
  services: Service[];
  districts?: District[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Location logic
  const { activeLocation, locations, refreshLocations } = useLocation();
  const [district, setDistrict] = useState(activeLocation?.district || "");
  const [address, setAddress] = useState(activeLocation?.address || "");
  const [phone, setPhone] = useState(activeLocation?.phone || "");
  const [saveNewLocation, setSaveNewLocation] = useState(false);
  const [newLocationLabel, setNewLocationLabel] = useState("");

  const isDifferentLocation = !activeLocation || district !== activeLocation.district || address !== activeLocation.address;
  const canSaveMoreLocations = locations.length < 4;

  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; name: string; discountAmount: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<{ id: string, error: string } | null>(null);
  const [selectedCouponForDesc, setSelectedCouponForDesc] = useState<{ name: string; description: string } | null>(null);
  
  const totalBasePrice = services.reduce((acc, s) => acc + s.basePrice, 0);
  const finalPrice = appliedCoupon ? Math.max(0, totalBasePrice - appliedCoupon.discountAmount) : totalBasePrice;

  useEffect(() => {
    const fetchCoupons = async () => {
      const res = await getAvailableCoupons();
      if (res.success && res.coupons) {
        setAvailableCoupons(res.coupons);
      }
      setLoadingCoupons(false);
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = async (couponId: string) => {
    setValidatingCoupon(couponId);
    setCouponError(null);
    
    const res = await validateCoupon(couponId, totalBasePrice);
    if (res.error) {
      setCouponError({ id: couponId, error: res.error });
      setAppliedCoupon(null);
    } else if (res.success && res.coupon) {
      setAppliedCoupon({
        id: res.coupon.id,
        name: res.coupon.name,
        discountAmount: res.coupon.discountAmount
      });
      setCouponError(null);
    }
    setValidatingCoupon(null);
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    let hasError = false;

    // Call createBooking for each service in the cart
    for (const service of services) {
      const singleFormData = new FormData();
      singleFormData.append("serviceId", service.id);
      singleFormData.append("date", formData.get("date") as string);
      singleFormData.append("timeSlot", formData.get("timeSlot") as string);
      
      const districtName = formData.get("district") as string;
      const rawAddress = formData.get("address") as string;
      const contactPhone = formData.get("phone") as string;
      const fullAddress = `${districtName}, ${rawAddress}\nContact: ${contactPhone}`;
      
      singleFormData.append("address", fullAddress);
      
      if (appliedCoupon) {
        singleFormData.append("couponId", appliedCoupon.id);
      }
      
      const res = await createBooking(singleFormData);
      if (res.error) {
        hasError = true;
        setError(`Failed to book ${service.name}: ${res.error}`);
        break;
      }
    }

    if (!hasError && saveNewLocation && newLocationLabel.trim()) {
      try {
        await fetch("/api/client/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: newLocationLabel.trim(),
            district: district,
            address: address,
            phone: phone
          })
        });
        await refreshLocations();
      } catch (err) {
        console.error("Failed to save location", err);
      }
    }

    setLoading(false);

    if (!hasError) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Complete Your Booking</h2>
            <p className="text-sm text-gray-500 mt-1">Provide your details to confirm {services.length} {services.length === 1 ? 'service' : 'services'}.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-gray-50 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-8 py-8 flex-1 custom-scrollbar">
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            
            {/* Left Column: Summary */}
            <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100/80 relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 to-gray-300" />
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-xs uppercase tracking-widest">
                  Order Summary
                </h3>
                
                <div className="space-y-4 mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {services.map(s => (
                    <div key={s.id} className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-white rounded-xl border border-gray-200/60 flex items-center justify-center shadow-sm flex-shrink-0 text-sm">
                          {s.iconUrl || "✨"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm leading-snug pt-1">{s.name}</p>
                          {s.estimatedTime && (
                            <p className="text-[10px] text-gray-500 mt-0.5">{s.estimatedTime}</p>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 text-sm whitespace-nowrap pt-1">${s.basePrice.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                {/* Coupon Section */}
                <div className="mb-6 pt-4 border-t border-gray-200/60">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-3 uppercase tracking-wide">
                    <Tag className="w-3.5 h-3.5 text-gray-400" /> Available Offers
                  </label>
                  
                  {!appliedCoupon ? (
                    <div className="space-y-3">
                      {loadingCoupons ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                      ) : availableCoupons.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No offers available right now.</p>
                      ) : (
                        availableCoupons.map((coupon) => (
                          <div key={coupon.id} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm hover:border-gray-300 transition-colors">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <TicketPercent className="w-5 h-5 text-blue-600" />
                                <h4 className="font-bold text-gray-900">{coupon.name}</h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleApplyCoupon(coupon.id)}
                                disabled={validatingCoupon !== null}
                                className="text-xs font-bold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                              >
                                {validatingCoupon === coupon.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-2" /> : "Apply"}
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-gray-600">
                                {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                                <span className="text-gray-400 ml-2 font-normal">
                                  Valid till {new Date(coupon.expiryDate).toLocaleDateString()}
                                </span>
                              </p>
                              
                              {coupon.description && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCouponForDesc({ name: coupon.name, description: coupon.description })}
                                  className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5 underline underline-offset-2"
                                >
                                  View Description
                                </button>
                              )}
                            </div>
                            
                            {couponError?.id === coupon.id && (
                              <p className="text-xs text-red-500 font-medium mt-3 bg-red-50 p-2 rounded-lg">{couponError?.error}</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-green-800 flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> {appliedCoupon.name} Applied
                        </span>
                        <span className="text-xs text-green-600 font-medium mt-0.5">-${appliedCoupon.discountAmount.toFixed(2)}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="p-1.5 hover:bg-green-100 rounded-lg text-green-700 transition-colors"
                        title="Remove coupon"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="pt-5 border-t border-gray-200/60 flex flex-col gap-2 mt-auto">
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-900">${totalBasePrice.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-${appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
                    <span className="text-gray-500 font-medium text-sm">Total Estimate</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tight">${finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" /> Select Date
                    </label>
                    <input 
                      type="date" 
                      name="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-900 transition-all font-medium text-gray-900 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" /> Preferred Time
                    </label>
                    <div className="relative">
                      <select 
                        name="timeSlot"
                        required
                        defaultValue=""
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-900 transition-all font-medium text-gray-900 appearance-none shadow-sm"
                      >
                        <option value="" disabled hidden>Choose a slot...</option>
                        <option value="MORNING">Morning (8 AM - 12 PM)</option>
                        <option value="AFTERNOON">Afternoon (12 PM - 4 PM)</option>
                        <option value="EVENING">Evening (4 PM - 8 PM)</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> District
                  </label>
                  <div className="relative">
                    <select 
                      name="district"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-900 transition-all font-medium text-gray-900 appearance-none shadow-sm"
                    >
                      <option value="" disabled hidden>Select your district...</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> Detailed Address
                  </label>
                  <textarea 
                    name="address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter the full street address..."
                    rows={3}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-900 transition-all font-medium text-gray-900 resize-none shadow-sm placeholder:text-gray-400 leading-relaxed"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> Contact Number
                  </label>
                  <input 
                    type="tel"
                    name="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-900 transition-all font-medium text-gray-900 shadow-sm placeholder:text-gray-400"
                  />
                </div>

                {isDifferentLocation && canSaveMoreLocations && district && address && phone.length === 10 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex flex-shrink-0 mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={saveNewLocation}
                          onChange={(e) => setSaveNewLocation(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded border-2 border-blue-200 bg-white peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-colors"></div>
                        <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                          <BookmarkPlus className="w-4 h-4" /> Save this location for next time?
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">You can save up to {4 - locations.length} more locations.</p>
                      </div>
                    </label>

                    {saveNewLocation && (
                      <div className="mt-3 ml-8 animate-in fade-in slide-in-from-top-1">
                        <input
                          type="text"
                          value={newLocationLabel}
                          onChange={(e) => setNewLocationLabel(e.target.value)}
                          placeholder="Label (e.g. Home, Mom's House)"
                          required
                          className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-gray-400"
                        />
                      </div>
                    )}
                  </div>
                )}

              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-6 z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <p className="text-xs text-gray-500 font-medium max-w-sm text-center sm:text-left leading-relaxed">
            By confirming, you agree to our cancellation policy. Payment is securely processed <strong className="text-gray-900">after</strong> the service is completed.
          </p>
          <button 
            type="submit" 
            form="booking-form"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl shadow-gray-900/20 hover:bg-black hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Booking"}
          </button>
        </div>
      </div>
      
      {/* Description Popup Modal */}
      {selectedCouponForDesc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-300">
            <button 
              type="button"
              onClick={() => setSelectedCouponForDesc(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4 pr-10">{selectedCouponForDesc.name}</h3>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {selectedCouponForDesc.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
