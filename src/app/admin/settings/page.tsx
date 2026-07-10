import { Bell, Shield, Wallet } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-black/60">Configure your platform preferences and global settings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
        
        {/* Section 1 */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-black" />
            <h2 className="text-lg font-bold">Platform Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Require Email Verification</p>
                <p className="text-sm text-black/60">New professionals must verify their email before applying.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="w-5 h-5 text-black" />
            <h2 className="text-lg font-bold">Billing & Payouts</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Automatic Payouts</p>
                <p className="text-sm text-black/60">Automatically disburse funds to employees after job completion.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            
            <div className="pt-4">
              <label className="block text-sm font-medium text-black mb-2">Platform Fee Percentage</label>
              <input type="number" defaultValue={10} className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5" />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-black" />
            <h2 className="text-lg font-bold">Admin Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">New Registration Alerts</p>
                <p className="text-sm text-black/60">Receive an email when a new employee registers.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex justify-end">
          <button className="px-6 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-black/80 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
