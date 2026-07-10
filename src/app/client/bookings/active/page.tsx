export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientProfileMenu from "@/components/client/ClientProfileMenu";
import CartIcon from "@/components/client/CartIcon";
import { Bell, Clock, CalendarClock, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ActiveBookingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "CLIENT") {
    redirect("/login/client");
  }

  const activeBookings = await prisma.booking.findMany({
    where: { clientId: session.user.id, status: { in: ["PENDING", "ASSIGNED", "ON_THE_WAY", "IN_PROGRESS", "CANCELLED"] } },
    include: { service: true, employee: true },
    orderBy: { date: "asc" }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-12 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/client/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xl font-bold tracking-tight">Active Bookings</span>
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
              <Clock className="w-10 h-10 text-black/30" />
              Active Bookings
            </h1>
            <p className="text-black/60 text-lg mt-2">Track the status of your current service requests.</p>
          </div>

          <div className="space-y-4">
            {activeBookings.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Active Bookings</h3>
                <p className="text-black/60 mb-6">You don't have any ongoing service requests at the moment.</p>
                <Link href="/client/dashboard" className="px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-black/90 transition-colors inline-block">
                  Book a Service
                </Link>
              </div>
            ) : (
              activeBookings.map(b => {
                const isCancelled = b.status === "CANCELLED";
                const innerContent = (
                  <div className={`bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${!isCancelled ? "group-hover:border-black/20 group-hover:shadow-md" : "opacity-75"}`}>
                    <div>
                      <h3 className="font-bold text-xl group-hover:text-black/80 transition-colors">{b.service.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-black/60 flex items-center gap-2">
                          <CalendarClock className="w-4 h-4" /> {b.date.toLocaleDateString()} • {b.timeSlot}
                        </p>
                        {b.service.estimatedTime && (
                          <p className="text-gray-500 flex items-center gap-1.5 text-sm">
                            <Clock className="w-4 h-4" /> {b.service.estimatedTime}
                          </p>
                        )}
                      </div>
                      {b.status === "CANCELLED" ? (
                        <div className="mt-4 flex flex-col gap-1.5">
                          <span className="inline-flex px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-bold w-fit">
                            Status: Cancelled
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            Cancelled on: {b.updatedAt.toLocaleDateString()} at {b.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            Cancellation Reason: Client Cancelled
                          </span>
                        </div>
                      ) : (
                        <div className="mt-4 inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold">
                          Status: {
                            b.status === "ASSIGNED" ? `Assigned to ${b.employee?.name}` : 
                            b.status === "ON_THE_WAY" ? `${b.employee?.name} is on the way` :
                            b.status === "IN_PROGRESS" ? `Service in progress` :
                            "Pending Assignment"
                          }
                        </div>
                      )}
                    </div>
                    {!isCancelled && (
                      <div className="text-black/30 group-hover:text-black transition-colors md:mr-2">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                );

                return isCancelled ? (
                  <div key={b.id} className="block">
                    {innerContent}
                  </div>
                ) : (
                  <Link href={`/client/booking/${b.id}`} key={b.id} className="block group">
                    {innerContent}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
