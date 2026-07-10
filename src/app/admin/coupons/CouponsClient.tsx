"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Ticket, Check, X } from "lucide-react";
import { createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } from "@/actions/coupon";

type Coupon = {
  id: string;
  name: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minBookingAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimitPerClient: number | null;
  totalUsageLimit: number | null;
  currentUsageCount: number;
  startDate: Date;
  expiryDate: Date;
  isActive: boolean;
  description: string | null;
  _count: {
    bookings: number;
  };
};

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openAddModal = () => {
    setEditingCoupon(undefined);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, bookingsCount: number) => {
    if (bookingsCount > 0) {
      alert("Cannot delete coupon because it has been used in bookings.");
      return;
    }
    if (confirm("Are you sure you want to delete this coupon?")) {
      const res = await deleteCoupon(id);
      if (res.error) alert(res.error);
    }
  };
  
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleCouponStatus(id, currentStatus);
    if (res.error) alert(res.error);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    let res;
    
    if (editingCoupon) {
      res = await updateCoupon(editingCoupon.id, formData);
    } else {
      res = await createCoupon(formData);
    }

    if (res.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
    }
    setLoading(false);
  };

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-black/60 mt-1">Manage discount codes for your clients.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/90 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        {initialCoupons.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-black/20" />
            </div>
            <h3 className="text-lg font-bold">No coupons found</h3>
            <p className="text-black/60 mt-1">Get started by creating your first coupon.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-black/40 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold rounded-tl-xl">Name</th>
                  <th className="px-6 py-4 font-semibold">Discount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Usage</th>
                  <th className="px-6 py-4 font-semibold text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {coupon.name}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.currentUsageCount} {coupon.totalUsageLimit ? `/ ${coupon.totalUsageLimit}` : ""}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(coupon)}
                          className="p-2 text-black/40 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon.id, coupon._count.bookings)}
                          className={`p-2 rounded-lg transition-colors ${coupon._count.bookings > 0 ? "text-gray-300 cursor-not-allowed" : "text-red-400 hover:text-red-600 hover:bg-red-50"}`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCoupon ? "Edit Coupon" : "Add Coupon"}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form id="coupon-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
              )}
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Coupon Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={editingCoupon?.name}
                    required
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="e.g. Summer Sale"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type *</label>
                  <select 
                    name="discountType"
                    defaultValue={editingCoupon?.discountType || "PERCENTAGE"}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Value *</label>
                  <input 
                    type="number" 
                    name="discountValue" 
                    defaultValue={editingCoupon?.discountValue}
                    step="0.01"
                    min="0"
                    required
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min. Booking Amount (Optional)</label>
                  <input 
                    type="number" 
                    name="minBookingAmount" 
                    defaultValue={editingCoupon?.minBookingAmount || ""}
                    step="0.01"
                    min="0"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max. Discount Amount (Optional)</label>
                  <input 
                    type="number" 
                    name="maxDiscountAmount" 
                    defaultValue={editingCoupon?.maxDiscountAmount || ""}
                    step="0.01"
                    min="0"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Usage Limit Per Client (Optional)</label>
                  <input 
                    type="number" 
                    name="usageLimitPerClient" 
                    defaultValue={editingCoupon?.usageLimitPerClient || ""}
                    min="1"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Usage Limit (Optional)</label>
                  <input 
                    type="number" 
                    name="totalUsageLimit" 
                    defaultValue={editingCoupon?.totalUsageLimit || ""}
                    min="1"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    defaultValue={editingCoupon ? formatDateForInput(editingCoupon.startDate) : formatDateForInput(new Date())}
                    required
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date *</label>
                  <input 
                    type="date" 
                    name="expiryDate" 
                    defaultValue={editingCoupon ? formatDateForInput(editingCoupon.expiryDate) : ""}
                    required
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea 
                  name="description" 
                  defaultValue={editingCoupon?.description || ""}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive"
                  defaultChecked={editingCoupon ? editingCoupon.isActive : true}
                  className="w-4 h-4 rounded text-black focus:ring-black/5"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Coupon is Active</label>
              </div>
            </form>

            <div className="p-6 flex justify-end gap-3 border-t border-gray-100 bg-white rounded-b-3xl">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
                className="px-5 py-2.5 text-black/60 font-medium hover:text-black hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="coupon-form"
                disabled={loading}
                className="px-5 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-black/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
