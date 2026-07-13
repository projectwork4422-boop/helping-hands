import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileMenu from "@/components/employee/ProfileMenu";
import { Briefcase, Search, ArrowLeft, User as UserIcon } from "lucide-react";
import Link from "next/link";
import EmployeeNotificationBell from "@/components/employee/EmployeeNotificationBell";
import ProfileForm from "./ProfileForm";

export default async function EmployeeProfilePage() {
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

  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    select: { name: true },
    orderBy: { name: 'asc' }
  });
  const serviceNames = allServices.map(s => s.name);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 sm:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 md:px-12 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-black/10 shrink-0">
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight hidden sm:block">ProPortal</span>
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
      
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <Link href="/employee/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm shrink-0 mt-1 sm:mt-0">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                My Profile
              </h1>
              <p className="text-xs sm:text-sm text-black/60 mt-1">Manage your personal information and profile settings.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-8">
            <ProfileForm user={user as any} profile={user.employeeProfile as any} allServices={serviceNames} />
          </div>
        </div>
      </main>
    </div>
  );
}
