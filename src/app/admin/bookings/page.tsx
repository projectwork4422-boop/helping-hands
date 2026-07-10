import { prisma } from "@/lib/prisma";
import { CheckCircle, Clock, Search, UserCheck, Star } from "lucide-react";
import Link from "next/link";
import AllocationCell from "./AllocationCell";

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      client: true,
      service: true,
      employee: true,
      review: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Bookings</h1>
        <p className="text-black/60">View and manage all service bookings across the platform.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-black/60">
              <tr>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Assigned Professional</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Feedback</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-black/60">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-black">
                      {booking.service.name}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {booking.client.name}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      <AllocationCell
                        bookingId={booking.id}
                        serviceName={booking.service.name}
                        currentEmployeeId={booking.employee?.id || null}
                        currentEmployeeName={booking.employee?.name || null}
                        status={booking.status}
                        date={booking.date.toISOString()}
                        timeSlot={booking.timeSlot}
                      />
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'COMPLETED' && <CheckCircle className="w-3.5 h-3.5" />}
                        {booking.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                        {booking.status === 'ASSIGNED' && <UserCheck className="w-3.5 h-3.5" />}
                        {booking.status === 'PENDING' ? 'Pending Allocation' :
                         booking.status === 'ASSIGNED' ? 'Allocated' :
                         booking.status === 'COMPLETED' ? 'Completed' :
                         booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {booking.review ? (
                        <div className="flex items-center gap-1 group relative cursor-help">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-700">{booking.review.rating}</span>
                          {booking.review.comment && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                              "{booking.review.comment}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/bookings/${booking.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
