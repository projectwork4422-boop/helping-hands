import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileMenu from "@/components/employee/ProfileMenu";
import { Briefcase, Search, ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import EmployeeNotificationBell from "@/components/employee/EmployeeNotificationBell";
import SettingsForm from "./SettingsForm";

export default async function EmployeeSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "EMPLOYEE") {
    redirect("/login/employee");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { employeeProfile: true }
  });

  if (!user || !user.employeeProfile) {
    redirect("/login/employee");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight hidden sm:block">ProPortal</span>
        </div>
        
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white rounded-full focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all outline-none text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <EmployeeNotificationBell />
          <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>
          <ProfileMenu userName={user.name} profileStatus={user.employeeProfile.status} />
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="flex items-center gap-4">
            <Link href="/employee/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                Account Settings
              </h1>
              <p className="text-black/60 mt-1">Manage your security and application preferences.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8">
              <SettingsForm />
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8">
              <h3 className="font-bold text-lg text-gray-900 border-b pb-4 mb-6">Notification Preferences</h3>
              <p className="text-sm text-gray-500 mb-6">Choose how you want to be notified about new assignments and updates.</p>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div>
                    <span className="block font-bold text-gray-900 text-sm">Email Notifications</span>
                    <span className="block text-sm text-gray-500">Receive an email when you are assigned a new job</span>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                    <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-black cursor-pointer"></label>
                  </div>
                </label>
                
                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div>
                    <span className="block font-bold text-gray-900 text-sm">SMS Alerts</span>
                    <span className="block text-sm text-gray-500">Get text messages for immediate assignment changes</span>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle2" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                    <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </label>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Basic toggle CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .toggle-checkbox:checked {
          right: 0;
          border-color: #000;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #000;
        }
        .toggle-checkbox {
          right: 20px;
          border-color: #d1d5db;
          transition: all 0.3s;
        }
      `}} />
    </div>
  );
}
