export const dynamic = 'force-dynamic';
import { Briefcase, CalendarClock, Bell, CheckCircle2, Clock, CheckSquare, Search, MapPin, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ProfileMenu from "@/components/employee/ProfileMenu";
import EmployeeNotificationBell from "@/components/employee/EmployeeNotificationBell";
import Link from "next/link";

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "EMPLOYEE") {
    redirect("/login/employee");
  }

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: session.user.id }
  });

  const allJobs = await prisma.booking.findMany({
    where: { employeeId: session.user.id },
    include: { client: true, service: true, payment: true },
    orderBy: { date: "asc" }
  });

  const settings = await prisma.paymentSettings.findFirst() || { employeeShare: 70 };

  const activeJobs = allJobs.filter(j => ["ASSIGNED", "ON_THE_WAY", "IN_PROGRESS"].includes(j.status));
  
  const stats = {
    total: allJobs.length,
    pending: allJobs.filter(j => j.status === 'ASSIGNED').length,
    inProgress: allJobs.filter(j => j.status === 'ON_THE_WAY' || j.status === 'IN_PROGRESS').length,
    completed: allJobs.filter(j => j.status === 'COMPLETED').length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight hidden sm:block">ProPortal</span>
        </div>
        
        <div className="flex-1 max-w-xl mx-4 sm:mx-8 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search assignments..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white rounded-full focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all outline-none text-sm font-medium"
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
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">Good day, {session.user.name}</h1>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  profile?.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {profile?.status}
                </div>
              </div>
              <p className="text-black/60 text-lg">You have <strong className="text-black">{activeJobs.length}</strong> active assignments to take care of today.</p>
            </div>
            
            <div className="relative z-10 flex gap-3">
              <button className="px-6 py-3 bg-black text-white font-bold rounded-xl shadow-lg shadow-black/10 hover:bg-black/90 hover:-translate-y-0.5 transition-all">
                View Schedule
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Assigned</p>
              <p className="text-3xl font-black">{stats.total}</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Jobs</p>
              <p className="text-3xl font-black">{stats.pending}</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">In Progress</p>
              <p className="text-3xl font-black">{stats.inProgress}</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Completed</p>
              <p className="text-3xl font-black">{stats.completed}</p>
            </div>
          </div>

          {/* Active Assignments */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shadow-md">
                  <CalendarClock className="w-4 h-4" />
                </div>
                Active Assignments
              </h2>
              <Link href="/employee/history" className="text-sm font-bold text-blue-600 hover:text-blue-700">View History</Link>
            </div>
            
            {activeJobs.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold mb-1">No Active Jobs</h3>
                <p className="text-gray-500">You are all caught up! New assignments will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeJobs.map(job => (
                  <div key={job.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
                    <div className="p-6 border-b border-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          {job.service.iconUrl ? (
                            <img src={job.service.iconUrl} alt={job.service.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                              <Briefcase className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{job.service.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                job.status === 'ASSIGNED' ? 'bg-yellow-100 text-yellow-700' :
                                job.status === 'ON_THE_WAY' ? 'bg-blue-100 text-blue-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {job.status.replace(/_/g, ' ')}
                              </span>
                              <span className="text-sm font-semibold text-green-600">
                                ₹{(job.payment?.employeeShareAmount ?? (job.service.basePrice * (settings.employeeShare / 100))).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mt-6">
                        <div className="flex items-start gap-3">
                          <CalendarClock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{job.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            <p className="text-sm text-gray-500">{job.timeSlot}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <UserIcon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{job.client.name}</p>
                            <p className="text-sm text-gray-500">{job.client.phone || "No phone provided"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-600 leading-relaxed">{job.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 mt-auto">
                      <form action={async () => {
                        "use server";
                        
                        let nextStatus = "ON_THE_WAY";
                        if (job.status === "ON_THE_WAY") nextStatus = "IN_PROGRESS";
                        else if (job.status === "IN_PROGRESS") nextStatus = "COMPLETED";

                        const updatedBooking = await prisma.booking.update({ 
                          where: { id: job.id }, 
                          data: { status: nextStatus as any },
                          include: { client: true, service: true }
                        });
                        
                        if (nextStatus === "COMPLETED") {
                          const { sendEmail } = await import("@/lib/email");
                          await sendEmail({
                            to: updatedBooking.client.email,
                            subject: "Service Completed - Helping Hands",
                            body: `Hi ${updatedBooking.client.name},\n\nYour ${updatedBooking.service.name} has been successfully completed. Thank you for choosing Helping Hands!\nPlease log in to your dashboard to leave a review.\n\nBest,\nHelping Hands Team`
                          });
                        }

                        revalidatePath("/employee/dashboard");
                      }}>
                        <button type="submit" className="w-full py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                          {job.status === "ASSIGNED" ? "Start Travel to Location" : 
                           job.status === "ON_THE_WAY" ? "Start Service Work" : 
                           "Mark Job as Completed"}
                           <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center ml-2">
                             <CheckCircle2 className="w-3 h-3 text-white" />
                           </div>
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
