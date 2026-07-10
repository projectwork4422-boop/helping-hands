export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientProfileMenu from "@/components/client/ClientProfileMenu";
import CartIcon from "@/components/client/CartIcon";
import { Bell, Settings, ArrowLeft, User, Mail, Shield } from "lucide-react";
import Link from "next/link";

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "CLIENT") {
    redirect("/login/client");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-12 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/client/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xl font-bold tracking-tight">Profile Settings</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><Bell className="w-5 h-5" /></button>
          <CartIcon />
          <ClientProfileMenu userName={session.user.name || "Client"} />
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-4">
              <Settings className="w-10 h-10 text-black/30" />
              Profile Settings
            </h1>
            <p className="text-black/60 text-lg mt-2">Manage your account details and preferences.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-black/50" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-black/60 mb-2">Full Name</label>
                  <input type="text" disabled value={session.user.name || ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black/70 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black/60 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                    <input type="email" disabled value={session.user.email || ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-black/70 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-black/50" /> Security
              </h2>
              <p className="text-black/60 mb-4">To change your password or security settings, please contact support.</p>
              <button disabled className="px-6 py-3 bg-gray-100 text-black/40 font-medium rounded-xl cursor-not-allowed">Change Password</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
