"use client";

import { useState } from "react";
import { updatePaymentSettings } from "@/actions/settings";
import { Loader2 } from "lucide-react";

export default function SettingsForm({ initialSettings }: { initialSettings: { adminShare: number, employeeShare: number } }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [adminShare, setAdminShare] = useState(initialSettings.adminShare);
  const [employeeShare, setEmployeeShare] = useState(initialSettings.employeeShare);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (adminShare + employeeShare !== 100) {
      setError("Admin Share and Employee Share must total 100%.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("adminShare", adminShare.toString());
    formData.append("employeeShare", employeeShare.toString());

    const result = await updatePaymentSettings(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium">Settings saved successfully.</div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Admin Share (%)</label>
          <input 
            type="number" 
            value={adminShare}
            onChange={(e) => setAdminShare(parseInt(e.target.value) || 0)}
            required
            min="0"
            max="100"
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Employee Share (%)</label>
          <input 
            type="number" 
            value={employeeShare}
            onChange={(e) => setEmployeeShare(parseInt(e.target.value) || 0)}
            required
            min="0"
            max="100"
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-lg"
          />
        </div>
      </div>
      
      <div className="pt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500 font-medium">
          Total: <span className={adminShare + employeeShare === 100 ? "text-green-600" : "text-red-600"}>{adminShare + employeeShare}%</span>
        </div>
        <button 
          type="submit" 
          disabled={loading || adminShare + employeeShare !== 100}
          className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Settings
        </button>
      </div>
    </form>
  );
}
