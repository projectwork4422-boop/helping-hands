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
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex items-center gap-4">
            <Link href="/employee/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
                My Profile
              </h1>
              <p className="text-black/60 mt-1">Manage your personal information and profile settings.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8">
            <ProfileForm user={user as any} profile={user.employeeProfile as any} allServices={serviceNames} />
          </div>
        </div>
      </main>
    </div>
  );
}
