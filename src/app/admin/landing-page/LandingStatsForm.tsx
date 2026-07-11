"use client";

import { useState } from "react";
import { updateLandingStats } from "@/actions/landingStats";
import { Save, RefreshCcw } from "lucide-react";


type StatsData = {
  happyClients: string;
  verifiedPros: string;
  servicesOffered: string;
  citiesServed: string;
  totalCustomers: string;
  servicesCompleted: string;
  activeProviders: string;
  averageRating: string;
};

export default function LandingStatsForm({ initialData }: { initialData: StatsData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StatsData>(initialData);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleReset = () => {
    setFormData(initialData);
    setMessage({ type: 'success', text: "Reset to last saved values." });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await updateLandingStats(formData);

    if (res.success) {
      setMessage({ type: 'success', text: "Landing page statistics updated successfully." });
    } else {
      setMessage({ type: 'error', text: res.error || "Failed to update statistics." });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.text}
        </div>
      )}
      
      {/* Section 1: Client Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-bold">Client Data</h2>
          <p className="text-sm text-gray-500">Updates the statistics displayed in the Hero section.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Happy Clients</label>
            <input
              type="text"
              name="happyClients"
              value={formData.happyClients}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="e.g. 10k+"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Verified Pros</label>
            <input
              type="text"
              name="verifiedPros"
              value={formData.verifiedPros}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="e.g. 500+"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Services Offered</label>
            <input
              type="text"
              name="servicesOffered"
              value={formData.servicesOffered}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="e.g. 50+"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cities Served</label>
            <input
              type="text"
              name="citiesServed"
              value={formData.citiesServed}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="e.g. 20+"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 2: Service Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-bold">Service Data</h2>
          <p className="text-sm text-gray-500">Updates the statistics displayed in the Customer Statistics section.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Total Customers</label>
            <input
              type="text"
              name="totalCustomers"
              value={formData.totalCustomers}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="e.g. 10,000+"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Services Completed</label>
            <input
              type="text"
              name="servicesCompleted"
              value={formData.servicesCompleted}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="e.g. 25,000+"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Active Providers</label>
            <input
              type="text"
              name="activeProviders"
              value={formData.activeProviders}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="e.g. 500+"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Average Rating</label>
            <input
              type="text"
              name="averageRating"
              value={formData.averageRating}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="e.g. 4.9/5 or 4.9"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCcw className="w-5 h-5" />
          Reset
        </button>
      </div>
    </form>
  );
}
