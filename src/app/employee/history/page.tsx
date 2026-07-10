export const dynamic = 'force-dynamic';
import { Briefcase, Bell, Search, History, ArrowLeft, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileMenu from "@/components/employee/ProfileMenu";
import EmployeeNotificationBell from "@/components/employee/EmployeeNotificationBell";
import Link from "next/link";

export default async function EmployeeHistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "EMPLOYEE") {
    redirect("/login/employee");
  }

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: session.user.id }
  });

  const completedJobs = await prisma.booking.findMany({
    where: { 
      employeeId: session.user.id,
      status: "COMPLETED"
    },
    include: { 
      client: true, 
      service: true,
      payment: true 
    },
    orderBy: { date: "desc" }
  });

  const settings = await prisma.paymentSettings.findFirst() || { employeeShare: 70 };

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
              placeholder="Search history..." 
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
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex items-center gap-4">
            <Link href="/employee/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                Job History & Earnings
              </h1>
              <p className="text-black/60 mt-1">Review your completed jobs and total earnings.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-black/60">
                  <tr>
                    <th className="px-6 py-4 font-medium">Service Name</th>
                    <th className="px-6 py-4 font-medium">Booking ID</th>
                    <th className="px-6 py-4 font-medium">Client Name</th>
                    <th className="px-6 py-4 font-medium text-right">Employee Earnings</th>
                    <th className="px-6 py-4 font-medium">Payment Status</th>
                    <th className="px-6 py-4 font-medium">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-black/60">
                        <div className="flex flex-col items-center justify-center">
                          <History className="w-12 h-12 text-gray-200 mb-3" />
                          <p>No completed jobs found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    completedJobs.map((job) => {
                      const totalEarnings = job.payment?.employeeShareAmount ?? (job.service.basePrice * (settings.employeeShare / 100));
                      const paymentStatus = job.payment?.status || job.paymentStatus || "PENDING";
                      const paymentDate = job.payment?.createdAt || job.createdAt;
                      
                      return (
                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 text-base">{job.service.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-gray-500 font-mono">{job.id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{job.client.name}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-black text-green-600 text-lg">
                              ₹{totalEarnings.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {paymentStatus === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-black/70">
                            {paymentDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
