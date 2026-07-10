import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileMenu from "@/components/employee/ProfileMenu";
import EmployeeNotificationBell from "@/components/employee/EmployeeNotificationBell";
import { Briefcase, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import EmployeeNotificationsClient from "./EmployeeNotificationsClient";

export default async function EmployeeNotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "EMPLOYEE") {
    redirect("/login/employee");
  }

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: session.user.id }
  });

  const notifications = await prisma.employeeNotification.findMany({
    where: { employeeId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

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
          <ProfileMenu userName={session.user.name} profileStatus={profile?.status} />
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex items-center gap-4">
            <Link href="/employee/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
              <p className="text-gray-500 font-medium mt-1">Stay updated on your new job assignments.</p>
            </div>
          </div>

          <EmployeeNotificationsClient initialNotifications={notifications as any} />
        </div>
      </main>
    </div>
  );
}
