import { getPaymentSettings } from "@/actions/settings";
import SettingsForm from "./SettingsForm";
import { Settings } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PaymentSettingsPage() {
  const settings = await getPaymentSettings();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-black" />
          Global Payment Settings
        </h1>
        <p className="text-black/60">Configure the platform-wide revenue distribution between Admin and Employees for all services.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8">
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
