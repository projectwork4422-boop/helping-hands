"use client";

import { useState } from "react";
import { approveEmployee, rejectEmployee } from "@/actions/admin";

type EmployeeProfileWithUser = {
  id: string;
  user: { name: string | null; email: string; phone: string | null };
  createdAt: Date;
  gender: string | null;
  dob: Date | null;
  address: string | null;
  aadhaarFrontUrl: string | null;
  photoUrl: string | null;
  services: string[];
};

export default function RegistrationRequestCard({ emp }: { emp: EmployeeProfileWithUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "approve" | "reject") {
    setLoading(true);
    if (action === "approve") {
      await approveEmployee(emp.id);
    } else {
      await rejectEmployee(emp.id);
    }
    setIsOpen(false);
    setLoading(false);
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="font-bold">{emp.user.name}</p>
          <p className="text-sm text-black/60" suppressHydrationWarning>Applied {new Date(emp.createdAt).toLocaleDateString()}</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="text-sm font-medium hover:underline px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          View Details
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold">Registration Details</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-start gap-4">
                {emp.photoUrl ? (
                  <div className="relative w-24 h-24 shrink-0">
                    <img 
                      src={emp.photoUrl} 
                      alt="Photo" 
                      className="w-full h-full rounded-xl object-cover border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback');
                        if (fallback) fallback.classList.remove('hidden');
                      }} 
                    />
                    <div className="fallback hidden w-full h-full rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400 text-center p-2">
                      Image unavailable
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 shrink-0 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">No Photo</div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{emp.user.name}</h3>
                  <p className="text-black/60">{emp.user.email}</p>
                  <p className="text-black/60">{emp.user.phone || "No phone provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Gender</p>
                  <p className="font-medium">{emp.gender || "Not specified"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                  <p className="font-medium" suppressHydrationWarning>{emp.dob ? new Date(emp.dob).toLocaleDateString() : "Not specified"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="font-medium">{emp.address || "Not specified"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3 border-b border-gray-100 pb-2">Selected Services</h4>
                {emp.services && emp.services.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {emp.services.map(s => (
                      <span key={s} className="px-3 py-1 bg-black/5 text-black rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No services selected.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold mb-3 border-b border-gray-100 pb-2">Identity Document</h4>
                {emp.aadhaarFrontUrl ? (
                  <div className="relative">
                    <img 
                      src={emp.aadhaarFrontUrl} 
                      alt="Aadhaar" 
                      className="max-w-full rounded-xl border border-gray-200" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="fallback hidden w-full h-48 rounded-xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400">
                      <span className="text-2xl mb-2">⚠️</span>
                      <p className="text-sm">Image unavailable or corrupted.</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No document provided.</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                disabled={loading}
                onClick={() => handleAction("reject")}
                className="px-6 py-2.5 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {loading ? "..." : "Reject"}
              </button>
              <button 
                disabled={loading}
                onClick={() => handleAction("approve")}
                className="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {loading ? "..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
