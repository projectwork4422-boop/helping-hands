export const dynamic = 'force-dynamic';
import { Users, Briefcase, CalendarCheck, DollarSign, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";

import Link from "next/link";
import RegistrationRequestCard from "@/components/admin/RegistrationRequestCard";

export default async function AdminOverview() {
  // Fetch live stats
  const settings = await prisma.paymentSettings.findFirst() || { employeeShare: 70 };
  
  const [clientCount, employeeCount, todayBookings, payments] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.booking.count({ 
      where: { 
        createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } 
      } 
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" }
    })
  ]);

  const totalRevenue = payments._sum.amount || 0;
  const employeePayout = (totalRevenue * settings.employeeShare) / 100;
  const adminEarnings = totalRevenue - employeePayout;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch Pending Approvals
  const pendingEmployees = await prisma.employeeProfile.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  // Fetch Recent Bookings
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: true, service: true }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Overview</h1>
        <p className="text-black/60">Welcome back to the Admin Portal. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Clients" value={clientCount.toString()} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Total Professionals" value={employeeCount.toString()} icon={<Briefcase className="w-5 h-5" />} />
        <StatCard title="Bookings Today" value={todayBookings.toString()} icon={<CalendarCheck className="w-5 h-5" />} />
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSign className="w-5 h-5" />} />
        <StatCard title="Total Employee Payout" value={formatCurrency(employeePayout)} icon={<DollarSign className="w-5 h-5 text-green-600" />} />
        <StatCard title="Admin Earnings" value={formatCurrency(adminEarnings)} icon={<DollarSign className="w-5 h-5 text-blue-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5" /> Employee Registration Requests
            </h2>
            <Link href="/admin/requests" className="text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {pendingEmployees.length === 0 ? (
              <p className="text-black/60 text-sm">No pending approvals.</p>
            ) : (
              pendingEmployees.map((emp) => (
                <RegistrationRequestCard key={emp.id} emp={emp} />
              ))
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarCheck className="w-5 h-5" /> Recent Bookings
            </h2>
            <button className="text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <p className="text-black/60 text-sm">No recent bookings.</p>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold">{booking.service.name}</p>
                    <p className="text-sm text-black/60">Client: {booking.client.name} • {booking.date.toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {booking.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-black">
        {icon}
      </div>
      <div>
        <p className="text-sm text-black/60 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
