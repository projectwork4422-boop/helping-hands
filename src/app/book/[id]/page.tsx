"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";

// Mock data matching the explore page
const services = {
  "1": { name: "Electrician", price: "$50/hr" },
  "2": { name: "Plumber", price: "$60/hr" },
  "3": { name: "Carpenter", price: "$45/hr" },
  "4": { name: "Painter", price: "$40/hr" },
  "5": { name: "Handyman", price: "$35/hr" },
  "6": { name: "Gardener", price: "$30/hr" },
};

import { createBooking } from "@/actions/booking";

export default function BookService() {
  const params = useParams();
  const serviceId = params.id as string;
  const service = (services as any)[serviceId] || { name: "Service", price: "$50/hr" };

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Store form data state across steps
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState("");

  const handleDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.append("serviceId", serviceId);
    setFormData(data);
    setStep(2);
  };

  const handlePayment = async () => {
    if (!formData) return;
    setIsProcessing(true);
    setError("");
    
    // Simulate Razorpay delay then call backend
    setTimeout(async () => {
      const res = await createBooking(formData);
      setIsProcessing(false);
      
      if (res.error) {
        setError(res.error);
        setStep(1); // Go back if error (e.g. not logged in)
      } else {
        setStep(3); // Success step
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="container mx-auto max-w-3xl">
        <Link href="/explore" className="inline-flex items-center text-sm font-medium hover:text-black/70 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Link>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          
          {step === 1 && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Book {service.name}</h1>
                <p className="text-black/60">Fill in the details below to schedule your appointment.</p>
              </div>

              <form className="space-y-8" onSubmit={handleDetailsSubmit}>
                {/* Date & Time */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Calendar className="w-5 h-5" /> Date & Time
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Date</label>
                      <input type="date" name="date" required className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time Slot</label>
                      <select name="timeSlot" required className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white">
                        <option value="">Select a time</option>
                        <option>09:00 AM - 11:00 AM</option>
                        <option>12:00 PM - 02:00 PM</option>
                        <option>03:00 PM - 05:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MapPin className="w-5 h-5" /> Service Location
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Address</label>
                    <textarea name="address" required className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none h-24" placeholder="Enter your full street address, apartment number, etc."></textarea>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-black text-white font-medium py-4 rounded-xl hover:bg-black/90 transition-colors">
                    Continue to Payment
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
                <p className="text-black/60">Review your booking and complete the payment.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-200">
                <h3 className="font-bold mb-4 border-b border-gray-200 pb-2">Order Summary</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-black/70">Service</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-black/70">Base Rate</span>
                  <span className="font-medium">{service.price}</span>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                  <span className="font-bold text-lg">Total Estimate</span>
                  <span className="font-bold text-lg">{service.price}</span>
                </div>
              </div>

              <button 
                onClick={handlePayment} 
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white font-medium py-4 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processing Payment via Razorpay...</span>
                ) : (
                  <>Pay Securely with Razorpay</>
                )}
              </button>
              <button 
                onClick={() => setStep(1)} 
                className="w-full bg-transparent text-black font-medium py-4 rounded-xl hover:bg-gray-100 transition-colors mt-2"
              >
                Back to Details
              </button>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-4">Booking Confirmed!</h1>
              <p className="text-black/60 max-w-md mx-auto mb-10">
                Your payment was successful and your booking request has been sent to our admin team. We will assign a professional to you shortly.
              </p>
              <Link 
                href="/explore" 
                className="inline-block px-8 py-4 bg-black text-white font-medium rounded-xl hover:bg-black/90 transition-colors"
              >
                Return to Services
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
